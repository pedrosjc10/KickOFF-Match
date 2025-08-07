// src/services/authServices.ts
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL; // ajuste se necessário

interface LoginResponse {
  token: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
  };
}

export const login = async (email: string, senha: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, senha }); 
    const data = response.data;

    if (!data.token || !data.usuario){
      throw new Error('Resposta inválida');
    }

    const { token, usuario } = response.data;

    if (token) {
      localStorage.setItem('token', token);
    }
    if (usuario) {
      localStorage.setItem('userId', usuario.id);
    }

    return { token, usuario };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const getToken = () => {
  return localStorage.getItem('token');
};


