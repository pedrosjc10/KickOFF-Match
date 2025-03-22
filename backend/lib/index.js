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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database"); // ajuste o caminho conforme necessário
const routes_1 = __importDefault(require("./routes")); // supondo que você tenha um arquivo de rotas
dotenv_1.default.config(); // carrega as variáveis de ambiente
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Carregando as rotas da aplicação
app.use(routes_1.default);
const PORT = process.env.PORT || 3000;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    // Inicializa o banco de dados
    yield (0, database_1.initializeDatabase)();
    // Inicia o servidor
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
});
startServer();
//# sourceMappingURL=index.js.map