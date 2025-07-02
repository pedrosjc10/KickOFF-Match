import axios from "../api/api";

interface NovaPartida {
  nome: string;
  local: string;
  diaSemana: string;
  horarioInicio: string;
  duracao: string;
  vagas: string;
  privado: string;
  organizador: boolean;
}

export const criarPartida = async (novaPartida: NovaPartida) => {
  const response = await axios.post('/partida', novaPartida);
  return response.data;
};
