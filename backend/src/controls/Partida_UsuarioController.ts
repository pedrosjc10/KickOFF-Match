// src/controllers/PartidaUsuarioController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { PartidaUsuario } from "../models/PartidaUsuario";
import { Usuario } from "../models/Usuario";
import { Partida } from "../models/Partida";

export class PartidaUsuarioController {
  static async create(req: Request, res: Response) {
    try {
      const { confirmado, organizador, jog_linha, usuario_id, partida_id } = req.body;

      const usuarioRepo = AppDataSource.getRepository(Usuario);
      const partidaRepo = AppDataSource.getRepository(Partida);
      const partidaUsuarioRepo = AppDataSource.getRepository(PartidaUsuario);

      const usuario = await usuarioRepo.findOneBy({ id: usuario_id });
      const partida = await partidaRepo.findOneBy({ id: partida_id });

      if (!usuario || !partida) {
        return res.status(400).json({ error: "Usuário ou Partida não encontrados." });
      }

      const novaAssociacao = partidaUsuarioRepo.create({
        confirmado,
        organizador,
        jog_linha,
        usuario,
        partida
        });

      const resultado = await partidaUsuarioRepo.save(novaAssociacao);
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

  static async getByUsuarioAndPartida(req: Request, res: Response) {
    try {
      const usuarioId = Number(req.params.usuarioId);
      const partidaId = Number(req.params.partidaId);

      console.log("DEBUG getByUsuarioAndPartida params:", { usuarioId: req.params.usuarioId, partidaId: req.params.partidaId, parsed: { usuarioId, partidaId } });

      if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
        return res.status(400).json({ error: "ID de usuário inválido" });
      }
      if (!Number.isInteger(partidaId) || partidaId <= 0) {
        return res.status(400).json({ error: "ID de partida inválido" });
      }

      const repo = AppDataSource.getRepository(PartidaUsuario);

      const registro = await repo.findOne({
        where: {
          usuario: { id: usuarioId },
          partida: { id: partidaId },
        },
        relations: ["partida", "usuario"]
      });

      if (!registro) {
        return res.status(404).json({ error: "Relação não encontrada" });
      }

      return res.json(registro);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar relação" });
    }
  }


    static async getConfirmedById(req: Request, res: Response) {
  try {
    const partidaId = Number(req.params.id);
    if (!Number.isInteger(partidaId) || partidaId <= 0) {
      return res.status(400).json({ error: "ID de partida inválido" });
    }

    const repo = AppDataSource.getRepository(PartidaUsuario); 

    const registros = await repo
      .createQueryBuilder("pu")
      .leftJoinAndSelect("pu.partida", "p")
      .leftJoinAndSelect("pu.usuario", "u")
      .where("p.id = :partidaId", { partidaId })
      .andWhere("pu.confirmado = :confirmado", { confirmado: 1 }) // 1 = confirmado
      .getMany();


    // se nenhum registro, retorna array vazio (ou 404 se preferir)
    const usuarios = registros.map(r => r.usuario || null).filter(Boolean);

    return res.json(usuarios);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar confirmados" });
  }
}

   static async getAllParticipantsById(req: Request, res: Response) {
        try {
            const partidaId = Number(req.params.id);
            if (!Number.isInteger(partidaId) || partidaId <= 0) {
                return res.status(400).json({ error: "ID de partida inválido" });
            }

            const repo = AppDataSource.getRepository(PartidaUsuario);

            const registros = await repo
                .createQueryBuilder("pu")
                .leftJoinAndSelect("pu.partida", "p")
                .leftJoinAndSelect("pu.usuario", "u")
                .where("p.id = :partidaId", { partidaId })
                .getMany(); // Removido o filtro de 'confirmado'

            if (!registros || registros.length === 0) {
                return res.status(404).json({ error: "Nenhum participante encontrado para esta partida" });
            }

            // Mapeia os registros para um formato mais limpo
            const usuariosFormatados = registros.map(registro => {
                if (!registro.usuario) {
                    return null;
                }
                return {
                    id: registro.usuario.id,
                    nome: registro.usuario.nome,
                    confirmado: registro.confirmado,
                    jog_linha: registro.jog_linha,
                    organizador: registro.organizador,
                    // Adicione aqui outros campos que você precise do 'PartidaUsuario'
                };
            }).filter(Boolean); // Filtra qualquer valor nulo

            return res.status(200).json(usuariosFormatados);
        } catch (error) {
            console.error("Erro ao buscar todos os participantes:", error);
            return res.status(500).json({ error: "Erro interno do servidor." });
        }
    }

}
