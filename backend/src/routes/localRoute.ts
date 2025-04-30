import { Router } from "express";
import { LocalController } from "../controls/LocalController";

const localrouter = Router();

localrouter.post("/", LocalController.create);
localrouter.get("/", LocalController.getAll);
localrouter.get("/:id", LocalController.getById);
localrouter.put("/:id", LocalController.update);
localrouter.delete("/:id", LocalController.delete);

export default localrouter;
