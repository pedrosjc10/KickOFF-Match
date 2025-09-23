import api from "../api/api";
import { NovoLocal } from "./localService";

// Tipo do enum usado no backend
export type TipoEnum = "privado" | "publico";

export interface NovaPartida {
  nome: string;
  tipo: TipoEnum;
  data: string; // YYYY-MM-DD
  hora: string; // HH:MM
  local_id: number;
  tipoPartida_id: number;
  organizador: boolean;
}

export interface Jogador {
  id: number;
  nome: string;
  confirmado: number | boolean; // 0 | 1 or boolean
  organizador: number | boolean; // 0 | 1 or boolean
  jog_linha: number | boolean; // 0 | 1 or boolean
}

export interface Time {
  nome: string;
  jogadores: Jogador[];
}

export interface PartidaDetalhes {
  id: number;
  nome: string;
  data: string;
  hora: string;
  tipo: TipoEnum;
  local?: NovoLocal[] | any;
  jogadores?: Jogador[]; // pode vir do backend ou construído no front
  times?: Time[];
  tipoPartida?: {
    id?: number;
    nometipopartida?: string;
    quantidadejogadores?: number; // por time
  };
}

// Cria nova partidas
export const criarPartida = async (novaPartida: NovaPartida) => {
  const response = await api.post("/meusrachas", novaPartida);
  return response.data;
};

// Buscar partidas públicas
export const buscarPartidasPublicas = async (): Promise<PartidaDetalhes[]> => {
  const response = await api.get<PartidaDetalhes[]>("/meusrachas/publicas");
  return response.data;
};

// Buscar detalhes de uma partida
export const buscarDetalhesPartida = async (
  id: string
): Promise<PartidaDetalhes> => {
  const response = await api.get(`/meusrachas/${id}`);
  return response.data;
};

// Atualizar partida (data/hora/tipo/nome etc)
export const atualizarPartida = async (id: number, dados: Partial<PartidaDetalhes>) => {
  const response = await api.put(`/meusrachas/${id}`, dados);
  return response.data;
};

// Buscar rachas que o usuário participa
export const buscarRachasQueParticipo = async (userId: number) => {
  const response = await api.get(`/meusrachas/participando/${userId}`);
  return response.data;
};

// Buscar relação partida-usuario
export const buscarRelacaoPartidaUsuario = async (usuarioId: number, partidaId: number) => {
  const response = await api.get(`/partidaUsuario/${usuarioId}/${partidaId}`);
  return response.data;
};

export const participarPartida = async (id: number) => {
  const response = await api.post(`/meusrachas/${id}/participar`);
  return response.data;
};

export const confirmarPresenca = async (id: string, jog_linha: boolean) => {
  const response = await api.put(`/partidaUsuario/${id}`, {
    jog_linha,
    confirmado: 1, // smallint 1
  });
  return response.data;
};

// Atualiza um registro partidaUsuario (ex: só jog_linha ou confirmado)
export const atualizarPartidaUsuario = async (id: number | string, dados: Partial<{ jog_linha: number | boolean; confirmado: number | boolean }>) => {
  const response = await api.put(`/partidaUsuario/${id}`, dados);
  return response.data;
};

// Buscar confirmados (rota no backend)
export const buscarConfirmados = async (id: number) => {
  const response = await api.get<Jogador[]>(`/partidaUsuario/${id}/confirmados`);
  return response.data;
};

export const buscarTodosParticipantes = async (id: number) => {
  const response = await api.get<Jogador[]>(`/partidausuario/${id}/todos`);
  return response.data;
};
