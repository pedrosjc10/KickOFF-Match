import axios from 'axios';
import { getToken } from '../services/authServices';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Altere se necessário
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
