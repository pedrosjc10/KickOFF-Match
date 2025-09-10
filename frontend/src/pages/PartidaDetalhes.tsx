import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  PartidaDetalhes as PartidaDetalhesType,
  Jogador,
  buscarDetalhesPartida,
  buscarJogadores,
  atualizarPartida,
} from "../services/partidaService";
import "../styles/PartidaDetalhes.css";

const PartidaDetalhes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [partida, setPartida] = useState<PartidaDetalhesType | null>(null);
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [overalls, setOveralls] = useState<{ [key: number]: number }>({});
  const [resultado, setResultado] = useState<{ teamA: Jogador[]; teamB: Jogador[] } | null>(null);
  const [isOrganizer, setIsOrganizer] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;

        const partidaRes = await buscarDetalhesPartida(id);
        setPartida(partidaRes);

        const jogadoresRes = await buscarJogadores(id);
        const confirmados = jogadoresRes.filter(j => j.confirmado === 1);
        setJogadores(confirmados);

        const userId = localStorage.getItem("userId");
        const found = confirmados.find(j => j.usuario.id === Number(userId) && j.organizador === 1);
        setIsOrganizer(!!found);
      } catch (error) {
        console.error("Erro ao buscar dados", error);
      }
    };
    fetchData();
  }, [id]);

  const sortearTimes = () => {
    if (!partida) return;

    const jogadoresLinha = jogadores.filter(j => j.jog_linha === 1);
    if (jogadoresLinha.length < (partida.tipoPartida?.quantidadeJogadores || 0)) {
      alert("Não há jogadores de linha suficientes!");
      return;
    }

    const goleiros = jogadores.filter(j => j.jog_linha === 0);
    const linhas = [...jogadoresLinha];

    linhas.forEach(j => {
      if (!overalls[j.id]) overalls[j.id] = 50;
    });

    linhas.sort((a, b) => (overalls[b.id] || 50) - (overalls[a.id] || 50));

    const teamA: Jogador[] = [];
    const teamB: Jogador[] = [];

    if (goleiros.length >= 2) {
      teamA.push(goleiros[0]);
      teamB.push(goleiros[1]);
    } else if (goleiros.length === 1) {
      teamA.push(goleiros[0]);
      teamB.push(goleiros[0]);
    }

    let somaA = teamA.reduce((acc, j) => acc + (overalls[j.id] || 50), 0);
    let somaB = teamB.reduce((acc, j) => acc + (overalls[j.id] || 50), 0);

    linhas.forEach(j => {
      if (!teamA.includes(j) && !teamB.includes(j)) {
        if (somaA <= somaB) {
          teamA.push(j);
          somaA += overalls[j.id] || 50;
        } else {
          teamB.push(j);
          somaB += overalls[j.id] || 50;
        }
      }
    });

    setResultado({ teamA, teamB });
  };

  const handleDataChange = async (novaData: string) => {
    if (!partida) return;
    const hoje = new Date().toISOString().split("T")[0];
    if (novaData < hoje) return alert("Não é permitido escolher datas anteriores");

    await atualizarPartida(partida.id, novaData, undefined);
    setPartida({ ...partida, data: novaData });
  };

  const handleHoraChange = async (novaHora: string) => {
    if (!partida) return;
    const hoje = new Date().toISOString().split("T")[0];
    if (partida.data === hoje) {
      const horaAtual = new Date().toTimeString().slice(0, 5);
      if (novaHora < horaAtual) return alert("Horário já passou!");
    }

    await atualizarPartida(partida.id, undefined, novaHora);
    setPartida({ ...partida, hora: novaHora });
  };

  return (
    <div className="detalhes-container">
      {partida && (
        <>
          <h2>{partida.nome}</h2>
          <p><b>Local:</b> {partida.local?.nome} - {partida.local?.cidade}</p>

          {isOrganizer && (
            <div className="organizer-controls">
              <label>Data:
                <input
                  type="date"
                  value={partida.data}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => handleDataChange(e.target.value)}
                />
              </label>
              <label>Hora:
                <input
                  type="time"
                  value={partida.hora}
                  onChange={(e) => handleHoraChange(e.target.value)}
                />
              </label>
            </div>
          )}

          <h3>Jogadores Confirmados</h3>
          <ul>
            {jogadores.map(j => (
              <li key={j.id}>
                {j.usuario.nome}{" "}
                {j.jog_linha ? "(Jogador de Linha)" : "(Goleiro)"}
                {isOrganizer && (
                  <input
                    type="number"
                    min={50}
                    max={99}
                    value={overalls[j.id] || 50}
                    onChange={(e) =>
                      setOveralls({ ...overalls, [j.id]: Number(e.target.value) })
                    }
                  />
                )}
              </li>
            ))}
          </ul>

          {isOrganizer && <button onClick={sortearTimes}>🎲 Sortear Times</button>}

          {resultado && (
            <div className="times-container">
              <div>
                <h4>Time A</h4>
                <ul>
                  {resultado.teamA.map(j => (
                    <li key={j.id}>{j.usuario.nome} ({overalls[j.id] || 50})</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4>Time B</h4>
                <ul>
                  {resultado.teamB.map(j => (
                    <li key={j.id}>{j.usuario.nome} ({overalls[j.id] || 50})</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PartidaDetalhes;
