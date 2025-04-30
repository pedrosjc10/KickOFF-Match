// src/routes/index.ts (exemplo)
import { Router } from "express";
import loginRouter from "./loginRoute";
import usuarioRouter from "./usuarioRoute";
import tPartidarouter from "./tipoPartidaRoute";
import partidarouter from "./partidaRoute";
import localrouter from "./localRoute";
// import userRouter from "./userRoute"; etc.

const routes = Router();

routes.use("/login", loginRouter);
routes.use("/usuarios", usuarioRouter);
routes.use("/tPartida", tPartidarouter);
routes.use("/meusrachas", partidarouter);
routes.use("/local", localrouter);


export default routes;
