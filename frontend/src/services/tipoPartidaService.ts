import axios from 'axios';

export const createTipoPartida = async (data: {
  nomeTipoPartida: string;
  quantidadeJogadores: number;
}) => {
  const response = await axios.post('/api/tipopartida', data); // Ajuste a rota se necessário
  return response.data;
};

export const getTiposPartida = async () => {
  const response = await axios.get('/api/tipopartida');
  return response.data;
};
