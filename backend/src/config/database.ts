import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "dotenv";
import { Usuario } from "../models/Usuario";
import { Partida } from "../models/Partida";
import { Local } from "../models/Local";
import { TipoPartida } from "../models/TipoPartida";
import { PartidaUsuario } from "../models/PartidaUsuario";

// Carrega variáveis do .env (funciona localmente)
config();

// Verifica se a variável de ambiente DATABASE_URL existe
// Essa variável de ambiente deve ser configurada no painel do Render
const isProduction = !!process.env.DATABASE_URL;

export const AppDataSource = new DataSource({
  // O tipo do banco de dados agora é 'postgres'
  type: "postgres",

  ...(isProduction
    ? {
        // Usa a variável de ambiente DATABASE_URL em produção
        url: process.env.DATABASE_URL,
        // Adiciona a configuração SSL necessária para conexão com o Supabase/Render
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {
        // Configuração para seu ambiente local, se você usar Postgres localmente
        host: "localhost",
        port: 5432,
        username: "postgres",
        password: "sua_senha_local", // <- Altere para sua senha local
        database: "tcc2",
      }),
      
  synchronize: true,
  logging: false,
  entities: [Usuario, Partida, Local, TipoPartida, PartidaUsuario],
  migrations: [__dirname + "/../migrations/*.js"],
  subscribers: [],
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Conexão com o banco de dados (PostgreSQL) estabelecida!");
  } catch (error) {
    console.error("Erro ao conectar no banco de dados:", error);
  }
};