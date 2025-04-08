import { createContext, useState, useEffect } from 'react';
import api from '../api/api';

interface AuthContextType {
  user: any;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);

  async function login(email: string, senha: string) {
    try {
      const response = await api.post('/login', { email, senha });
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      api.defaults.headers.Authorization = `Bearer ${response.data.token}`;
    } catch (error) {
      console.error('Erro ao fazer login', error);
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.Authorization;
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
      // Aqui poderíamos buscar os dados do usuário
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
