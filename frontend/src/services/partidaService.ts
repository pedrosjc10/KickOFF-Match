import api from "../api/api";
import { NovoLocal } from "./localService";

// Tipo do enum usado no backend
export type TipoEnum = "privado" | "publico";

export interface NovaPartida {
  nome: string;
  tipo: TipoEnum; // continua string, mas agora batendo com o enum
  data: string; // formato YYYY-MM-DD
  hora: string; // formato HH:MM
  local_id: number;
  tipoPartida_id: number;
  organizador: boolean;
}

export interface Jogador {
  id: number;
  nome: string;
  confirmado: boolean;
  organizador: boolean;
  jog_linha: boolean;
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
  tipo: TipoEnum; // também string aqui, já que o transformer converte
  local?: NovoLocal[];
  jogadores?: Jogador[];
  times?: Time[];
}

// Cria nova partidas
export const criarPartida = async (novaPartida: NovaPartida) => {
  const response = await api.post('/meusrachas', novaPartida);
  return response.data;
};

// Buscar partidas públicas
export const buscarPartidasPublicas = async (): Promise<PartidaDetalhes[]> => {
  const response = await api.get<PartidaDetalhes[]>("/meusrachas/publicas");
  return response.data;
};

// Buscar detalhes de uma partida
export const buscarDetalhesPartida = async (id: string): Promise<PartidaDetalhes> => {
  const response = await api.get(`/meusrachas/${id}`);
  return response.data;
};

// Confirmar presença
export const confirmarPresenca = async (id: string, jog_linha: boolean) => {
  const response = await api.put(`/partidaUsuario/${id}`, {
    jog_linha,
    confirmado: true,
  });
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

