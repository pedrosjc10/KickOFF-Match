"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const Usuario_1 = require("../models/Usuario");
const Partida_1 = require("../models/Partida");
const Local_1 = require("../models/Local");
const TipoPartida_1 = require("../models/TipoPartida");
const PartidaUsuario_1 = require("../models/PartidaUsuario");
// Carrega variáveis do .env (funciona localmente também)
(0, dotenv_1.config)();
// Usa DATABASE_URL se existir (produção/Railway), senão usa local
const isProduction = !!process.env.DATABASE_URL;
exports.AppDataSource = new typeorm_1.DataSource(Object.assign(Object.assign({ type: "mysql" }, (isProduction
    ? {
        url: process.env.DATABASE_URL,
    }
    : {
        host: "localhost",
        port: 3306,
        username: "root",
        password: "",
        database: "tcc2",
    })), { synchronize: false, logging: false, entities: [Usuario_1.Usuario, Partida_1.Partida, Local_1.Local, TipoPartida_1.TipoPartida, PartidaUsuario_1.PartidaUsuario], migrations: ["dist/migrations/*.js"], subscribers: [] }));
const initializeDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield exports.AppDataSource.initialize();
        console.log("Conexão com o banco de dados estabelecida!");
    }
    catch (error) {
        console.error("Erro ao conectar no banco de dados:", error);
    }
});
exports.initializeDatabase = initializeDatabase;
//# sourceMappingURL=database.js.map