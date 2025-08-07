import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cadastrarUsuario } from "../services/usuarioService";
import "../styles/Cadastro.css";

const Cadastro: React.FC = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cpf, setCpf] = useState("");
  const navigate = useNavigate();

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await cadastrarUsuario({ nome, email, senha, cpf });
      alert("Cadastro realizado com sucesso!");
      navigate("/login");
    } catch (error) {
      alert("Erro ao cadastrar. Tente novamente.");
      console.error(error);
    }
  };

  return (
    <div className="cadastro-container">
      <div className="cadastro-card">
        <h1 className="cadastro-title">
          CADASTRAR<br />JOGADOR
        </h1>
        <form onSubmit={handleCadastro} className="cadastro-form">
          <label className="cadastro-label">Coloque seu Email</label>
          <input
            type="email"
            placeholder="exemplo@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="cadastro-input"
            required
          />

          <label className="cadastro-label">Digite sua senha</label>
          <input
            type="password"
            placeholder="********"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="cadastro-input"
            required
          />

          <label className="cadastro-label">Digite seu CPF</label>
          <input
            type="text"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            className="cadastro-input"
            required
          />

          <label className="cadastro-label">Digite seu nome</label>
          <input
            type="text"
            placeholder="José da Silva"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="cadastro-input"
            required
          />

          <button type="submit" className="cadastro-button">
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Cadastro;
