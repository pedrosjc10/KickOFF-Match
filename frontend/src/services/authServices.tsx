import axios from 'axios';

const API_URL = 'http://localhost:3000'; // Substitua pela URL do seu backend se necessário

export const login = async (email: string, senha: string) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, senha });
    const { token } = response.data;

    if (token) {
      localStorage.setItem('token', token); // Armazena o token no localStorage
    }

    return response.data;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token'); // Remove o token ao deslogar
};

export const getToken = () => {
  return localStorage.getItem('token');
};
