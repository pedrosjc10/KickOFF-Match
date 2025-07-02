// src/components/AuthLoader.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../services/authServices';
import { useUserStore } from '../stores/userStore';
import axios from '../api/api';

const AuthLoader: React.FC = () => {
  const navigate = useNavigate();
  const { setUsuario } = useUserStore();

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const userId = localStorage.getItem('userId');
        const response = await axios.get(`/usuarios/${userId}`);
        setUsuario(response.data);
        navigate('/meusrachas');
      } catch (error) {
        console.error('Token inválido ou usuário não encontrado:', error);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate, setUsuario]);

  return <p>Carregando...</p>; // Pode mostrar um spinner se quiser
};

export default AuthLoader;
