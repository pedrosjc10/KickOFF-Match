// src/controllers/UsuarioController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../config/database"; // Ajuste o caminho conforme necessário
import { Usuario } from "../models/Usuario";

export class UsuarioController {
  static async create(req: Request, res: Response) {
    try {
      const { nome, email, senha } = req.body;
      const repo = AppDataSource.getRepository(Usuario);

      const emailExistente = await repo.findOne({ where: { email } });
      if (emailExistente) {
        return res.status(400).json({ error: "Email já cadastrado" });
      }

      const novoUsuario = repo.create({ nome, email, senha });
      const usuarioCriado = await repo.save(novoUsuario);
      return res.status(201).json(usuarioCriado);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar usuário" });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Usuario);
      const usuarios = await repo.find();
      return res.json(usuarios);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar usuários" });
    }
  }

  static async getById(req: Request, res: Response) {
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

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome, email, senha } = req.body;
      const repo = AppDataSource.getRepository(Usuario);

      const usuario = await repo.findOne({ where: { id: Number(id) } });
      if (!usuario) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      if (email && email !== usuario.email) {
        const emailExistente = await repo.findOne({ where: { email } });
        if (emailExistente) {
          return res.status(400).json({ error: "Email já cadastrado por outro usuário" });
        }
      }

      usuario.nome = nome ?? usuario.nome;
      usuario.email = email ?? usuario.email;
      usuario.senha = senha ?? usuario.senha;

      const usuarioAtualizado = await repo.save(usuario);
      return res.json(usuarioAtualizado);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao atualizar usuário" });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(Usuario);

      const result = await repo.delete(Number(id));
      if (result.affected === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const remaining = await repo.count();
      if (remaining === 0) {
        await repo.query("ALTER TABLE usuario AUTO_INCREMENT = 1");
      }

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao deletar usuário" });
    }
  }
}
