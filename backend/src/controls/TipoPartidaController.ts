import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { TipoPartida } from "../models/TipoPartida";

export class TipoPartidaController {
  static async create(req: Request, res: Response) {
    try {
      const { nomeTipoPartida, quantidadeJogadores } = req.body;
      const repo = AppDataSource.getRepository(TipoPartida);

      const novaTipoPartida = repo.create({ nomeTipoPartida, quantidadeJogadores });
      const tipoPartidaCriada = await repo.save(novaTipoPartida);

      return res.status(201).json(tipoPartidaCriada);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar tipo de partida" });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(TipoPartida);
      const tipos = await repo.find();
      return res.json(tipos);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar tipos de partida" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(TipoPartida);

      const tipoPartida = await repo.findOne({ where: { idtipoPartida: Number(id) } });
      if (!tipoPartida) {
        return res.status(404).json({ error: "Tipo de partida não encontrado" });
      }

      return res.json(tipoPartida);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar tipo de partida" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nomeTipoPartida, quantidadeJogadores } = req.body;
      const repo = AppDataSource.getRepository(TipoPartida);

      const tipoPartida = await repo.findOneBy({ idtipoPartida: Number(id) });
      if (!tipoPartida) {
        return res.status(404).json({ error: "Tipo de partida não encontrado" });
      }

      tipoPartida.nomeTipoPartida = nomeTipoPartida ?? tipoPartida.nomeTipoPartida;
      tipoPartida.quantidadeJogadores = quantidadeJogadores ?? tipoPartida.quantidadeJogadores;

      const tipoPartidaAtualizada = await repo.save(tipoPartida);
      return res.json(tipoPartidaAtualizada);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao atualizar tipo de partida" });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(TipoPartida);

      const result = await repo.delete(Number(id));
      if (result.affected === 0) {
        return res.status(404).json({ error: "Tipo de partida não encontrado" });
      }

      const remaining = await repo.count();
      if (remaining === 0) {
        await repo.query("ALTER TABLE tipopartida AUTO_INCREMENT = 1");
      }

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao deletar tipo de partida" });
    }
  }
}
