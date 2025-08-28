import api from '../api/api';

// Interface do TipoPartida vindo do backend
export interface TipoPartida {
  idtipoPartida: number; // o backend usa esse nome
  nomeTipoPartida: string;
  quantidadeJogadores: number;
}

// Interface para criar um novo tipo de partida
export interface NovoTipoPartida {
  nomeTipoPartida: string;      // corrigido pra bater com o backend
  quantidadeJogadores: number;  // corrigido pra bater com o backend
}

// Cria um novo Tipo de Partida
export const createTipoPartida = async (novoTipo: NovoTipoPartida) => {
  const response = await api.post('/tPartida', novoTipo, {
    headers: {
      'Content-Type': 'application/json', // garante que o backend receba JSON
    },
  });
  return response.data;
};

// Pega todos os Tipos de Partida
export const getTiposPartida = async () => {
  const response = await api.get('/tPartida');
  return response.data;
};
