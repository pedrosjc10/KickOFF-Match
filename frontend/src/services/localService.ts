import api from "../api/api";

export interface NovoLocal {
  id?: number;
  nome: string;
  cidade: string;
  tipo: string;
  modalidade: string;
  cep: string;
  logradouro: string;
  numero: string;
}

export const createLocal = async (local: NovoLocal) => {
  const response = await api.post('/local', local);
  return response.data;
};

export const getLocais = async () => {
  const response = await api.get('/local');
  return response.data;
};
