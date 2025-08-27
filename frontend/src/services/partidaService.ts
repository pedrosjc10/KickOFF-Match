import api from "../api/api";
import { NovoLocal } from "./localService";

// Agora os campos batem com o backend
export interface NovaPartida {
  nome: string;
  tipo: "privado" | "publico";
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
  tipo: string;
  local?: NovoLocal[];
  jogadores?: Jogador[];
  times?: Time[];
}

export const criarPartida = async (novaPartida: NovaPartida) => {
  const response = await api.post('/meusrachas', novaPartida);
  return response.data;
};

export const buscarPartidasPublicas = async (): Promise<PartidaDetalhes[]> => {
  const response = await api.get<PartidaDetalhes[]>("/partidas/publicas");
  return response.data;
};

export const buscarDetalhesPartida = async (id: string): Promise<PartidaDetalhes> => {
  const response = await api.get(`/meusrachas/${id}`);
  return response.data;
};

export const confirmarPresenca = async (id: string, jog_linha: boolean) => {
  const response = await api.put(`/partidaUsuario/${id}`, {
    jog_linha,
    confirmado: true,
  });
  return response.data;
};

export const buscarRachasQueParticipo = async (userId: number) => {
  const response = await api.get(`/meusrachas/participando/${userId}`);
  return response.data;
};

export const buscarRelacaoPartidaUsuario = async (usuarioId: number, partidaId: number) => {
  const response = await api.get(`/partidaUsuario/${usuarioId}/${partidaId}`);
  return response.data;
};
