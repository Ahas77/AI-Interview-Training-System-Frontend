import axios from 'axios';
import { toast } from 'react-toastify';
import { defaultConfig } from "../configs/common";
import { getAuthToken, clearAuthStorage } from "./authStorage";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: `${defaultConfig.BASE_API_URL}`, // Your API base URL\

  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding Bearer token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const authToken = getAuthToken();
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        clearAuthStorage();
        window.location.href = '/';
      } else if (error.response?.status === 403) {
        toast.error('Access forbidden. You do not have permission.');
        window.location.href = '/';
      } else if (error.response?.status === 500) {
        toast.error('Internal Server Error. Please try again later.');
      }
    } else if (error instanceof Error) {
      toast.error('An unexpected error occurred: ' + error.message);
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
