import { JSX, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getToken } from '../services/authServices';
import { useUserStore } from '../stores/userStore';
import { getUserById } from '../services/usuarioService';

interface Props {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: Props) => {
  const { usuario, setUsuario } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!usuario && userId) {
      getUserById(userId).then((response) => {
        setUsuario(response);
      });
    }

    setIsAuthenticated(true);
    setIsLoading(false);
  }, [usuario, setUsuario]);

  if (isLoading) return null; // ou um loading spinner se preferir

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
