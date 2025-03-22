// src/routes/loginRoute.ts
import { Router } from "express";
import { LoginController } from "../controls/LoginController";

const loginRouter = Router();

// POST / -> faz o login
loginRouter.post("/", LoginController.login);

export default loginRouter;
