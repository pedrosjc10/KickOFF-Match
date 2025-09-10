import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  buscarDetalhesPartida,
  buscarConfirmados,
  buscarRelacaoPartidaUsuario,
  confirmarPresenca,
  atualizarPartida,
  PartidaDetalhes,
  Jogador,
} from "../services/partidaService";
import { useUserStore } from "../stores/userStore";
import "../styles/PartidaDetalhes.css";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const PartidaDetalhesPage: React.FC = () => {
  const { id: partidaId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useUserStore();

  const [detalhes, setDetalhes] = useState<PartidaDetalhes | null>(null);
  const [confirmados, setConfirmados] = useState<Jogador[]>([]);
  const [partidaUsuarioId, setPartidaUsuarioId] = useState<number | null>(null);
  const [jogLinhaLocal, setJogLinhaLocal] = useState<boolean>(false);
  const [overalls, setOveralls] = useState<Record<number, number>>({});
  const [resultado, setResultado] = useState<{ teamA: Jogador[]; teamB: Jogador[] } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // carrega dados quando entrar na página / quando partidaId mudar
  useEffect(() => {
    const load = async () => {
      setError(null);
      if (!partidaId || isNaN(Number(partidaId))) {
        setError("ID de partida inválido");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const det = await buscarDetalhesPartida(partidaId);
        setDetalhes(det);

        const conf = await buscarConfirmados(Number(partidaId));
        // garantir formato consistente (confirmado: 1|0 ou boolean)
        const normalized = conf.map((c: any) => ({
          ...c,
          confirmado: typeof c.confirmado === "number" ? c.confirmado : (c.confirmado ? 1 : 0),
          organizador: Boolean(c.organizador),
          jog_linha: Boolean(c.jog_linha),
        })) as Jogador[];
        setConfirmados(normalized);

        // inicializa overalls com 50 se ainda não tiver
        const initialOveralls: Record<number, number> = {};
        normalized.forEach(p => {
          initialOveralls[p.id] = initialOveralls[p.id] ?? 50;
        });
        setOveralls(initialOveralls);

        // busca relação usuario-partida pra pegar partidaUsuarioId e jogLinha (se existir)
        if (usuario?.id) {
          try {
            const rel = await buscarRelacaoPartidaUsuario(usuario.id, Number(partidaId));
            if (rel?.id) {
              setPartidaUsuarioId(rel.id);
              setJogLinhaLocal(Boolean(rel.jog_linha));
            } else {
              setPartidaUsuarioId(null);
              setJogLinhaLocal(false);
            }
          } catch {
            setPartidaUsuarioId(null);
            setJogLinhaLocal(false);
          }
        }
      } catch (err: any) {
        console.error("Erro carregar detalhes:", err);
        setError(err?.response?.data?.error ?? "Erro ao carregar detalhes");
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partidaId, usuario?.id]);

  const isOrganizer = useMemo(() => {
    // determinamos organizador se algum confirmados tiver organizador=true e id === usuario.id
    if (!usuario?.id) return false;
    return confirmados.some(c => c.id === usuario.id && Boolean(c.organizador));
  }, [confirmados, usuario?.id]);

  const handleConfirmarPresenca = async () => {
    if (!partidaUsuarioId) return;
    setSaving(true);
    try {
      await confirmarPresenca(partidaUsuarioId.toString(), jogLinhaLocal);
      const conf = await buscarConfirmados(Number(partidaId));
      const normalized = conf.map((c: any) => ({
        ...c,
        confirmado: typeof c.confirmado === "number" ? c.confirmado : (c.confirmado ? 1 : 0),
        organizador: Boolean(c.organizador),
        jog_linha: Boolean(c.jog_linha),
      })) as Jogador[];
      setConfirmados(normalized);
    } catch (err) {
      console.error(err);
      setError("Erro ao confirmar presença");
    } finally {
      setSaving(false);
    }
  };

  // Atualizar data/hora (somente organizador)
  const handleAtualizarData = async (novaData: string) => {
    if (!detalhes) return;
    const hoje = new Date().toISOString().split("T")[0];
    if (novaData < hoje) {
      setError("Não é possível escolher datas anteriores.");
      return;
    }
    try {
      await atualizarPartida(Number(detalhes.id), { data: novaData });
      setDetalhes({ ...detalhes, data: novaData });
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Erro ao atualizar data.");
    }
  };

  const handleAtualizarHora = async (novaHora: string) => {
    if (!detalhes) return;
    const hoje = new Date().toISOString().split("T")[0];
    if (detalhes.data === hoje) {
      const agoraHM = new Date().toTimeString().slice(0, 5);
      if (novaHora < agoraHM) {
        setError("Horário já passou para hoje.");
        return;
      }
    }
    try {
      await atualizarPartida(Number(detalhes.id), { hora: novaHora });
      setDetalhes({ ...detalhes, hora: novaHora });
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Erro ao atualizar horário.");
    }
  };

  // altera overall na UI somente
  const handleOverallChange = (playerId: number, value: number) => {
    const v = clamp(Math.round(value), 50, 99);
    setOveralls(prev => ({ ...prev, [playerId]: v }));
  };

  // Sorteio dos times (apenas client-side; mostra resultado sem persistir)
  const handleSortearTimes = () => {
    if (!detalhes) return;
    // quantidade por time (se existir tipoPartida.quantidadejogadores)
    const perTeam =
      (detalhes as any)?.tipoPartida?.quantidadejogadores ??
      ((detalhes as any)?.tipoPartida?.quantidadeJogadores ?? 0);

    // se não tiver info sobre tipoPartida, tenta assumir 5 (fallback)
    const perTeamFinal = perTeam > 0 ? perTeam : 5;
    const totalNeeded = perTeamFinal * 2;

    // jogadores de linha confirmados
    const lines = confirmados.filter(c => Boolean(c.jog_linha));
    if (lines.length < Math.max(0, totalNeeded - 0)) {
      setError("Não há jogadores de linha suficientes para sortear.");
      return;
    }

    // goleiros (não jogador de linha)
    const keepers = confirmados.filter(c => !c.jog_linha);

    // prepare array with overalls map
    const getOverall = (p: Jogador) => overalls[p.id] ?? 50;

    // Copy arrays to mutate
    const linesPool = [...lines];
    // sort descending by overall to balance by greedy
    linesPool.sort((a, b) => getOverall(b) - getOverall(a));

    // teams
    const teamA: Jogador[] = [];
    const teamB: Jogador[] = [];

    // ensure 1 keeper per team (if exist)
    if (keepers.length >= 2) {
      teamA.push(keepers[0]);
      teamB.push(keepers[1]);
    } else if (keepers.length === 1) {
      // reuse keeper if only one
      teamA.push(keepers[0]);
      teamB.push(keepers[0]);
    } // else no keepers at all -> teams will be composed of lines only

    // initialize sums
    let sumA = teamA.reduce((s, p) => s + getOverall(p), 0);
    let sumB = teamB.reduce((s, p) => s + getOverall(p), 0);

    // Distribute lines to balance sums and respect perTeamFinal
    // If not enough players, we will repeat from the pool circularly (allowed)
    let i = 0;
    while (teamA.length < perTeamFinal || teamB.length < perTeamFinal) {
      const idx = i % linesPool.length;
      const player = linesPool[idx];
      // avoid assigning same player twice to same team only if possible — but repeating is allowed
      if (teamA.length < perTeamFinal && sumA <= sumB) {
        teamA.push(player);
        sumA += getOverall(player);
      } else if (teamB.length < perTeamFinal) {
        teamB.push(player);
        sumB += getOverall(player);
      } else if (teamA.length < perTeamFinal) {
        teamA.push(player);
        sumA += getOverall(player);
      }
      i++;
      // safety break (shouldn't be infinite because we allow reuse)
      if (i > perTeamFinal * linesPool.length * 3) break;
    }

    setResultado({ teamA, teamB });
    setError(null);
  };

  if (loading) {
    return (
      <div className="detalhes-container">
        <div className="detalhes-card">Carregando...</div>
      </div>
    );
  }

  if (!detalhes) {
    return (
      <div className="detalhes-container">
        <div className="detalhes-card">
          <button className="back-btn" onClick={() => navigate(-1)}>← Voltar</button>
          <div>{error ?? "Detalhes não encontrados"}</div>
        </div>
      </div>
    );
  }

  const localObj = Array.isArray(detalhes.local) ? detalhes.local[0] : (detalhes.local as any) || null;

  return (
    <div className="detalhes-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Voltar</button>

      <div className="detalhes-card">
        <h2 className="detalhes-nome">{detalhes.nome}</h2>
        <p className="detalhes-info">{detalhes.data} • {detalhes.hora}</p>

        {localObj ? (
          <div className="detalhes-section">
            <h3 className="text-muted">Local</h3>
            <p className="detalhes-loc">{localObj.nome}</p>
            <p className="detalhes-end">{localObj.logradouro ?? ""} {localObj.numero ?? ""} {localObj.cidade ? `, ${localObj.cidade}` : ""}</p>
          </div>
        ) : (
          <p className="detalhes-section detalhes-loc">Local não informado</p>
        )}

        {isOrganizer && (
          <div className="detalhes-section">
            <h3>Controles do Organizador</h3>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <label>
                Data:
                <input
                  type="date"
                  value={detalhes.data}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => handleAtualizarData(e.target.value)}
                />
              </label>

              <label>
                Hora:
                <input
                  type="time"
                  value={detalhes.hora}
                  onChange={(e) => handleAtualizarHora(e.target.value)}
                />
              </label>
            </div>
          </div>
        )}

        <div className="detalhes-section">
          <h3>Jogadores Confirmados</h3>
          {confirmados.length > 0 ? (
            <ul className="confirmados-list">
              {confirmados.map((j) => (
                <li key={j.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>{j.nome}</strong> {j.organizador ? <span style={{ color: "#666", fontSize: 12 }}>(Org.)</span> : null}
                    <div style={{ fontSize: 12, color: "#666" }}>{j.jog_linha ? "Jogador de Linha" : "Goleiro"}</div>
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {isOrganizer && (
                      <>
                        <input
                          type="number"
                          min={50}
                          max={99}
                          value={overalls[j.id] ?? 50}
                          onChange={(e) => handleOverallChange(j.id, Number(e.target.value))}
                          style={{ width: 72 }}
                        />
                      </>
                    )}
                    <span style={{ fontSize: 14, color: "#777" }}>{j.confirmado === 1 || j.confirmado === true ? "✓" : ""}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">Nenhum jogador confirmado ainda.</p>
          )}
        </div>

        {isOrganizer && (
          <div style={{ marginTop: 12 }}>
            <button onClick={handleSortearTimes} className="sort-btn">🎲 Sortear Times</button>
            {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
          </div>
        )}

        {resultado && (
          <div className="detalhes-section" style={{ marginTop: 16 }}>
            <h3>Resultado do Sorteio</h3>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <h4>Time A (soma: {resultado.teamA.reduce((s, p) => s + (overalls[p.id] ?? 50), 0)})</h4>
                <ul>
                  {resultado.teamA.map(p => (
                    <li key={`A-${p.id}`}>{p.nome} — {overalls[p.id] ?? 50} {p.jog_linha ? "" : "(G)"}</li>
                  ))}
                </ul>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <h4>Time B (soma: {resultado.teamB.reduce((s, p) => s + (overalls[p.id] ?? 50), 0)})</h4>
                <ul>
                  {resultado.teamB.map(p => (
                    <li key={`B-${p.id}`}>{p.nome} — {overalls[p.id] ?? 50} {p.jog_linha ? "" : "(G)"}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartidaDetalhesPage;
