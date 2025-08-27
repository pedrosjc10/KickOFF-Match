import api from '../api/api';


export interface TipoPartida {
  id: number;
  nome: string;
  quantidadeJogadores?: number;
}

export interface NovoTipoPartida {
  nometipopartida: string;
  quantidadejogadores: number;
}

export const createTipoPartida = async (novoTipo: NovoTipoPartida) => {
  const response = await api.post('/tPartida', novoTipo);
  return response.data;
};

export const getTiposPartida = async () => {
  const response = await api.get('/tPartida');
  return response.data;
};
