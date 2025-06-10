import { Router } from "express";
import { PartidaController } from "../controls/PartidaController";

const partidarouter = Router();

partidarouter.post("/", PartidaController.create);
partidarouter.get("/", PartidaController.getAll);
partidarouter.get("/:id", PartidaController.getById);
partidarouter.put("/:id", PartidaController.update);
partidarouter.delete("/:id", PartidaController.delete);
partidarouter.get("/participando/:usuarioId", PartidaController.getMeusRachas);


export default partidarouter;
