// src/components/ProtectedRoute.tsx
import React, { JSX, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getToken } from '../services/authServices';
import { useUserStore } from '../stores/userStore';
import { getUserById } from '../services/usuarioService';

interface Props {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { usuario, setUsuario } = useUserStore();

  useEffect(() => {
    const token = getToken();
    if (!token) return;


    const userId = localStorage.getItem('userId');
    if (!usuario && userId) {
        getUserById(userId)
        .then (response => {
          setUsuario(response);
        })
    }
  }, [usuario, setUsuario]);

  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;