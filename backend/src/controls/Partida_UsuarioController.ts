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
      const { usuarioId, partidaId } = req.params;

      const repo = AppDataSource.getRepository(PartidaUsuario);

      const registro = await repo.findOne({
        where: {
          usuario: { id: Number(usuarioId) },
          partida: { id: Number(partidaId) },
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
      const { id } = req.params;
      const partidaId = Number(id);
  
      if (isNaN(partidaId)) {
        return res.status(400).json({ error: "id da partida inválido" });
      }
  
      const repo = AppDataSource.getRepository(PartidaUsuario);
  
      // Busca registros de PartidaUsuario onde partida.id = partidaId e confirmado = true
      const registros = await repo.find({
        where: {
          partida: { id: partidaId }, // relacionando pela entidade partida
          confirmado: true
        },
        relations: ["partida", "usuario"]
      });
  
      // Se quiser devolver um array vazio ao invés de 404:
      const usuarios = registros.map(r => r.usuario);
      return res.json(usuarios);
  
      // Se preferir 404 quando não houver confirmados:
      // if (registros.length === 0) return res.status(404).json({ error: "Nenhum jogador confirmado" });
      // return res.json(usuarios);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar registro" });
    }
  }
}
