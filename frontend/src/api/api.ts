import axios from 'axios';
import { getToken } from '../services/authServices';

// Acessa a variável de ambiente. 
// Para funcionar no ambiente de desenvolvimento, 
// você precisa de um arquivo .env na raiz do projeto.
// Para o deploy, a variável deve ser configurada no painel da Vercel.
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
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