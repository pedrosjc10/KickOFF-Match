// src/controllers/UsuarioController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../config/database"; // Ajuste o caminho conforme necessário
import { Usuario } from "../models/Usuario";

export class UsuarioController {
  static async createUser(req: Request, res: Response) {
    try {
      const { nome, email, senha } = req.body;
      const repo = AppDataSource.getRepository(Usuario);
      const novoUsuario = repo.create({ nome, email, senha });
      const usuarioCriado = await repo.save(novoUsuario);
      return res.status(201).json(usuarioCriado);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar usuário" });
    }
  }

  static async getAllUsers(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Usuario);
      const usuarios = await repo.find();
      return res.json(usuarios);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar usuários" });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(Usuario);
      const usuario = await repo.findOne({ where: { id: Number(id) } });
      if (!usuario) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      return res.json(usuario);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar usuário" });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(Usuario);
      const result = await repo.delete(Number(id));
      if (result.affected === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao deletar usuário" });
    }
  }
}
