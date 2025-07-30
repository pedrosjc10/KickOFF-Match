import axios from 'axios';
import { getToken } from '../services/authServices';

const api = axios.create({
  baseURL: 'https://tcc-production-d707.up.railway.app',
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
