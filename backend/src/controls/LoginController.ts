// src/controllers/LoginController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../config/database"; // Ajuste se seu data-source estiver em outro lugar
import { Usuario } from "../models/Usuario";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class LoginController {
  static async login(req: Request, res: Response) {
    try {
      const { cpf, senha } = req.body;

      if (!cpf || !senha) {
        return res.status(400).json({ error: "Cpf e senha são obrigatórios" });
      }

      const repo = AppDataSource.getRepository(Usuario);
      const usuario = await repo.findOne({ where: { cpf } });

      if (!usuario) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }


      const secretKey = "minhaChaveSecreta"; 
      const token = jwt.sign({ userId: usuario.id }, secretKey, {
        expiresIn: "1h", 
      });

      return res.json({
        message: "Login bem-sucedido",
        token,
      });
    } catch (error) {
      console.error("Erro no login:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
}
