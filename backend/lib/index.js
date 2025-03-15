"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("./config/database"); // Importe a configuração do TypeORM
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("oi");
});
// Iniciar conexão com o banco antes do servidor
database_1.AppDataSource.initialize()
    .then(() => {
    console.log("Banco de dados conectado com sucesso!");
    app.listen(3000, () => {
        console.log("Servidor rodando na porta 3000");
    });
})
    .catch((error) => {
    console.error("Erro ao conectar no banco:", error);
});
//# sourceMappingURL=index.js.map