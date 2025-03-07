"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("oi");
});
let usuarios = [{
        nome: "pedro",
        idade: 17
    },
    {
        nome: "jao",
        idade: 17
    }
];
app.get("/usuario", (req, res) => {
    res.send(usuarios);
});
app.post("/usuario", (req, res) => {
    let user = req.body;
    usuarios.push(user);
    res.send({
        message: "usuario cadastrado!"
    });
});
app.listen(3000, () => {
    console.log("servidor funfando");
});
//# sourceMappingURL=index.js.map