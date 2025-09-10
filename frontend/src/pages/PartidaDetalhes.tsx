import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  buscarDetalhesPartida,
  buscarConfirmados,
  buscarRelacaoPartidaUsuario,
  confirmarPresenca,
  atualizarPartida,
  atualizarPartidaUsuario, // <- NOVO
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
  const [partidaUsuarioId, setPartidaUsuarioId] = useState<number | null>(null); // registro do usuario atual na pivot
  const [jogLinhaLocal, setJogLinhaLocal] = useState<boolean>(false); // estado local do checkbox do próprio usuário
  const [overalls, setOveralls] = useState<Record<number, number>>({});
  const [resultado, setResultado] = useState<{ teamA: Jogador[]; teamB: Jogador[] } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // carrega detalhes + confirmados + relação (para saber partidaUsuarioId)
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
        const normalized = conf.map((c: any) => ({
          ...c,
          id: c.id, // aqui id do usuário (como o backend já mapeou)
          confirmado: typeof c.confirmado === "number" ? c.confirmado : (c.confirmado ? 1 : 0),
          organizador: Boolean(c.organizador),
          jog_linha: Boolean(c.jog_linha),
        })) as Jogador[];
        setConfirmados(normalized);

        const initialOveralls: Record<number, number> = {};
        normalized.forEach(p => {
          initialOveralls[p.id] = initialOveralls[p.id] ?? 50;
        });
        setOveralls(initialOveralls);

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

  // NOVO: toggle jog_linha para o próprio usuário (escolher não ser goleiro)
  const handleToggleJogLinhaOwn = async (newVal: boolean) => {
    if (!partidaUsuarioId) {
      setError("Relação partida-usuario não encontrada");
      return;
    }
    setSaving(true);
    try {
      // backend espera smallint — enviamos 1/0
      await atualizarPartidaUsuario(partidaUsuarioId, { jog_linha: newVal ? 1 : 0 });
      // atualizar estados locais:
      setJogLinhaLocal(newVal);
      // refetch confirmados para refletir mudança
      const conf = await buscarConfirmados(Number(partidaId));
      const normalized = conf.map((c: any) => ({
        ...c,
        confirmado: typeof c.confirmado === "number" ? c.confirmado : (c.confirmado ? 1 : 0),
        organizador: Boolean(c.organizador),
        jog_linha: Boolean(c.jog_linha),
      })) as Jogador[];
      setConfirmados(normalized);
      setError(null);
    } catch (err) {
      console.error("Erro ao atualizar posição:", err);
      setError("Erro ao atualizar posição");
    } finally {
      setSaving(false);
    }
  };

  // Atualizar data/hora (organizador) - idem já implementado
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

  // altera overall UI-only
  const handleOverallChange = (playerId: number, value: number) => {
    const v = clamp(Math.round(value), 50, 99);
    setOveralls(prev => ({ ...prev, [playerId]: v }));
  };

  // Sorteio dos times (client-side) — função já implementada anteriormente (handleSortearTimes)
  const handleSortearTimes = () => {
    if (!detalhes) return;
    const perTeam =
      (detalhes as any)?.tipoPartida?.quantidadejogadores ??
      ((detalhes as any)?.tipoPartida?.quantidadeJogadores ?? 0);
    const perTeamFinal = perTeam > 0 ? perTeam : 5;
    const totalNeeded = perTeamFinal * 2;

    const lines = confirmados.filter(c => Boolean(c.jog_linha));
    if (lines.length < Math.max(0, totalNeeded - 0)) {
      setError("Não há jogadores de linha suficientes para sortear.");
      return;
    }

    const keepers = confirmados.filter(c => !c.jog_linha);
    const getOverall = (p: Jogador) => overalls[p.id] ?? 50;
    const linesPool = [...lines];
    linesPool.sort((a, b) => getOverall(b) - getOverall(a));

    const teamA: Jogador[] = [];
    const teamB: Jogador[] = [];

    if (keepers.length >= 2) {
      teamA.push(keepers[0]);
      teamB.push(keepers[1]);
    } else if (keepers.length === 1) {
      teamA.push(keepers[0]);
      teamB.push(keepers[0]);
    }

    let sumA = teamA.reduce((s, p) => s + getOverall(p), 0);
    let sumB = teamB.reduce((s, p) => s + getOverall(p), 0);

    let i = 0;
    while (teamA.length < perTeamFinal || teamB.length < perTeamFinal) {
      const idx = i % linesPool.length;
      const player = linesPool[idx];
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
                      <input
                        type="number"
                        min={50}
                        max={99}
                        value={overalls[j.id] ?? 50}
                        onChange={(e) => handleOverallChange(j.id, Number(e.target.value))}
                        style={{ width: 72 }}
                      />
                    )}

                    {/* NOVO: checkbox editável apenas se for o próprio usuário */}
                    {usuario?.id === j.id ? (
                      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <input
                          type="checkbox"
                          checked={Boolean(j.jog_linha)}
                          onChange={(e) => handleToggleJogLinhaOwn(e.target.checked)}
                          disabled={saving}
                        />
                        <span style={{ fontSize: 13 }}>Sou jogador de linha</span>
                      </label>
                    ) : (
                      <span style={{ fontSize: 13, color: "#777" }}>{j.confirmado === 1 || j.confirmado === true ? "✓" : ""}</span>
                    )}
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
