// src/services/authServices.ts
import api from '../api/api';

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
    const response = await api.post(`/login`, { email, senha }); 
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


