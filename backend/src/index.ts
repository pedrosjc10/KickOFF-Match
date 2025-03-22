// src/index.ts
import express from "express";
import dotenv from "dotenv";
import { initializeDatabase } from "./config/database"; // ajuste o caminho conforme necessário
import routes from "./routes"; // supondo que você tenha um arquivo de rotas

dotenv.config(); // carrega as variáveis de ambiente

const app = express();
app.use(express.json());

// Carregando as rotas da aplicação
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
