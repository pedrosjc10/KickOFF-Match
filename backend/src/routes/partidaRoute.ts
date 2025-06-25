import { Router } from "express";
import { PartidaController } from "../controls/PartidaController";
import { authMiddleware } from "../middleware/authMiddleware";

const partidarouter = Router();

partidarouter.post("/", authMiddleware, PartidaController.create);
partidarouter.get("/",authMiddleware, PartidaController.getAll);
partidarouter.get("/:id", authMiddleware, PartidaController.getById);
partidarouter.put("/:id", authMiddleware,PartidaController.update);
partidarouter.delete("/:id", authMiddleware, PartidaController.delete);
partidarouter.get("/participando/:usuarioId", authMiddleware, PartidaController.getMeusRachas);


export default partidarouter;
