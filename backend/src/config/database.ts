import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "dotenv";
import { Usuario } from "../models/Usuario";
import { Partida } from "../models/Partida";
import { Local } from "../models/Local";
import { TipoPartida } from "../models/TipoPartida";
import { PartidaUsuario } from "../models/PartidaUsuario";

// Carrega variáveis do .env (funciona localmente também)
config();

// Usa DATABASE_URL se existir (produção/Railway), senão usa local
const isProduction = !!process.env.DATABASE_URL;

export const AppDataSource = new DataSource({
  type: "mysql",
  ...(isProduction
    ? {
        url: process.env.DATABASE_URL,
      }
    : {
        host: "localhost",
        port: 3306,
        username: "root",
        password: "",
        database: "tcc2",
      }),
  synchronize: false,
  logging: false,
  entities: [Usuario, Partida, Local, TipoPartida, PartidaUsuario],
  migrations: [__dirname + "/../migrations/*.js"], // Use dist/ em produção
  subscribers: [],
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Conexão com o banco de dados estabelecida!");
  } catch (error) {
    console.error("Erro ao conectar no banco de dados:", error);
  }
};
