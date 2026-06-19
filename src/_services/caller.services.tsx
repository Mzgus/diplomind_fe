import axios from "axios";

const API = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for catching 401/Token Expiry
API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 and we haven't retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh token using the refresh endpoint (uses cookie)
        const res = await axios.get("/api/refresh_tokens", { withCredentials: true });
        
        // If verify_token returns a new access token (hybrid approach)
        if (res.data && res.data.token) {
            localStorage.setItem("token", res.data.token);
            originalRequest.headers["Authorization"] = `Bearer ${res.data.token}`;
        } else {
             // If strictly cookie-based, we might want to strip the Auth header 
             // in case the old one is causing conflicts, or assume the cookie takes precedence.
             // For now, let's assume if no token returned, we rely on cookie, 
             // but we shouldn't send the expired header if possible.
             // originalRequest.headers["Authorization"] = ""; // Optional: might break specific backends
        }

        // Return API call with updated config
        return API(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login or handle logout
        // Clean local storage if used
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default API;
