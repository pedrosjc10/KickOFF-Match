import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { criarPartida, NovaPartida } from "../services/partidaService";
import { getLocais, NovoLocal } from "../services/localService";
import { getTiposPartida, TipoPartida } from "../services/tipoPartidaService";
import "../styles/CriarRacha.css";

const CriarRacha: React.FC = () => {
  const [form, setForm] = useState<Omit<NovaPartida, "organizador">>({
    nome: "",
    data: "",
    hora: "",
    local_id: 0,
    tipoPartida_id: 0,
  });

  const [locais, setLocais] = useState<NovoLocal[]>([]);
  const [tiposPartida, setTiposPartida] = useState<TipoPartida[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const locaisData = await getLocais();
      setLocais(locaisData);

      const tiposData = await getTiposPartida();
      setTiposPartida(tiposData);
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      // Converte para número os campos de id, mantém string para os outros
      [name]: name === "local_id" || name === "tipoPartida_id" ? Number(value) : value,
    }));
  };

  const handleCriar = async (e: React.FormEvent) => {
    e.preventDefault();

    const novaPartida: NovaPartida = {
      ...form,
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
            name="nome"
            placeholder="Fut quinta"
            value={form.nome}
            onChange={handleChange}
            className="criarracha-input"
            required
          />

          <label className="criarracha-label">Dia da Semana</label>
          <input
            type="string"
            name="data"
            placeholder="Quinta-Feira"
            value={form.data}
            onChange={handleChange}
            className="criarracha-input"
            required
          />

          <label className="criarracha-label">Hora</label>
          <input
            type="time"
            name="hora"
            value={form.hora}
            onChange={handleChange}
            className="criarracha-input"
            required
          />

          <label className="criarracha-label">Local</label>
          <select
            name="local_id"
            value={form.local_id}
            onChange={handleChange}
            className="criarracha-input"
            required
          >
            <option value={0}>Selecione um local</option>
            {locais.map(local => (
              <option key={local.id} value={local.id}>{local.nome}</option>
            ))}
          </select>

          <label className="criarracha-label">Tipo de Partida</label>
          <select
            name="tipoPartida_id"
            value={form.tipoPartida_id}
            onChange={handleChange}
            className="criarracha-input"
            required
          >
            <option value={0}>Selecione um tipo</option>
            {tiposPartida.map(tp => (
              <option key={tp.idtipoPartida} value={tp.idtipoPartida}>{tp.nomeTipoPartida}</option>
            ))}
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
