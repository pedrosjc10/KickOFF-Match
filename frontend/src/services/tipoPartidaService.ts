import api from '../api/api';

export const createTipoPartida = async (data: {
  nomeTipoPartida: string;
  quantidadeJogadores: number;
}) => {
  const response = await api.post('/api/tpartida', data); // Ajuste a rota se necessário
  return response.data;
};

export const getTiposPartida = async () => {
  const response = await api.get('/api/tpartida');
  return response.data;
};
