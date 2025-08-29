import express from "express";
import dotenv from "dotenv";
import { initializeDatabase } from "./config/database"; 
import routes from "./routes"; 
import cors from "cors";

dotenv.config(); 

const app = express();

app.use(cors({
  origin: "*", // ou "http://localhost:3000" se quiser travar pro front
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));


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
