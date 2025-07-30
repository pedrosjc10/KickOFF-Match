import api from "../api/api";

export interface NovaPartida {
  nome: string;
  local: string;
  diaSemana: string;
  horarioInicio: string;
  duracao: string;
  vagas: string;
  privado: string;
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

export interface Local {
  nome: string;
  endereco: string;
}

export interface PartidaDetalhes {
  id: number;
  nome: string;
  data: string;
  hora: string;
  local: Local;
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

/*export const sortearTimes = async (id: string) => {
  const response = await api.post(`/partidas/${id}/sortear`);
  return response.data;
};8*/

export const buscarRachasQueParticipo = async (userId: number) => {
  const response = await api.get(`/meusrachas/participando/${userId}`);
  return response.data;
};

export const buscarRelacaoPartidaUsuario = async (usuarioId: number, partidaId: number) => {
  const response = await api.get(`/partidaUsuario/${usuarioId}/${partidaId}`);
  return response.data;
};