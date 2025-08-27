import api from '../api/api';

export interface TipoPartida {
  id: number;
  nome: string;
}

export const createTipoPartida = async () => {
  const response = await api.post('/tPartida');
  return response.data;
};

export const getTiposPartida = async () => {
  const response = await api.get('/tPartida');
  return response.data;
};
