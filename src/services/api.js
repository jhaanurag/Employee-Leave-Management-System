import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true
});

const extractTokenFromAuthHeader = (authHeader) => {
  if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice(7);
};

const getAuthorizationHeader = (headers) => {
  if (!headers) {
    return null;
  }

  if (typeof headers.get === "function") {
    return headers.get("Authorization") || headers.get("authorization");
  }

  return headers.Authorization || headers.authorization || null;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint =
      error.config?.url?.includes("/auth/login") ||
      error.config?.url?.includes("/auth/register");

    const requestToken = extractTokenFromAuthHeader(
      getAuthorizationHeader(error.config?.headers)
    );
    const activeToken = localStorage.getItem("token");
    const isCurrentSessionRequest =
      Boolean(requestToken) &&
      Boolean(activeToken) &&
      requestToken === activeToken;

    if (
      error.response?.status === 401 &&
      !isAuthEndpoint &&
      isCurrentSessionRequest
    ) {
      window.dispatchEvent(new CustomEvent("auth:expired"));
    }

    return Promise.reject(error);
  }
);

export default api;
