import axios from "../api/api";

interface NovoUsuario {
  nome: string;
  email: string;
  senha: string;
}

export const cadastrarUsuario = async (usuario: NovoUsuario) => {
  const response = await axios.post('/usuarios', usuario);
  return response.data;
};
export const getUserById = async (userId: string) => {
  const response = await axios.get(`/usuarios/${userId}`);
  return response.data;
};
