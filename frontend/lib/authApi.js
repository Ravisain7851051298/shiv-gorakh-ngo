import axios from "axios";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ;

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let authStore;
let refreshPromise;
let interceptorsInstalled = false;

export function installAuthInterceptors(store) {
  authStore = store;
  if (interceptorsInstalled) return;
  interceptorsInstalled = true;

  api.interceptors.request.use((config) => {
    const accessToken = authStore?.getState().auth.accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const isAuthEntryRequest =
        originalRequest?.url?.match(/\/auth\/(login|register)$/);
      const isRefreshRequest =
        originalRequest?.url?.match(/\/auth\/refresh-token$/);

      if (error.response?.status !== 401 || !originalRequest) {
        return Promise.reject(error);
      }

      if (isAuthEntryRequest || isRefreshRequest) return Promise.reject(error);
      if (originalRequest._retry) {
        authStore.dispatch({ type: "auth/clearSession" });
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      let accessToken;
      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${apiBaseUrl}/api/v1/auth/refresh-token`, {}, { withCredentials: true })
            .then(({ data }) => {
              authStore.dispatch({ type: "auth/setSession", payload: data });
              return data.accessToken;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }
        accessToken = await refreshPromise;
      } catch (refreshError) {
        authStore.dispatch({ type: "auth/clearSession" });
        return Promise.reject(refreshError);
      }

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    },
  );
}

export function getApiImageUrl(path) {
  if (!path || typeof path !== "string") return "";
  if (/^(?:https?:)?\/\//i.test(path)) return path;
  const cleanPath = path.startsWith("/public/") ? path.replace(/^\/public/, "") : path;
  if (
    cleanPath.startsWith("/services/") ||
    cleanPath.startsWith("/videos/") ||
    cleanPath.startsWith("/founders/") ||
    cleanPath.startsWith("/documents/") ||
    cleanPath.startsWith("/static/")
  ) {
    return cleanPath;
  }
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");
  return `${baseUrl}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
}

export default api;
