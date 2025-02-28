import express from "express";

const app = express();

app.get("/", (req, res) => {
    res.send("oi")
} )

app.listen(3000, () => {
    console.log("servidor funfando");
})