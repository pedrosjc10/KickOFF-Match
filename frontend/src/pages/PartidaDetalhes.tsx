// src/pages/PartidaDetalhes.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  buscarDetalhesPartida,
  buscarConfirmados,
  confirmarPresenca,
  toggleJogLinha,
  PartidaDetalhes as PartidaDetalhesType,
  Jogador,
} from "../services/partidaService";
import "../styles/PartidaDetalhes.css";

const PartidaDetalhes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [partida, setPartida] = useState<PartidaDetalhesType | null>(null);
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [times, setTimes] = useState<{ nome: string; jogadores: Jogador[] }[]>(
    []
  );

  // buscar dados da partida
  useEffect(() => {
    if (id) {
      carregarDetalhes();
    }
  }, [id]);

  const carregarDetalhes = async () => {
    if (!id) return;
    const detalhes = await buscarDetalhesPartida(id);
    setPartida(detalhes);

    const confirmados = await buscarConfirmados(Number(id));
    setJogadores(confirmados);
  };

  const handleConfirmarPresenca = async (jogador: Jogador) => {
    await confirmarPresenca(jogador.partidaUsuarioId, jogador.jog_linha);
    await carregarDetalhes();
  };

  const handleToggleJogLinha = async (jogador: Jogador) => {
    await toggleJogLinha(jogador.partidaUsuarioId, !jogador.jog_linha);
    await carregarDetalhes();
  };

  const sortearTimes = () => {
    if (!partida || !partida.tipoPartida?.quantidadejogadores) return;

    const jogadoresConfirmados = jogadores.filter((j) => j.confirmado);
    const shuffled = [...jogadoresConfirmados].sort(
      () => Math.random() - 0.5
    );

    const tamanho = partida.tipoPartida.quantidadejogadores;
    const timeA = shuffled.slice(0, tamanho);
    const timeB = shuffled.slice(tamanho, tamanho * 2);

    setTimes([
      { nome: "Time A", jogadores: timeA },
      { nome: "Time B", jogadores: timeB },
    ]);
  };

  if (!partida) return <p>Carregando detalhes...</p>;

  return (
    <div className="detalhes-container">
      <h2>{partida.nome}</h2>
      <p>
        <strong>Data:</strong> {partida.data} às {partida.hora}
      </p>
      <p>
        <strong>Local:</strong> {partida.local?.nome} - {partida.local?.cidade}
      </p>
      <p>
        <strong>Tipo:</strong> {partida.tipo}
      </p>

      <h3>Jogadores Confirmados</h3>
      <ul>
        {jogadores.map((j) => (
          <li key={j.partidaUsuarioId}>
            {j.nome}{" "}
            {j.organizador && <span>(Organizador)</span>}{" "}
            {j.confirmado ? (
              <>
                ✅ Confirmado |{" "}
                <button onClick={() => handleToggleJogLinha(j)}>
                  {j.jog_linha ? "Sou jogador de linha" : "Sou goleiro"}
                </button>
              </>
            ) : (
              <button onClick={() => handleConfirmarPresenca(j)}>
                Confirmar Presença
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Botão sorteio só para organizador */}
      {jogadores.some((j) => j.organizador) && (
        <button className="btn-sortear" onClick={sortearTimes}>
          Sortear Times
        </button>
      )}

      {times.length > 0 && (
        <div className="times-container">
          {times.map((time, idx) => (
            <div key={idx} className="time-card">
              <h4>{time.nome}</h4>
              <ul>
                {time.jogadores.map((j) => (
                  <li key={j.partidaUsuarioId}>{j.nome}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PartidaDetalhes;
