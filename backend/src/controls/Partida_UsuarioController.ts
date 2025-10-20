// src/controllers/PartidaUsuarioController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { PartidaUsuario } from "../models/PartidaUsuario";
import { Usuario } from "../models/Usuario";
import { Partida } from "../models/Partida";
import AlgoritmoSorteio from "./AlgoritmoSorteio";

export class PartidaUsuarioController {
  static async create(req: Request, res: Response) {
    try {
      const { confirmado, organizador, jog_linha, usuario_id, partida_id, habilidade } = req.body;

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
        partida,
        habilidade
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

  // Certifique-se de que os imports de Request e Response do Express e do AppDataSource
  // e das Entidades PartidaUsuario, Usuario e Partida estejam corretos no topo do arquivo.

  static async update(req: Request, res: Response) {
    try {
      const usuarioId = Number(req.params.usuarioId);
      const partidaId = Number(req.params.partidaId);
      console.log('ID RECEBIDO NA ROTA:', usuarioId); 
      console.log('ID CONVERTIDO PARA BUSCA:', Number(usuarioId)); 
      
      // Desestrutura todos os campos do corpo da requisição
      const { confirmado, habilidade, jog_linha } = req.body;

      // Validações

      if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
        return res.status(400).json({ error: "ID de usuário inválido" });
      }

      if (!Number.isInteger(partidaId) || partidaId <= 0) {
        return res.status(400).json({ error: "ID de partida inválido" });
      }

      if (habilidade !== undefined && (typeof habilidade !== 'number' || habilidade < 50 || habilidade > 90)) {
        return res.status(400).json({ error: "Habilidade deve ser um número entre 50 e 90." });
      }

      const repo = AppDataSource.getRepository(PartidaUsuario);
      const registro = await repo.findOne({ 
        where: { usuario: { id: usuarioId }, partida: { id: partidaId } },
        relations: ["usuario", "partida"]
      });

      if (!registro) {
        return res.status(404).json({ error: "Registro não encontrado" });
      }

      // 1. ATUALIZAÇÃO DOS CAMPOS SIMPLES
      // Verifica se o valor NÃO É 'undefined' para aceitar 0, 1, true ou false como atualização.
      
      if (confirmado !== undefined) {
        registro.confirmado = confirmado;
      }
      if (habilidade !== undefined) {
        registro.habilidade = habilidade;
      }
      if (jog_linha !== undefined) {
        registro.jog_linha = jog_linha;
      }

      console.log('habilidade atualizado antes do save:', registro.confirmado);
      
      // 2. SALVAMENTO DA ENTIDADE ATUALIZADA
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

        // MUDANÇA PRINCIPAL: Usar SELECT e getRawMany para formatar a resposta
        const jogadoresConfirmados = await repo
            .createQueryBuilder("pu")
            .innerJoin("pu.usuario", "u") // Junta com a entidade Usuario (INNER JOIN garante que só retorna quem tem usuário)
            .select([
                // Seleciona os campos da entidade Usuario e renomeia para a interface Jogador
                "u.id AS id",
                "u.nome AS nome",
                
                // Seleciona os campos da entidade PartidaUsuario (pu)
                "pu.confirmado AS confirmado",
                "pu.organizador AS organizador",
                "pu.jog_linha AS jog_linha",
                "pu.habilidade AS habilidade" // <-- AGORA INCLUÍDO
            ])
            .where("pu.partida.id = :partidaId", { partidaId })
            .andWhere("pu.confirmado = :confirmado", { confirmado: 1 }) // 1 = confirmado
            .getRawMany(); // <-- Retorna objetos simples, com os aliases acima

        // O resultado já está formatado como um array de objetos Jogador
        return res.json(jogadoresConfirmados); 

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
                habilidade: registro.habilidade,
                // Adicione aqui outros campos que você precise do 'PartidaUsuario'
            };
        }).filter(Boolean); // Filtra qualquer valor nulo

        return res.status(200).json(usuariosFormatados);
    } catch (error) {
        console.error("Erro ao buscar todos os participantes:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
  }

  /**
   * Verifica se o usuário é organizador da partida
   * GET /partidaUsuario/:usuarioId/:partidaId/organizador
   */
  static async isOrganizador(req: Request, res: Response) {
    try {
      const usuarioId = Number(req.params.usuarioId);
      const partidaId = Number(req.params.partidaId);

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
      });

      if (!registro) {
        return res.status(404).json({ error: "Relação não encontrada" });
      }

      return res.json({ organizador: !!registro.organizador });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao verificar organizador" });
    }
  }

  static async sortearTimes(req: Request, res: Response) {
    try {
        const partidaId = Number(req.params.partidaId);
        if (!Number.isInteger(partidaId) || partidaId <= 0) {
            return res.status(400).json({ error: "ID de partida inválido" });
        }

        const partidaRepo = AppDataSource.getRepository(Partida);
        const partida = await partidaRepo.findOne({
            where: { id: partidaId },
            relations: ["tipoPartida"]
        });

        if (!partida || !partida.tipoPartida) {
            return res.status(404).json({ error: "Partida ou Tipo de Partida não encontrado." });
        }

        const minJogadoresPartida = partida.tipoPartida.quantidadeJogadores || 10;
        const jogadoresConfirmados = await PartidaUsuarioController.buscarJogadoresConfirmadosParaSorteio(partidaId);

        if (jogadoresConfirmados.length < minJogadoresPartida) {
            return res.status(400).json({
                error: `Número insuficiente de jogadores confirmados (${jogadoresConfirmados.length}/${minJogadoresPartida}).`
            });
        }

        const resultadoSorteio = AlgoritmoSorteio.balancear(jogadoresConfirmados, minJogadoresPartida);
        return res.json(resultadoSorteio);

    } catch (error) {
        console.error("Erro no sorteio de times:", error);
        return res.status(500).json({ error: "Erro interno ao sortear times." });
    }
  }

    
    // Função auxiliar para buscar os dados de forma mais completa
  static async buscarJogadoresConfirmadosParaSorteio(partidaId: number) {
    const repo = AppDataSource.getRepository(PartidaUsuario);
    const confirmados = await repo
        .createQueryBuilder("pu")
        .innerJoin("pu.usuario", "u") 
        .select([
            "u.id AS id",
            "u.nome AS nome",
            "pu.organizador AS organizador",
            "pu.jog_linha AS jog_linha",
            "pu.habilidade AS habilidade" 
        ])
        .where("pu.partida.id = :partidaId", { partidaId })
        .andWhere("pu.confirmado = :confirmado", { confirmado: 1 }) 
        .getRawMany();
        
    // Garante que a habilidade é um número, usando 50 como default para o sorteio
    return confirmados.map(j => ({ ...j, habilidade: j.habilidade || 50 })); 
    }

  static async deleteByUsuarioId(req: Request, res: Response) {
    try {
      const usuarioId = Number(req.params.usuarioId);
      const partidaId = Number(req.params.partidaId);

      if (!Number.isInteger(partidaId) || partidaId <= 0) {
        return res.status(400).json({ error: "ID de partida inválido" });
      }

      if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
        return res.status(400).json({ error: "ID de partida inválido" });
      }

      const repo = AppDataSource.getRepository(PartidaUsuario);

      console.log("deleteByUsuarioId -> usuarioId:", usuarioId);

      // 1) Buscar registros relacionados usando a relação (funciona independentemente do nome da FK)
      const registros = await repo.find({
        where: { 
          partida: { id: partidaId }, 
          usuario: { id: usuarioId } },
        select: ["id"] // Seleciona apenas os campos necessários,
      });

      console.log("deleteByUsuarioId -> registros encontrados:", registros?.length ?? 0);

      if (!registros || registros.length === 0) {
        return res.status(404).json({ error: "Nenhum registro encontrado para esta partida" });
      }

      // 2) Deletar por ids
      const ids = registros.map(r => r.id);
      await repo.delete(ids);

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao deletar registros da partida" });
    }
  }
}

