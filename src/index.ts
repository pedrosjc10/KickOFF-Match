import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("oi")
} )

let usuarios = [{
    nome: "pedro",
    idade: 17
},
{
    nome: "jao",
    idade:17
}
]
app.get("/usuario", (req, res) => {
    res.send(usuarios);
})

app.post("/usuario", (req, res) => {
    let user = req.body;
    usuarios.push(user);
    res.send({
        message: "usuario cadastrado!"
    })
})

app.listen(3000, () => {
    console.log("servidor funfando");
})