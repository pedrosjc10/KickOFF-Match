import api from "../api/api";

// Tipo do enum usado no backend
export type TipoEnum = "privado" | "publico";

export interface NovaPartida {
  nome: string;
  tipo: TipoEnum;
  data: string;
  hora: string;
  local_id: number;
  tipoPartida_id: number;
  organizador: boolean;
}

export interface Usuario {
  id: number;
  nome: string;
<<<<<<< HEAD
  confirmado: number | boolean; // pode ser 0, 1, true ou false
  organizador: boolean;
  jog_linha: boolean;
=======
}

export interface Jogador {
  id: number;
  usuario: Usuario;
  confirmado: number | boolean; // 0/1 ou true/false
  organizador: boolean | number;
  jog_linha: boolean | number;
>>>>>>> 92530273af90d462bdd3346451c0ef11d1b4d93d
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
  local?: { nome: string; cidade: string };
  jogadores?: Jogador[];
  tipoPartida?: { quantidadeJogadores: number };
  times?: Time[];
}

// Criar partida
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
export const buscarDetalhesPartida = async (id: string): Promise<PartidaDetalhes> => {
  const response = await api.get(`/meusrachas/${id}`);
  return response.data;
};

// Buscar jogadores de uma partida
export const buscarJogadores = async (partidaId: string): Promise<Jogador[]> => {
  const response = await api.get(`/partidaUsuario`);
  return response.data.filter((pu: any) => pu.partida.id === Number(partidaId));
};

// Confirmar presença
export const confirmarPresenca = async (id: string, jog_linha: boolean) => {
  const response = await api.put(`/partidaUsuario/${id}`, {
    jog_linha,
    confirmado: true,
  });
  return response.data;
};

// Participar de uma partida
export const participarPartida = async (id: number) => {
  const response = await api.post(`/meusrachas/${id}/participar`);
  return response.data;
};

// Atualizar data e hora da partida
export const atualizarPartida = async (id: number, data?: string, hora?: string) => {
  const body: any = {};
  if (data) body.data = data;
  if (hora) body.hora = hora;
  const response = await api.put(`/partida/${id}`, body);
  return response.data;
};

// Buscar relação partida-usuário específica
export const buscarRelacaoPartidaUsuario = async (usuarioId: number, partidaId: number) => {
  const response = await api.get(`/partidaUsuario/${usuarioId}/${partidaId}`);
  return response.data;
};

export const buscarRachasQueParticipo = async (userId: number) => {
  const response = await api.get(`/meusrachas/participando/${userId}`);
  return response.data;
}
