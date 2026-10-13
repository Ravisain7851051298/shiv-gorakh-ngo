import axios from "axios";

const authBaseUrl = (
  process.env.NEXT_PUBLIC_API_URL || "https://api.shivgorakh.org.in/api/v1"
).replace(/\/+$/, "");
const contentBaseUrl = (
  process.env.NEXT_PUBLIC_API_URL || "https://api.shivgorakh.org.in/api/v1"
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

export function executeRefreshToken() {
  if (!refreshRequest) {
    const headers = {};
    if (typeof window !== "undefined") {
      const storedRefreshToken = window.localStorage.getItem("admin_refresh_token");
      if (storedRefreshToken) {
        headers["x-refresh-token"] = storedRefreshToken;
      }
    }

    refreshRequest = api
      .post("/refresh-token", {}, { headers })
      .then(({ data }) => {
        if (
          data?.success === false ||
          !data?.user ||
          typeof data.accessToken !== "string" ||
          !data.accessToken
        ) {
          throw new Error(data?.message || "The authentication server returned an invalid session.");
        }
        if (typeof window !== "undefined" && data?.refreshToken) {
          window.localStorage.setItem("admin_refresh_token", data.refreshToken);
        }
        if (authStore) {
          authStore.dispatch({ type: "auth/setSession", payload: data });
        }
        return data;
      })
      .catch((refreshError) => {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("admin_refresh_token");
        }
        if (authStore) {
          authStore.dispatch({ type: "auth/clearSession" });
        }
        throw new Error(errorMessage(refreshError));
      })
      .finally(() => {
        refreshRequest = null;
      });
  }
  return refreshRequest;
}

function installClientInterceptors(client) {
  client.interceptors.request.use((config) => {
    const accessToken = authStore?.getState().auth.accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    if (typeof window !== "undefined") {
      const storedRefreshToken = window.localStorage.getItem("admin_refresh_token");
      if (storedRefreshToken && !config.headers["x-refresh-token"]) {
        config.headers["x-refresh-token"] = storedRefreshToken;
      }
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
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("admin_refresh_token");
        }
        authStore?.dispatch({ type: "auth/clearSession" });
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
        const sessionData = await executeRefreshToken();
        request.headers.Authorization = `Bearer ${sessionData.accessToken}`;
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
