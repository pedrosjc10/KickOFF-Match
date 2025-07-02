// src/controllers/LoginController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../config/database"; // Ajuste se seu data-source estiver em outro lugar
import { Usuario } from "../models/Usuario";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class LoginController {
  static async login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ error: "email e senha são obrigatórios" });
      }

      const repo = AppDataSource.getRepository(Usuario);
      const usuario = await repo.findOne({ where: { email } });

      if (!usuario) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      console.log("JWT_SECRET:", process.env.JWT_SECRET);
      console.log("Senha recebida:", senha);
      console.log("Senha armazenada:", usuario.senha);
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }


      const token = jwt.sign(
        { userId: usuario.id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );

      return res.json({
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email
        }
      });
    } catch (error) {
      console.error("Erro no login:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
}
