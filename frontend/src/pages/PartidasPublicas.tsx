// src/pages/PublicRachas.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buscarPartidas, participarPartida, PartidaDetalhes } from "../services/partidaService";
import "../styles/PartidasPublicas.css";
const PublicRachas: React.FC = () => {
  const navigate = useNavigate();
  const [rachas, setRachas] = useState<PartidaDetalhes[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    buscarPartidas()
      .then(data => setRachas(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="public-loading">Carregando partidas...</div>;

  return (
    <div className="public-rachas-container">
        <button onClick={() => navigate("/meusrachas")}>
         Voltar para Meus Rachas
        </button>
      <h1>Partidas Públicas</h1>
      {rachas.length === 0 ? (
        <p>Nenhuma partida pública disponível.</p>
      ) : (
        <ul className="public-rachas-list">          
          {rachas.map(r => (
            <li key={r.id} className="public-racha-card">
              <h2>{r.nome}</h2>
              <p>
                {r.data}
              </p>
              {Array.isArray(r.local) && r.local.length > 0 ? (
                <p>{r.local[0].nome}</p>
              ) : (
                <p>Local não informado</p>
              )}

              <button onClick={async () => {
                try {
                  await participarPartida(r.id); // r.id é number
                  alert("Você entrou no racha!");
                } catch (e:any) {
                  alert(e?.response?.data?.error ?? "Erro ao participar");
                }
              }}>
                Participar
              </button>

            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PublicRachas;
