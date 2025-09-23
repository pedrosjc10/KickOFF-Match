import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  buscarDetalhesPartida,
  buscarConfirmados,
  atualizarPartidaUsuario,
  Jogador, // Importa a interface do arquivo de serviço
} from "../services/partidaService";
import "../styles/PartidaDetalhes.css";

// Simula a obtenção do usuário logado. Em um app real, isso viria de um contexto ou estado global.
const getUsuarioLogadoId = (): number => {
  // Substitua por lógica real para obter o ID do usuário logado
  return 1;
};

interface Partida {
  id: number;
  nome: string;
  data: string;
  hora: string;
  tipo: string;
  local?: { nome: string; cidade: string };
  tipoPartida?: {
    id?: number;
    nometipopartida?: string;
    quantidadejogadores?: number;
  };
}

const PartidaDetalhes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [partida, setPartida] = useState<Partida | null>(null);
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [loading, setLoading] = useState(true);
  const usuarioLogadoId = getUsuarioLogadoId();

  const jogadoresConfirmados = jogadores.filter(
    (jogador) => jogador.confirmado
  );
  const jogadoresParticipantes = jogadores.filter(
    (jogador) => !jogador.confirmado
  );

  const usuarioLogado = jogadores.find(
    (jogador) => jogador.id === usuarioLogadoId
  );
  const usuarioNaoConfirmou = usuarioLogado && !usuarioLogado.confirmado;

  // Carrega detalhes e todos os jogadores
  const carregarDados = async () => {
    if (!id) return;
    try {
      const partidaData = await buscarDetalhesPartida(id);
      setPartida(partidaData);
      const jogadoresData = await buscarConfirmados(Number(id)); // Renomeei a função para buscar todos os jogadores, não apenas confirmados
      setJogadores(jogadoresData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [id]);

  // Confirma presença
  const handleConfirmar = async () => {
    if (!usuarioLogado) return;
    try {
      await atualizarPartidaUsuario(usuarioLogado.id, {
        confirmado: 1,
        jog_linha: 1, // Define como jogador de linha por padrão
      });
      await carregarDados();
    } catch (error) {
      console.error("Erro ao confirmar presença:", error);
    }
  };

  // Alterna entre jogador de linha e goleiro com o checkbox
  const handleToggleJogLinha = async (
    jogadorId: number,
    isJogLinha: number | boolean,
    isChecked: boolean
  ) => {
    try {
      await atualizarPartidaUsuario(jogadorId, {
        jog_linha: isChecked ? 1 : 0,
      });
      await carregarDados();
    } catch (error) {
      console.error("Erro ao atualizar posição:", error);
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="detalhes-container">
      {partida ? (
        <>
          <h2>{partida.nome}</h2>
          <p>
            <strong>Data:</strong> {new Date(partida.data).toLocaleDateString("pt-BR")} às{" "}
            {partida.hora?.slice(0, 5)}
          </p>
          <p>
            <strong>Local:</strong> {partida.local?.nome} - {partida.local?.cidade}
          </p>
          <p>
            <strong>Tipo:</strong> {partida.tipo}
          </p>

          {/* Lista de Jogadores Confirmados */}
          ---
          <h3>Jogadores Confirmados ({jogadoresConfirmados.length})</h3>
          <ul>
            {jogadoresConfirmados.map((jogador) => (
              <li key={jogador.id}>
                {jogador.nome}{" "}
                {jogador.organizador && <span>(Organizador)</span>}
                {jogador.id === usuarioLogadoId && (
                  <label>
                    <input
                      type="checkbox"
                      checked={!!jogador.jog_linha}
                      onChange={(e) =>
                        handleToggleJogLinha(
                          jogador.id,
                          jogador.jog_linha,
                          e.target.checked
                        )
                      }
                    />{" "}
                    {!!jogador.jog_linha ? "⚽ Jogador de Linha" : "🧤 Goleiro"}
                  </label>
                )}
                {jogador.id !== usuarioLogadoId && (
                  <span>
                    {" - "}
                    {!!jogador.jog_linha ? "⚽ Jogador de Linha" : "🧤 Goleiro"}
                  </span>
                )}
              </li>
            ))}
          </ul>

          {/* Lista de Jogadores Participantes */}
          ---
          <h3>Jogadores Participantes ({jogadoresParticipantes.length})</h3>
          <ul>
            {jogadoresParticipantes.map((jogador) => (
              <li key={jogador.id}>
                {jogador.nome} {jogador.organizador && <span>(Organizador)</span>}
              </li>
            ))}
          </ul>

          {/* Botão para o usuário logado confirmar sua presença */}
          {usuarioNaoConfirmou && (
            <div className="confirmar-container">
              <button onClick={handleConfirmar}>Confirmar Minha Presença</button>
            </div>
          )}
        </>
      ) : (
        <p>Partida não encontrada</p>
      )}
    </div>
  );
};

export default PartidaDetalhes;
