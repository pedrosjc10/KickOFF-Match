import { Router } from "express";
import { PartidaUsuarioController } from "../controls/Partida_UsuarioController";


const partidaUsuarioRouter = Router();

partidaUsuarioRouter.post("/",  PartidaUsuarioController.create);
partidaUsuarioRouter.get("/",  PartidaUsuarioController.getAll);
partidaUsuarioRouter.get("/:id",  PartidaUsuarioController.getById);
partidaUsuarioRouter.put("/:id",  PartidaUsuarioController.update);
partidaUsuarioRouter.delete("/:id", PartidaUsuarioController.delete);

export default partidaUsuarioRouter;