import "reflect-metadata";
import { DataSource } from "typeorm";
import { Usuario } from "../models/Usuario";
import { Partida } from "../models/Partida";
import { Local } from "../models/Local";
import { TipoPartida } from "../models/TipoPartida";

// Configuração da conexão com o banco de dados
export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost", // Alterar se estiver em produção
  port: 3306,
  username: "root", // Altere conforme sua configuração
  password: "", // Altere conforme sua configuração
  database: "TCC", // Nome do seu banco de dados
  synchronize: false, // Sincroniza automaticamente as tabelas (usar com cuidado em produção)
  logging: false,
  entities: [Usuario, Partida, Local, TipoPartida],
  migrations: ["src/migrations/*.ts"],
  subscribers: [],
});

// Função para iniciar a conexão com o banco de dados
export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Conexão com o banco de dados estabelecida!");
  } catch (error) {
    console.error("Erro ao conectar no banco de dados:", error);
  }
};
