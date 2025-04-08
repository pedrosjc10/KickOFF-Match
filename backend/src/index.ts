import express from "express";
import dotenv from "dotenv";
import { initializeDatabase } from "./config/database"; 
import routes from "./routes"; 
import cors from "cors";

dotenv.config(); 

const app = express();

app.use(cors());

app.use(express.json());


app.use(routes);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  // Inicializa o banco de dados
  await initializeDatabase();

  // Inicia o servidor
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
};

startServer();
