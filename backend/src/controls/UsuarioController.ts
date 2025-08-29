// src/controllers/PartidaController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Partida } from "../models/Partida";
import { Local } from "../models/Local";
import { TipoPartida } from "../models/TipoPartida";

export class PartidaController {
  static async create(req: Request, res: Response) {
    try {
      let { tipo, data, hora, nome, local_id, tipoPartida_id } = req.body;

      const tipoNum = tipo === "publico" ? 1 : 0;

      const partidaRepo = AppDataSource.getRepository(Partida);
      const localRepo = AppDataSource.getRepository(Local);
      const tipoPartidaRepo = AppDataSource.getRepository(TipoPartida);

      const local = await localRepo.findOneBy({ id: local_id });
      const tipoPartida = await tipoPartidaRepo.findOneBy({ idtipoPartida: tipoPartida_id });

      if (!local || !tipoPartida) {
        return res.status(400).json({ error: "Local ou Tipo de Partida não encontrados." });
      }

      const novaPartida = partidaRepo.create({
        tipo: tipoNum,
        data,
        hora,
        nome,
        local,
        tipoPartida,
      });

      const partidaCriada = await partidaRepo.save(novaPartida);
      return res.status(201).json(partidaCriada);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar partida" });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Partida);
      const partidas = await repo.find({ relations: ["local", "tipoPartida"] });
      return res.json(partidas);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar partidas" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(Partida);

      const partida = await repo.findOne({
        where: { id: Number(id) },
        relations: ["local", "tipoPartida"],
      });

      if (!partida) {
        return res.status(404).json({ error: "Partida não encontrada" });
      }

      return res.json(partida);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar partida" });
    }
  }

// src/controllers/PartidaController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Partida } from "../models/Partida";
import { Local } from "../models/Local";
import { TipoPartida } from "../models/TipoPartida";

export class PartidaController {
  static async create(req: Request, res: Response) {
    try {
      let { tipo, data, hora, nome, local_id, tipoPartida_id } = req.body;

      const tipoNum = tipo === "publico" ? 1 : 0;

      const partidaRepo = AppDataSource.getRepository(Partida);
      const localRepo = AppDataSource.getRepository(Local);
      const tipoPartidaRepo = AppDataSource.getRepository(TipoPartida);

      const local = await localRepo.findOneBy({ id: local_id });
      const tipoPartida = await tipoPartidaRepo.findOneBy({ idtipoPartida: tipoPartida_id });

      if (!local || !tipoPartida) {
        return res.status(400).json({ error: "Local ou Tipo de Partida não encontrados." });
      }

      const novaPartida = partidaRepo.create({
        tipo: tipoNum,
        data,
        hora,
        nome,
        local,
        tipoPartida,
      });

      const partidaCriada = await partidaRepo.save(novaPartida);
      return res.status(201).json(partidaCriada);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar partida" });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Partida);
      const partidas = await repo.find({ relations: ["local", "tipoPartida"] });
      return res.json(partidas);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar partidas" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(Partida);

      const partida = await repo.findOne({
        where: { id: Number(id) },
        relations: ["local", "tipoPartida"],
      });

      if (!partida) {
        return res.status(404).json({ error: "Partida não encontrada" });
      }

      return res.json(partida);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar partida" });
    }
  }

  static async getMeusRachas(req: Request, res: Response) {
    try {
      const usuarioId = Number(req.usuario?.id);

      if (!usuarioId) {
        return res.status(401).json({ error: "Usuário não autenticado." });
      }

      if (isNaN(usuarioId)) {
        return res.status(400).json({ error: "ID de usuário inválido" });
      }

      const partidas = await AppDataSource
        .getRepository(Partida)
        .createQueryBuilder("partida")
        .leftJoinAndSelect("partida.partidaUsuarios", "pu")
        .leftJoinAndSelect("partida.local", "local")
        .where("pu.usuario.id = :usuarioId", { usuarioId })
        .getMany();

      return res.json(partidas);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar rachas que participa" });
    }
  }

  static async getPublicas(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Partida);

      const publicas = await repo.find({
        where: { tipo: 1 },
        relations: ["local", "tipoPartida"],
      });

      return res.json(publicas);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar partidas públicas" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      let { tipo, data, hora, nome, local_id, tipoPartida_id } = req.body;

      const partidaRepo = AppDataSource.getRepository(Partida);
      const localRepo = AppDataSource.getRepository(Local);
      const tipoPartidaRepo = AppDataSource.getRepository(TipoPartida);

      const partida = await partidaRepo.findOneBy({ id: Number(id) });
      if (!partida) {
        return res.status(404).json({ error: "Partida não encontrada" });
      }

      const local = await localRepo.findOneBy({ id: local_id });
      const tipoPartida = await tipoPartidaRepo.findOneBy({ idtipoPartida: tipoPartida_id });

      if (!local || !tipoPartida) {
        return res.status(400).json({ error: "Local ou Tipo de Partida inválidos." });
      }

      const tipoNum = tipo === "publico" ? 1 : 0;

      partida.tipo = tipoNum;
      partida.data = data;
      partida.hora = hora;
      partida.nome = nome;
      partida.local = local;
      partida.tipoPartida = tipoPartida;

      const partidaAtualizada = await partidaRepo.save(partida);
      return res.json(partidaAtualizada);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao atualizar partida" });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(Partida);

      const result = await repo.delete(Number(id));
      if (result.affected === 0) {
        return res.status(404).json({ error: "Partida não encontrada" });
      }

      const remaining = await repo.count();
      if (remaining === 0) {
        await repo.query("ALTER TABLE partida AUTO_INCREMENT = 1");
      }

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao deletar partida" });
    }
  }
}


