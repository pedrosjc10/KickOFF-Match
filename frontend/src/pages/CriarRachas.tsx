import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { criarPartida } from "../services/partidaService";
import "../styles/CriarRacha.css";

const CriarRacha: React.FC = () => {
  const [nome, setNome] = useState("");
  const [local, setLocal] = useState("");
  const [diaSemana, setDiaSemana] = useState("");
  const [horarioInicio, setHorarioInicio] = useState("");
  const [duracao, setDuracao] = useState("");
  const [vagas, setVagas] = useState("");
  const [privado, setPrivado] = useState("privado");
  const [organizador, setOrganizador] = useState(false);

  const navigate = useNavigate();

  const handleCriar = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrganizador(true);

    const novaPartida = {
      nome,
      local,
      diaSemana,
      horarioInicio,
      duracao,
      vagas,
      privado,
      organizador: true,
    };

    try {
      await criarPartida(novaPartida);
      alert("Racha criado com sucesso!");
      navigate("/meusrachas");
    } catch (error) {
      alert("Erro ao criar racha.");
      console.error(error);
    }
  };

  return (
    <div className="criarracha-container">
      <div className="criarracha-card">
        <h1 className="criarracha-title">
          CRIAR<br />RACHA
        </h1>
        <form onSubmit={handleCriar} className="criarracha-form">
          <label className="criarracha-label">Nome do Racha</label>
          <input
            type="text"
            placeholder="Fut quinta"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="criarracha-input"
            required
          />

          <label className="criarracha-label">Nome do local ou endereço</label>
          <input
            type="text"
            placeholder="Society FC"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            className="criarracha-input"
            required
          />

          <label className="criarracha-label">Dia da semana</label>
          <input
            type="text"
            placeholder="Quinta"
            value={diaSemana}
            onChange={(e) => setDiaSemana(e.target.value)}
            className="criarracha-input"
            required
          />

          <label className="criarracha-label">Horário de início</label>
          <input
            type="text"
            placeholder="21h"
            value={horarioInicio}
            onChange={(e) => setHorarioInicio(e.target.value)}
            className="criarracha-input"
            required
          />

          <label className="criarracha-label">Duração</label>
          <input
            type="text"
            placeholder="1h"
            value={duracao}
            onChange={(e) => setDuracao(e.target.value)}
            className="criarracha-input"
            required
          />

          <label className="criarracha-label">Número de vagas</label>
          <input
            type="number"
            placeholder="30"
            value={vagas}
            onChange={(e) => setVagas(e.target.value)}
            className="criarracha-input"
            required
          />

          <label className="criarracha-label">Privacidade</label>
          <select
            value={privado}
            onChange={(e) => setPrivado(e.target.value)}
            className="criarracha-input"
            required
          >
            <option value="privado">Privado</option>
            <option value="publico">Público</option>
          </select>

          <button type="submit" className="criarracha-button">
            Criar
          </button>
        </form>
      </div>
    </div>
  );
};

export default CriarRacha;
