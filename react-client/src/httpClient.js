import axios from "axios";
import { useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: '/api',  // 'http://34.129.37.135:5000',
  withCredentials: true,
});

// Redirect to home if 401 received
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== "/") {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;