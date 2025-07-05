import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  buscarDetalhesPartida,
  confirmarPresenca,
  buscarRelacaoPartidaUsuario,
  // sortearTimes,
  PartidaDetalhes
} from '../services/partidaService';
import { useUserStore } from '../stores/userStore';
import '../styles/PartidaDetalhes.css';

const PartidaDetalhesPage: React.FC = () => {
  const { id: partidaId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useUserStore();

  const [detalhes, setDetalhes] = useState<PartidaDetalhes | null>(null);
  const [jogLinha, setJogLinha] = useState<boolean>(false);
  const [partidaUsuarioId, setPartidaUsuarioId] = useState<number | null>(null);

  useEffect(() => {
    if (!partidaId) return;

    buscarDetalhesPartida(partidaId)
      .then(detalhes => setDetalhes(detalhes))
      .catch(console.error);

    if (usuario?.id) {
      buscarRelacaoPartidaUsuario(usuario.id, Number(partidaId))
        .then((relacao) => {
          setPartidaUsuarioId(relacao.id);
          setJogLinha(relacao.jog_linha);
        })
        .catch(console.error);
    }
  }, [partidaId, usuario]);

  const handleConfirmar = async () => {
  if (!partidaUsuarioId || !partidaId) return;

  try {
    await confirmarPresenca(partidaUsuarioId.toString(), jogLinha);
    
    // Atualiza apenas os dados da partida, sem reload da página
    const kek = await buscarDetalhesPartida(partidaId);
      setDetalhes(kek);
      console.log(detalhes);
      console.log(kek);
  } catch (err) {
    console.error("Erro ao confirmar presença:", err);
  }
};


  /* const handleSortear = async () => {
    if (!partidaId) return;
    try {
      const dados = await sortearTimes(partidaId);
      setDetalhes(dados);
    } catch (err) {
      console.error(err);
    }
  }; */

  if (!detalhes) return <div className="detalhes-loading">Carregando...</div>;

  //const isOrganizador = detalhes.jogadores?.some(j => j.organizador && j.id === usuario?.id);

  return (
    <div className="detalhes-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Voltar</button>
      <h2 className="detalhes-nome">{detalhes.nome}</h2>
      <p className="detalhes-info">{detalhes.data} | {detalhes.hora}</p>
      <p className="detalhes-loc">{detalhes.local.nome}</p>
      <p className="detalhes-end">{detalhes.local.endereco}</p>

      <div className="detalhes-section">
        <h3>Jogadores Confirmados</h3>
        {detalhes.jogadores && detalhes.jogadores.length > 0 ? (
          <ul>
            {detalhes.jogadores.map(j => (
              <li key={j.id}>{j.nome} {j.organizador && "(Org.)"}</li>
            ))}
          </ul>
        ) : (
          <p>Nenhum jogador confirmado ainda.</p>
        )}
      </div>

      {detalhes.times && (
        <div className="detalhes-section">
          <h3>Times</h3>
          {detalhes.times.map((time, idx) => (
            <div key={idx} className="time-group">
              <strong>{time.nome}</strong>
              <ul>
                {time.jogadores?.map(j => <li key={j.id}>{j.nome}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="detalhes-actions">
        <label>
          <input type="checkbox" checked={jogLinha} onChange={() => setJogLinha(!jogLinha)} />
          Jogador de Linha
        </label>
        <button onClick={handleConfirmar}>Confirmar presença</button>

        {/* Botão só aparece para organizadores */}
        {/* {isOrganizador && (
          <button className="sort-btn" onClick={handleSortear}>Sortear Times</button>
        )} */}
      </div>
    </div>
  );
};

export default PartidaDetalhesPage;
