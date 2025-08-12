import api from "../api/api";

interface NovoUsuario {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
}

export const cadastrarUsuario = async (usuario: NovoUsuario) => {
  const response = await api.post('/usuarios', usuario);
  return response.data;
};
export const getUserById = async (userId: string) => {
  const response = await api.get(`/usuarios/${userId}`);
  return response.data;
};
