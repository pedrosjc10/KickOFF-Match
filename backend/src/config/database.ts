import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "dotenv";
import { Usuario } from "../models/Usuario";
import { Partida } from "../models/Partida";
import { Local } from "../models/Local";
import { TipoPartida } from "../models/TipoPartida";
import { PartidaUsuario } from "../models/PartidaUsuario";

config();

const isProduction = !!process.env.DATABASE_URL;

export const AppDataSource = new DataSource({
  // 1. MUDOU AQUI: O tipo agora é 'postgres'
  type: "postgres", 

  ...(isProduction
    ? {
        url: process.env.DATABASE_URL,
        // 2. ADICIONOU AQUI: Supabase e outros provedores cloud exigem SSL
        ssl: {
          rejectUnauthorized: false, // Necessário para alguns ambientes como Render/Heroku
        },
      }
    : {
        // Configuração para seu ambiente local, se você usar Postgres localmente
        host: "localhost",
        port: 5432, // Porta padrão do Postgres
        username: "postgres", // Usuário padrão do Postgres
        password: "sua_senha_local", // Sua senha do Postgres local
        database: "tcc2",
      }),
      
  synchronize: false,
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