import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authServices";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      await login(email, senha);
      navigate("/meusrachas"); // Redireciona para a página após login bem-sucedido
    } catch (error) {
      setError("Email ou senha incorretos!");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
      </form>
      <p>
        Não tem conta? <a href="/cadastro">Cadastre-se</a>
      </p>
    </div>
  );
};

export default Login;
