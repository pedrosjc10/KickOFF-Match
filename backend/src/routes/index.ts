// src/routes/index.ts (exemplo)
import { Router } from "express";
import loginRouter from "./loginRoute";
import usuarioRouter from "./usuarioRoute";
// import userRouter from "./userRoute"; etc.

const routes = Router();

// Se quiser que a rota de login seja literalmente POST /
routes.use("/", loginRouter);
routes.use("/usuarios", usuarioRouter);

// Se tivesse outras rotas, poderia fazer:
// routes.use("/usuarios", userRouter);

export default routes;
