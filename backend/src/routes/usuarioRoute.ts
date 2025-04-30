// src/routes/usuarioRoute.ts
import { Router } from "express";
import { UsuarioController } from "../controls/UsuarioController";
import { authMiddleware } from "../middleware/authMiddleware";

const usuarioRouter = Router();


usuarioRouter.post("/", UsuarioController.create);
usuarioRouter.get("/", authMiddleware, UsuarioController.getAll);
usuarioRouter.get("/:id", authMiddleware, UsuarioController.getById);
usuarioRouter.delete("/:id", authMiddleware, UsuarioController.delete);
usuarioRouter.put("/:id", authMiddleware, UsuarioController.update);


export default usuarioRouter;
