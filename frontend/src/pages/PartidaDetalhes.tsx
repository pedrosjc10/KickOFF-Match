import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  buscarDetalhesPartida,
  buscarConfirmados,
  atualizarPartidaUsuario,
  buscarTodosParticipantes, // Importa a nova função
  Jogador,
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
  const [jogadoresConfirmados, setJogadoresConfirmados] = useState<Jogador[]>([]);
  const [jogadoresNaoConfirmados, setJogadoresNaoConfirmados] = useState<Jogador[]>([]);
  const [loading, setLoading] = useState(true);
  const usuarioLogadoId = getUsuarioLogadoId();

  // Encontra o usuário logado na lista de não confirmados
  const usuarioLogadoNaoConfirmou = jogadoresNaoConfirmados.find(
    (jogador) => jogador.id === usuarioLogadoId
  );

  // Carrega todos os dados da partida
  const carregarDados = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const partidaData = await buscarDetalhesPartida(id);
      setPartida(partidaData);

      const confirmadosData = await buscarConfirmados(Number(id));
      setJogadoresConfirmados(confirmadosData);

      const todosParticipantes = await buscarTodosParticipantes(Number(id));
      const naoConfirmadosData = todosParticipantes.filter(
        (jogador) => !jogador.confirmado
      );
      setJogadoresNaoConfirmados(naoConfirmadosData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [id]);

  const handleConfirmar = async () => {
    if (!usuarioLogadoNaoConfirmou) return;
    try {
      await atualizarPartidaUsuario(usuarioLogadoNaoConfirmou.id, {
        confirmado: 1,
        jog_linha: 1,
      });
      await carregarDados(); // Recarrega os dados para atualizar as listas
    } catch (error) {
      console.error("Erro ao confirmar presença:", error);
    }
  };

  const handleToggleJogLinha = async (jogadorId: number, isChecked: boolean) => {
    try {
      await atualizarPartidaUsuario(jogadorId, {
        jog_linha: isChecked ? 1 : 0,
      });
      await carregarDados(); // Recarrega os dados para atualizar a lista
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

          ---

          <h3>Jogadores Confirmados ({jogadoresConfirmados.length})</h3>
          <ul>
            {jogadoresConfirmados.map((jogador) => (
              <li key={jogador.id}>
                {jogador.nome}{" "}
                {jogador.organizador ? <span>(Organizador)</span> : null}
                {jogador.id === usuarioLogadoId ? (
                  <label>
                    <input
                      type="checkbox"
                      checked={!!jogador.jog_linha}
                      onChange={(e) =>
                        handleToggleJogLinha(jogador.id, e.target.checked)
                      }
                    />{" "}
                    {!!jogador.jog_linha ? "⚽ Jogador de Linha" : "🧤 Goleiro"}
                  </label>
                ) : (
                  <span>
                    {" - "}
                    {!!jogador.jog_linha ? "⚽ Jogador de Linha" : "🧤 Goleiro"}
                  </span>
                )}
              </li>
            ))}
          </ul>

          ---

          <h3>Jogadores Participantes ({jogadoresNaoConfirmados.length})</h3>
          <ul>
            {jogadoresNaoConfirmados.map((jogador) => (
              <li key={jogador.id}>
                {jogador.nome} {jogador.organizador ? <span>(Organizador)</span> : null}
              </li>
            ))}
          </ul>

          {/* Botão para o usuário logado confirmar sua presença */}
          {!!usuarioLogadoNaoConfirmou && (
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
