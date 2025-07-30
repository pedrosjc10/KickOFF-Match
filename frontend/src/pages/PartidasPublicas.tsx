// src/pages/PublicRachas.tsx
import React, { useEffect, useState } from "react";
import { buscarPartidasPublicas, PartidaDetalhes } from "../services/partidaService";
import "../styles/PartidasPublicas.css";

const PublicRachas: React.FC = () => {
  const [rachas, setRachas] = useState<PartidaDetalhes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarPartidasPublicas()
      .then(data => setRachas(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="public-loading">Carregando partidas...</div>;

  return (
    <div className="public-rachas-container">
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
              <p>{r.local.nome}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PublicRachas;
