import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  buscarDetalhesPartida,
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
    }
  };

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
    </div>
  );
};

export default PartidaDetalhesPage;
