import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://fleetdash-1.onrender.com/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - attach auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // Unauthorized - clear token and redirect to login
      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";
      }

      // Server error
      if (status >= 500) {
        console.error(
          "Server error:",
          error.response.data?.message
        );
      }
    } else if (error.request) {
      console.error(
        "Network error: No response received from server"
      );
    }

    return Promise.reject(error);
  }
);

export default API;