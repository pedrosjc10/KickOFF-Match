// src/controllers/LocalController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../config/database"; // Ajuste o caminho conforme necessário
import { Local } from "../models/Local";

export class LocalController {
  static async create(req: Request, res: Response) {
    try {
      const { nome, cidade } = req.body;
      const repo = AppDataSource.getRepository(Local);

      const localExistente = await repo.findOne({ where: { nome, cidade } });
      if (localExistente) {
        return res.status(400).json({ error: "Local já cadastrado" });
      }

      const novoLocal = repo.create({ nome, cidade });
      const localCriado = await repo.save(novoLocal);
      return res.status(201).json(localCriado);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar local" });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Local);
      const locais = await repo.find();
      return res.json(locais);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar locais" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(Local);
      const local = await repo.findOne({ where: { id: Number(id) } });
      if (!local) {
        return res.status(404).json({ error: "Local não encontrado" });
      }
      return res.json(local);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar local" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome, cidade } = req.body;
      const repo = AppDataSource.getRepository(Local);

      const local = await repo.findOne({ where: { id: Number(id) } });
      if (!local) {
        return res.status(404).json({ error: "Local não encontrado" });
      }

      local.nome = nome ?? local.nome;
      local.cidade = cidade ?? local.cidade;

      const localAtualizado = await repo.save(local);
      return res.json(localAtualizado);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao atualizar local" });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(Local);

      const result = await repo.delete(Number(id));
      if (result.affected === 0) {
        return res.status(404).json({ error: "Local não encontrado" });
      }

      const remaining = await repo.count();
      if (remaining === 0) {
        await repo.query("ALTER TABLE local AUTO_INCREMENT = 1");
      }

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao deletar local" });
    }
  }
}
