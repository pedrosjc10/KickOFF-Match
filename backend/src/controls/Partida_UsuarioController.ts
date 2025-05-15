// src/controllers/PartidaUsuarioController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { PartidaUsuario } from "../models/PartidaUsuario";

export class PartidaUsuarioController {
  static async create(req: Request, res: Response) {
    try {
      const { confirmado } = req.body;
      const repo = AppDataSource.getRepository(PartidaUsuario);

      const novaAssociacao = repo.create({
        confirmado
      });

      const resultado = await repo.save(novaAssociacao);
      return res.status(201).json(resultado);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar vínculo entre partida e usuário" });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(PartidaUsuario);
      const registros = await repo.find({ relations: ["partida", "usuario"] });
      return res.json(registros);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar dados" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(PartidaUsuario);
      const registro = await repo.findOne({
        where: { id: Number(id) },
        relations: ["partida", "usuario"]
      });

      if (!registro) {
        return res.status(404).json({ error: "Registro não encontrado" });
      }

      return res.json(registro);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar registro" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { confirmado } = req.body;

      const repo = AppDataSource.getRepository(PartidaUsuario);
      const registro = await repo.findOne({ where: { id: Number(id) } });

      if (!registro) {
        return res.status(404).json({ error: "Registro não encontrado" });
      }

      registro.confirmado = confirmado ?? registro.confirmado;

      const atualizado = await repo.save(registro);
      return res.json(atualizado);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao atualizar" });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(PartidaUsuario);

      const resultado = await repo.delete(Number(id));
      if (resultado.affected === 0) {
        return res.status(404).json({ error: "Registro não encontrado" });
      }

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao deletar" });
    }
  }
}