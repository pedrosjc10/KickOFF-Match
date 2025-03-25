// src/routes/usuarioRoute.ts
import { Router } from "express";
import { UsuarioController } from "../controls/UsuarioController";
import { authMiddleware } from "../middleware/authMiddleware";

const usuarioRouter = Router();

// Criação de usuário (rota pública)
usuarioRouter.post("/", UsuarioController.createUser);
usuarioRouter.get("/", authMiddleware, UsuarioController.getAllUsers);
usuarioRouter.get("/:id", authMiddleware, UsuarioController.getUserById);
usuarioRouter.delete("/:id", authMiddleware, UsuarioController.deleteUser);

export default usuarioRouter;
