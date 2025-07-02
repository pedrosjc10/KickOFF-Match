import { create } from "zustand";

interface Usuario {
  id: number;
  nome: string;
  email: string;
}

interface UserStore {
  usuario: Usuario | null;
  setUsuario: (usuario: Usuario) => void;
  limparUsuario: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  usuario: null,
  setUsuario: (usuario) => set({ usuario }),
  limparUsuario: () => set({ usuario: null }),
}));
