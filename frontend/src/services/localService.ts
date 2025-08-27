import api from "../api/api";


export const createLocal = async (data: {
  nome: string;
  cidade: string;
  tipo: string;
  modalidade: string;
  cep: string;
  logradouro: string;
  numero: string;
}) => {
  const response = await api.post('/local', data); // Ajuste a rota se necessário
  return response.data;
};

export const getLocais = async () => {
  const response = await api.get('/local');
  return response.data;
};
