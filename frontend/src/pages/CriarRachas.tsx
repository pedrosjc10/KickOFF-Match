import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { criarPartida, NovaPartida } from "../services/partidaService";
import "../styles/CriarRacha.css";

const CriarRacha: React.FC = () => {
  const [form, setForm] = useState<Omit<NovaPartida, "organizador">>({
    nome: "",
    local: "",
    diaSemana: "",
    horarioInicio: "",
    duracao: "",
    vagas: "",
    privado: "privado",
  });

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
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
          {[
            { label: "Nome do Racha", name: "nome", placeholder: "Fut quinta" },
            { label: "Nome do local ou endereço", name: "local", placeholder: "Society FC" },
            { label: "Dia da semana", name: "diaSemana", placeholder: "Quinta" },
            { label: "Horário de início", name: "horarioInicio", placeholder: "21h" },
            { label: "Duração", name: "duracao", placeholder: "1h" },
            { label: "Número de vagas", name: "vagas", placeholder: "30", type: "number" },
          ].map(({ label, name, placeholder, type = "text" }) => (
            <React.Fragment key={name}>
              <label className="criarracha-label">{label}</label>
              <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={(form as any)[name]}
                onChange={handleChange}
                className="criarracha-input"
                required
              />
            </React.Fragment>
          ))}

          <label className="criarracha-label">Privacidade</label>
          <select
            name="privado"
            value={form.privado}
            onChange={handleChange}
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
