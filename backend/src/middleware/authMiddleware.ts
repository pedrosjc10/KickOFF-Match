// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from "express";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    const [bearer, token] = authHeader.split(" ");
    if (bearer !== "Bearer" || !token) {
      return res.status(401).json({ error: "Token mal formatado" });
    }


    // Se precisar, você pode colocar infos do token no req (ex: req.userId = decoded.userId)
    // (decoded as any).userId ou algo similar

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
}
