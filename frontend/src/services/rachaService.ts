import api from "../api/api";

export const buscarRachasQueParticipo = async (userId: number) => {
  const response = await api.get(`/meusrachas/participando/${userId}`);
  return response.data;
};
