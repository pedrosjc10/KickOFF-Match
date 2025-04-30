import { Router } from "express";
import { TipoPartidaController } from "../controls/TipoPartidaController";

const tPartidarouter = Router();

tPartidarouter.post("/", TipoPartidaController.create);
tPartidarouter.get("/", TipoPartidaController.getAll);
tPartidarouter.get("/:id", TipoPartidaController.getById);
tPartidarouter.put("/:id", TipoPartidaController.update);
tPartidarouter.delete("/:id", TipoPartidaController.delete);

export default tPartidarouter;
