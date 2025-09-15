// src/services/partidaService.ts
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
  partidaUsuarioId: number; // ID da relação pivot
  usuarioId: number;
  nome: string;
  confirmado: boolean; // normalizado no front (0/1 → boolean)
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
  tipo: TipoEnum;
  local?: NovoLocal[] | any;
  jogadores?: Jogador[];
  times?: Time[];
  tipoPartida?: {
    id?: number;
    nometipopartida?: string;
    quantidadejogadores?: number; // por time
  };
}

// ---------- PARTIDAS ----------
export const criarPartida = async (novaPartida: NovaPartida) => {
  const response = await api.post("/meusrachas", novaPartida);
  return response.data;
};

export const buscarPartidasPublicas = async (): Promise<PartidaDetalhes[]> => {
  const response = await api.get<PartidaDetalhes[]>("/meusrachas/publicas");
  return response.data;
};

export const buscarDetalhesPartida = async (id: string): Promise<PartidaDetalhes> => {
  const response = await api.get(`/meusrachas/${id}`);
  return response.data;
};

export const atualizarPartida = async (id: number, dados: Partial<PartidaDetalhes>) => {
  const response = await api.put(`/meusrachas/${id}`, dados);
  return response.data;
};

export const buscarRachasQueParticipo = async (userId: number) => {
  const response = await api.get(`/meusrachas/participando/${userId}`);
  return response.data;
};

export const participarPartida = async (id: number) => {
  const response = await api.post(`/meusrachas/${id}/participar`);
  return response.data;
};

// ---------- PARTIDA-USUARIO ----------
export const buscarRelacaoPartidaUsuario = async (usuarioId: number, partidaId: number) => {
  const response = await api.get(`/partidaUsuario/${usuarioId}/${partidaId}`);
  return response.data;
};

// Confirmar presença (marca confirmado = 1 e mantém jog_linha atual)
export const confirmarPresenca = async (id: string | number, jog_linha: boolean) => {
  const response = await api.put(`/partidaUsuario/${id}`, {
    confirmado: 1,
    jog_linha,
  });
  return response.data;
};

// Atualizar campos específicos da relação pivot (confirmado ou jog_linha)
export const atualizarPartidaUsuario = async (
  id: number | string,
  dados: Partial<{ jog_linha: boolean; confirmado: boolean }>
) => {
  const response = await api.put(`/partidaUsuario/${id}`, dados);
  return response.data;
};

// Só alternar o estado de jog_linha
export const toggleJogLinha = async (id: number, jog_linha: boolean) => {
  const response = await api.put(`/partidaUsuario/${id}`, { jog_linha });
  return response.data;
};

// Buscar jogadores confirmados de uma partida
export const buscarConfirmados = async (id: number): Promise<Jogador[]> => {
  const response = await api.get<Jogador[]>(`/partidaUsuario/${id}/confirmados`);

  // normaliza smallint → boolean
  return response.data.map((j: any) => ({
    ...j,
    confirmado: !!j.confirmado,
    organizador: !!j.organizador,
    jog_linha: !!j.jog_linha,
  }));
};
