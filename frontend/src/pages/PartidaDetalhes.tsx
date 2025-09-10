<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
=======
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
>>>>>>> 92530273af90d462bdd3346451c0ef11d1b4d93d
import {
  PartidaDetalhes as PartidaDetalhesType,
  Jogador,
  buscarDetalhesPartida,
<<<<<<< HEAD
  confirmarPresenca,
  buscarRelacaoPartidaUsuario,
  buscarConfirmados,
  PartidaDetalhes,
} from '../services/partidaService';
import { useUserStore } from '../stores/userStore';
import '../styles/PartidaDetalhes.css';

const PartidaDetalhesPage: React.FC = () => {
  const { id: partidaId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useUserStore();

  const [detalhes, setDetalhes] = useState<PartidaDetalhes | null>(null);
  const [jogLinha, setJogLinha] = useState<boolean>(false);
  const [partidaUsuarioId, setPartidaUsuarioId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    setError(null);
    if (!partidaId || isNaN(Number(partidaId))) {
      setError('ID de partida inválido');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const dados = await buscarDetalhesPartida(partidaId);
      const confirmados = await buscarConfirmados(Number(partidaId));

      const merged: PartidaDetalhes = {
        ...dados,
        jogadores: confirmados,
      };

      setDetalhes(merged);

      if (usuario?.id) {
        try {
          const relacao = await buscarRelacaoPartidaUsuario(usuario.id, Number(partidaId));
          if (relacao) {
            setPartidaUsuarioId(relacao.id);
            setJogLinha(Boolean(relacao.jog_linha));
          } else {
            setPartidaUsuarioId(null);
            setJogLinha(false);
          }
        } catch {
          setPartidaUsuarioId(null);
          setJogLinha(false);
        }
      }
    } catch (err: any) {
      console.error('Erro ao carregar detalhes:', err);
      setError(err?.response?.data?.error ?? 'Erro ao carregar detalhes');
    } finally {
      setLoading(false);
=======
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
>>>>>>> 92530273af90d462bdd3346451c0ef11d1b4d93d
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

<<<<<<< HEAD
  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key, partidaId, usuario?.id]);

  const handleConfirmar = async () => {
    if (!partidaUsuarioId || !partidaId) return;

    setSaving(true);
    try {
      await confirmarPresenca(partidaUsuarioId.toString(), jogLinha);

      const confirmados = await buscarConfirmados(Number(partidaId));
      setDetalhes((prev) => (prev ? { ...prev, jogadores: confirmados } : prev));

      if (usuario?.id) {
        try {
          const relacao = await buscarRelacaoPartidaUsuario(usuario.id, Number(partidaId));
          if (relacao) {
            setPartidaUsuarioId(relacao.id);
            setJogLinha(Boolean(relacao.jog_linha));
          }
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error('Erro ao confirmar presença:', err);
      setError('Erro ao confirmar presença');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="detalhes-container">
        <div className="detalhes-card">
          <div style={{ padding: 24, textAlign: 'center' }}>Carregando detalhes...</div>
        </div>
      </div>
    );
  }

  if (!detalhes) {
    return (
      <div className="detalhes-container">
        <button className="back-btn" onClick={() => navigate(-1)}>← Voltar</button>
        <div className="detalhes-card">
          <div style={{ padding: 16 }}>{error ?? 'Detalhes não encontrados'}</div>
        </div>
      </div>
    );
  }

  const localObj = Array.isArray(detalhes.local) ? detalhes.local[0] : (detalhes.local as any) || null;

  return (
    <div className="detalhes-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Voltar</button>

      <div className="detalhes-card">
        <div className="layout-grid">
          <div>
            <h2 className="detalhes-nome">{detalhes.nome}</h2>
            <p className="detalhes-info">{detalhes.data} • {detalhes.hora}</p>

            {localObj ? (
              <div className="detalhes-section">
                <h3 className="text-muted">Local</h3>
                <p className="detalhes-loc">{localObj.nome}</p>
                <p className="detalhes-end">
                  {localObj.logradouro ?? ''} {localObj.numero ?? ''} {localObj.cidade ? `, ${localObj.cidade}` : ''}
                  {localObj.cep ? ` • CEP: ${localObj.cep}` : ''}
                </p>
              </div>
            ) : (
              <p className="detalhes-section detalhes-loc">Local não informado</p>
            )}

            {detalhes.times && detalhes.times.length > 0 && (
              <div className="detalhes-section">
                <h3>Times</h3>
                <div>
                  {detalhes.times.map((time, idx) => (
                    <div key={idx} className="time-group">
                      <strong>{time.nome}</strong>
                      <ul>
                        {time.jogadores?.map(j => (
                          <li key={j.id}>{j.nome}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside>
            <div className="detalhes-section">
              <h3>Jogadores Confirmados</h3>

              <div className="confirmados-list">
                {detalhes.jogadores && detalhes.jogadores.length > 0 ? (
                  <ul>
                    {detalhes.jogadores.map(j => (
                      <li key={j.id}>
                        <span>{j.nome} {j.organizador ? '(Org.)' : ''}</span>
                        <span style={{ color: '#777', fontSize: 12 }}>{ j.confirmado === 1 || j.confirmado === true ? '✓' : ''}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">Nenhum jogador confirmado ainda.</p>
                )}
              </div>

              <div className="detalhes-actions" style={{ marginTop: 12 }}>
                <label>
                  <input
                    type="checkbox"
                    checked={jogLinha}
                    onChange={() => setJogLinha(prev => !prev)}
                    disabled={!partidaUsuarioId}
                  />
                  Jogador de Linha
                </label>

                <button
                  onClick={handleConfirmar}
                  disabled={!partidaUsuarioId || saving}
                >
                  {saving ? 'Salvando...' : partidaUsuarioId ? 'Confirmar presença' : 'Participar para confirmar'}
                </button>

                {error && <p style={{ color: 'red', marginTop: 8 }}>{error}</p>}
              </div>
            </div>
          </aside>
        </div>
      </div>
=======
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
>>>>>>> 92530273af90d462bdd3346451c0ef11d1b4d93d
    </div>
  );
};

export default PartidaDetalhes;
