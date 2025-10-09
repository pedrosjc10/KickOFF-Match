import { Router } from "express";
import { PartidaController } from "../controls/PartidaController";
import { authMiddleware } from "../middleware/authMiddleware";

const partidarouter = Router();

partidarouter.post("/", authMiddleware, PartidaController.create);
partidarouter.get("/",authMiddleware, PartidaController.getAll);

partidarouter.get("/:id(\\d+)", authMiddleware, PartidaController.getById);
partidarouter.put("/:id(\\d+)", authMiddleware,PartidaController.update);
partidarouter.delete("/:id(\\d+)", authMiddleware, PartidaController.delete);
partidarouter.post("/:id(\\d+)/participar", authMiddleware, PartidaController.participar);


partidarouter.get("/participando/:usuarioId", authMiddleware, PartidaController.getMeusRachas);


export default partidarouter;
