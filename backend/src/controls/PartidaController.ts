// src/controllers/PartidaController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Partida, TipoEnum } from "../models/Partida";
import { Local } from "../models/Local";
import { TipoPartida } from "../models/TipoPartida";
import { PartidaUsuario } from "../models/PartidaUsuario";

export class PartidaController {
  // src/controllers/PartidaController.ts
static async create(req: Request, res: Response) {
  try {
    let { tipo, data, hora, nome, local_id, tipoPartida_id } = req.body;

    const partidaRepo = AppDataSource.getRepository(Partida);
    const localRepo = AppDataSource.getRepository(Local);
    const tipoPartidaRepo = AppDataSource.getRepository(TipoPartida);
    const partidaUsuarioRepo = AppDataSource.getRepository(PartidaUsuario);

    const local = await localRepo.findOneBy({ id: local_id });
    const tipoPartida = await tipoPartidaRepo.findOneBy({
      idtipoPartida: tipoPartida_id,
    });

    if (!local || !tipoPartida) {
      return res
        .status(400)
        .json({ error: "Local ou Tipo de Partida não encontrados." });
    }

    // cria a partida
    const novaPartida = partidaRepo.create({
      tipo,
      data,
      hora,
      nome,
      local,
      tipoPartida,
    });

    const partidaCriada = await partidaRepo.save(novaPartida);

    // pega usuário logado
    const usuarioId = req.usuario?.id;
    if (!usuarioId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    // cria o relacionamento na tabela pivô (criador = organizador)
    const novaRelacao = partidaUsuarioRepo.create({
      confirmado: false,
      organizador: true,
      jog_linha: false, // pode ajustar conforme regra
      usuario: { id: usuarioId } as any,
      partida: partidaCriada,
    });

    await partidaUsuarioRepo.save(novaRelacao);

    return res.status(201).json({
      ...partidaCriada,
      organizador: usuarioId,
    });
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
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const repo = AppDataSource.getRepository(Partida);

      const partida = await repo.findOne({
        where: { id },
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

  static async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const partidaRepo = AppDataSource.getRepository(Partida);
      const partida = await partidaRepo.findOneBy({ id });

      if (!partida) {
        return res.status(404).json({ error: "Partida não encontrada" });
      }

      let { tipo, ...dados } = req.body;
      if (tipo) {
        dados.tipo = tipo === "publico" ? "publico" : "privado";
      }

      partidaRepo.merge(partida, dados);
      const atualizado = await partidaRepo.save(partida);

      return res.json(atualizado);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao atualizar partida" });
    }
  }


  static async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const partidaRepo = AppDataSource.getRepository(Partida);

      const resultado = await partidaRepo.delete(id);

      if (resultado.affected === 0) {
        return res.status(404).json({ error: "Partida não encontrada" });
      }

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao deletar partida" });
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

      const partidas = await AppDataSource.getRepository(Partida)
        .createQueryBuilder("partida")
        .leftJoinAndSelect("partida.partidaUsuarios", "pu")
        .leftJoinAndSelect("partida.local", "local")
        .where("pu.usuario.id = :usuarioId", { usuarioId })
        .getMany();

      return res.json(partidas);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Erro ao buscar rachas que participa" });
    }
  }

  static async getPublicas(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Partida);

      const publicas = await repo.find({
        where: { tipo: TipoEnum.PUBLICO } // agora funciona suave
      });
      console.log("Partidas públicas encontradas:", publicas);

      return res.json(publicas);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar partidas públicas" });
    }
  }

  static async participar(req: Request, res: Response) {
    try {
      const usuarioIdRaw = req.usuario?.id;   // pode vir string do middleware/JWT
      const partidaIdRaw = req.params.id;     // string vinda da URL

      // validação segura
      const usuarioId = Number(usuarioIdRaw);
      const partidaId = Number(partidaIdRaw);

      if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
        return res.status(400).json({ error: "Usuário inválido" });
      }
      if (!Number.isInteger(partidaId) || partidaId <= 0) {
        return res.status(400).json({ error: "ID de partida inválido" });
      }

      const partidaRepo = AppDataSource.getRepository(Partida);
      const partidaUsuarioRepo = AppDataSource.getRepository(PartidaUsuario);

      const partida = await partidaRepo.findOneBy({ id: partidaId });
      if (!partida) {
        return res.status(404).json({ error: "Partida não encontrada" });
      }

      // checa se já participa
      const jaParticipa = await partidaUsuarioRepo.findOne({
        where: { usuario: { id: usuarioId }, partida: { id: partidaId } },
        relations: ["usuario", "partida"],
      });
      if (jaParticipa) {
        return res.status(400).json({ error: "Usuário já participa desta partida" });
      }

      const relacao = partidaUsuarioRepo.create({
        confirmado: true,
        organizador: false,
        jog_linha: false,
        usuario: { id: usuarioId } as any, // ok: setando relação por id
        partida,
      });

      await partidaUsuarioRepo.save(relacao);

      return res.status(201).json({ message: "Participação registrada com sucesso" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao participar da partida" });
    }
  }
}
