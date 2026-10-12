import axios from "axios";

const authBaseUrl = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
).replace(/\/+$/, "");
const contentBaseUrl = (
  process.env.NEXT_PUBLIC_CONTENT_API_URL ||
  "http://localhost:8000/api/v1"
).replace(/\/+$/, "");
const apiBaseUrl = authBaseUrl.endsWith("/admin")
  ? authBaseUrl
  : `${authBaseUrl}/admin`;

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const contentApi = axios.create({
  baseURL: contentBaseUrl.replace(/\/admin$/, ""),
  withCredentials: true,
});

export function getContentImageUrl(path) {
  if (!path || typeof path !== "string") return "";
  if (/^(?:https?:)?\/\//i.test(path)) return path;
  const baseUrl = contentBaseUrl.replace(/\/admin$/, "");
  return new URL(path.startsWith("/") ? path : `/${path}`, baseUrl).toString();
}

let authStore;
let refreshRequest;
let installed = false;

function errorMessage(error) {
  return error.response?.data?.message || error.message || "The request failed.";
}

function installClientInterceptors(client) {
  client.interceptors.request.use((config) => {
    const accessToken = authStore?.getState().auth.accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const request = error.config;
      const requestUrl = request?.url || "";
      const isRefreshCall = /\/refresh-token(?:\?|$)/.test(requestUrl);
      const isAuthEntryRequest = /\/(?:login|register)(?:\?|$)/.test(requestUrl);
      if (error.response?.status === 401 && request?._retry) {
        authStore.dispatch({ type: "auth/clearSession" });
        return Promise.reject(error);
      }
      if (
        error.response?.status !== 401 ||
        !request ||
        request._retry ||
        isRefreshCall ||
        isAuthEntryRequest
      ) {
        return Promise.reject(error);
      }

      request._retry = true;
      try {
        if (!refreshRequest) {
          refreshRequest = api
            .post("/refresh-token")
            .then(({ data }) => {
              if (
                data?.success === false ||
                !data?.user ||
                typeof data.accessToken !== "string" ||
                !data.accessToken
              ) {
                throw new Error(data?.message || "The authentication server returned an invalid session.");
              }
              authStore.dispatch({ type: "auth/setSession", payload: data });
              return data.accessToken;
            })
            .catch((refreshError) => {
              authStore.dispatch({ type: "auth/clearSession" });
              throw new Error(errorMessage(refreshError));
            })
            .finally(() => {
              refreshRequest = null;
            });
        }

        const accessToken = await refreshRequest;
        request.headers.Authorization = `Bearer ${accessToken}`;
        return client(request);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    },
  );
}

export function installAuthInterceptors(store) {
  authStore = store;
  if (installed) return;
  installed = true;
  installClientInterceptors(api);
  installClientInterceptors(contentApi);
}
