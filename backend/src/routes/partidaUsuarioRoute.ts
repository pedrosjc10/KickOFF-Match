import { Router } from "express";
import { PartidaUsuarioController } from "../controls/Partida_UsuarioController";
import { authMiddleware } from "../middleware/authMiddleware";


const partidaUsuarioRouter = Router();

// rota específica primeiro (ou use regex abaixo)
partidaUsuarioRouter.get('/:usuarioId(\\d+)/:partidaId(\\d+)', PartidaUsuarioController.getByUsuarioAndPartida);

// Rota para verificar se o usuário é organizador da partida
partidaUsuarioRouter.get('/:usuarioId(\\d+)/:partidaId(\\d+)/organizador', PartidaUsuarioController.isOrganizador);

// rotas genéricas depois
partidaUsuarioRouter.get("/:id(\\d+)",  PartidaUsuarioController.getById);
partidaUsuarioRouter.put("/:id(\\d+)",  PartidaUsuarioController.update);
partidaUsuarioRouter.delete("/:id(\\d+)", PartidaUsuarioController.delete);
partidaUsuarioRouter.get("/:id(\\d+)/confirmados", authMiddleware, PartidaUsuarioController.getConfirmedById);
partidaUsuarioRouter.get("/:id(\\d+)/todos", authMiddleware, PartidaUsuarioController.getAllParticipantsById);
partidaUsuarioRouter.post("/", authMiddleware, PartidaUsuarioController.create);
partidaUsuarioRouter.get("/", authMiddleware, PartidaUsuarioController.getAll);

export default partidaUsuarioRouter;
