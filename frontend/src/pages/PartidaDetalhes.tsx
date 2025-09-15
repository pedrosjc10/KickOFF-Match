import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  buscarDetalhesPartida,
  buscarConfirmados,
  confirmarPresenca,
  atualizarPartidaUsuario,
} from "../services/partidaService";
import "../styles/PartidaDetalhes.css";

interface Jogador {
  id: number;
  nome: string;
  confirmado: number | boolean;
  organizador: number | boolean;
  jog_linha: number | boolean;
}

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
  const [confirmados, setConfirmados] = useState<Jogador[]>([]);
  const [loading, setLoading] = useState(true);

  // Carrega detalhes e confirmados
  const carregarDados = async () => {
    if (!id) return;
    try {
      const partidaData = await buscarDetalhesPartida(id);
      setPartida(partidaData);
      const confirmadosData = await buscarConfirmados(Number(id));
      setConfirmados(confirmadosData);
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
  const handleConfirmar = async (partidaUsuarioId: string) => {
    try {
      await confirmarPresenca(partidaUsuarioId, true);
      await carregarDados();
    } catch (error) {
      console.error("Erro ao confirmar presença:", error);
    }
  };

  // Alternar entre jogador de linha e goleiro
  const handleToggleJogLinha = async (partidaUsuarioId: number, jog_linha: number | boolean) => {
    try {
      await atualizarPartidaUsuario(partidaUsuarioId, {
        jog_linha: jog_linha ? 0 : 1,
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

          <h3>Jogadores Confirmados</h3>
          <ul>
            {confirmados.map((jogador) => (
              <li key={jogador.id}>
                {jogador.nome}{" "}
                {jogador.confirmado ? (
                  <>
                    -{" "}
                    <button
                      onClick={() =>
                        handleToggleJogLinha(jogador.id, jogador.jog_linha)
                      }
                    >
                      {jogador.jog_linha ? "⚽ Jogador de Linha" : "🧤 Goleiro"}
                    </button>
                  </>
                ) : (
                  <button onClick={() => handleConfirmar(String(jogador.id))}>
                    Confirmar Presença
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* Botão global no final da página */}
          <div className="confirmar-container">
            <button
              onClick={() => {
                const usuario = confirmados.find((j) => !j.confirmado);
                if (usuario) handleConfirmar(String(usuario.id));
              }}
            >
              Confirmar Minha Presença
            </button>
          </div>
        </>
      ) : (
        <p>Partida não encontrada</p>
      )}
    </div>
  );
};

export default PartidaDetalhes;
