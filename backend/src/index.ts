import express from "express";
import { AppDataSource } from "./config/database"; // Importe a configuração do TypeORM

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("oi");
});

// Iniciar conexão com o banco antes do servidor
AppDataSource.initialize()
    .then(() => {
        console.log("Banco de dados conectado com sucesso!");

        app.listen(3000, () => {
            console.log("Servidor rodando na porta 3000");
        });
    })
    .catch((error) => {
        console.error("Erro ao conectar no banco:", error);
    });
