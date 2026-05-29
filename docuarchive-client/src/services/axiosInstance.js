import axios from "axios";
import { getToken } from "./authService";

const axiosInstance = axios.create({
  baseURL: "https://localhost:7292/api",
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;