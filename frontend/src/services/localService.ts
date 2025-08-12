import axios from 'axios';

export const createLocal = async (data: {
  nome: string;
  cidade: string;
  tipo: string;
  modalidade: string;
  cep: string;
  logradouro: string;
  numero: string;
}) => {
  const response = await axios.post('/api/local', data); // Ajuste a rota se necessário
  return response.data;
};

export const getLocais = async () => {
  const response = await axios.get('/api/local');
  return response.data;
};
