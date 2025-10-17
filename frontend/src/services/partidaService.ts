import api from "../api/api";
import { NovoLocal } from "./localService";

// Tipo do enum usado no backend

export interface NovaPartida {
  nome: string;
  data: string; // YYYY-MM-DD
  hora: string; // HH:MM
  local_id: number;
  tipoPartida_id: number;
  organizador: boolean;
}

export interface Jogador {
  id: number;
  nome: string;
  confirmado: boolean; // 0 | 1 or boolean
  organizador: boolean; // 0 | 1 or boolean
  jog_linha: boolean; // 0 | 1 or boolean
  habilidade?: number; 
}

export interface Time {
    nome: string;
    jogadores: Jogador[];
    mediaHabilidade: number;
    substitutos?: { vaga: number; opcoes: { jogadorId: number, nome: string }[] };
}

export interface PartidaDetalhes {
  id: number;
  nome: string;
  data: string;
  hora: string;
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
export const buscarPartidas = async (): Promise<PartidaDetalhes[]> => {
  const response = await api.get<PartidaDetalhes[]>("/meusrachas");
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
export const atualizarPartidaUsuario = async (usuarioId: number | string, partidaId: number | string, dados: Partial<{ jog_linha: boolean; confirmado: boolean; habilidade: number }>) => {
  const response = await api.put(`/partidaUsuario/${usuarioId}/${partidaId}`, dados);
  return response.data;
};

// Buscar confirmados (rota no backend)
export const buscarConfirmados = async (id: number) => {
  const response = await api.get<Jogador[]>(`/partidaUsuario/${id}/confirmados`);
  return response.data;
};

export const buscarTodosParticipantes = async (id: number) => {
  const response = await api.get<Jogador[]>(`/partidaUsuario/${id}/todos`);
  return response.data;
};

export const sortearTimes = async (partidaId: number): Promise<Time[]> => {
    // Usamos POST porque é uma ação, mas não salvamos aqui.
    const response = await api.post<Time[]>(`/partidaUsuario/${partidaId}/sortearTimes`);
    return response.data;
};

/**
 * Verifica se o usuário é organizador da partida.
 * Retorna true se for organizador, false caso contrário.
 */
export const verificarSeOrganizador = async (usuarioId: number, partidaId: number): Promise<boolean> => {
  const response = await api.get(`/partidaUsuario/${usuarioId}/${partidaId}/organizador`);
  // O backend retorna o registro da relação, incluindo o campo 'organizador'
  return !!response.data.organizador;
};

export const leavePartida = async (usuarioId: number) => {
  const response = await api.delete(`/partidaUsuario/${usuarioId}/dbyid`);
  return response.data;
};
