// src/routes/index.ts (exemplo)
import { Router } from "express";
import loginRouter from "./loginRoute";
// import userRouter from "./userRoute"; etc.

const routes = Router();

// Se quiser que a rota de login seja literalmente POST /
routes.use("/", loginRouter);

// Se tivesse outras rotas, poderia fazer:
// routes.use("/usuarios", userRouter);

export default routes;
