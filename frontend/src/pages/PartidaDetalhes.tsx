import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  buscarDetalhesPartida,
  buscarConfirmados,
  atualizarPartidaUsuario,
  buscarTodosParticipantes,
  verificarSeOrganizador,
  Jogador,
  TipoEnum, // <--- Importado como um VALOR (enum)
} from "../services/partidaService";
import "../styles/PartidaDetalhes.css";
import { useUserStore } from "../stores/userStore";

import Player from "../components/Player";

// Removido: export type TipoEnum = "privado" | "publico";
// Agora ele é importado do service.

interface Partida {
  id: number;
  nome: string;
  data: string;
  hora: string;
  // Usamos as string literals no React, mas aceitamos o enum do service
  tipo: "privado" | "publico";
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
  const [jogLinhaSelecionado, setJogLinhaSelecionado] = useState<boolean | null>(null);
  const [isOrganizador, setIsOrganizador] = useState<boolean>(false);
  const { usuario } = useUserStore();

  const usuarioLogadoNaoConfirmou = jogadoresNaoConfirmados.find(
    (jogador) => jogador.id === usuario?.id
  );

  // Função central para buscar todos os dados
  const carregarDados = async () => {
    if (!id) return;
    if (!usuario?.id) return;
    try {
      setLoading(true);
      const partidaData = await buscarDetalhesPartida(id);

      let tipoConvertido = partidaData.tipo;

      // CORREÇÃO: Usa o enum importado para conversão
      if (typeof tipoConvertido === "number") {
        tipoConvertido = TipoEnum[tipoConvertido] as "privado" | "publico";
      }
      setPartida({ ...partidaData, tipo: tipoConvertido as "privado" | "publico" });

      const confirmadosData = await buscarConfirmados(Number(id));
      setJogadoresConfirmados(confirmadosData);

      const todosParticipantes = await buscarTodosParticipantes(Number(id));
      const naoConfirmadosData = todosParticipantes.filter(
        (jogador) => !jogador.confirmado
      );
      setJogadoresNaoConfirmados(naoConfirmadosData);

      const organizador = await verificarSeOrganizador(usuario?.id, Number(id));
      setIsOrganizador(organizador);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line
  }, [id]);

  const handleConfirmar = async () => {
    if (!usuarioLogadoNaoConfirmou || jogLinhaSelecionado === null) return;
    try {
      await atualizarPartidaUsuario(usuarioLogadoNaoConfirmou.id, partida?.id || 0, {
        confirmado: 1,
        jog_linha: jogLinhaSelecionado ? 1 : 0,
      });
      await carregarDados();
    } catch (error) {
      console.error("Erro ao confirmar presença:", error);
    }
  };

  const handleToggleJogLinha = async (jogadorId: number, partidaId: number, isChecked: boolean) => {
    try {
      await atualizarPartidaUsuario(jogadorId, partidaId, {
        jog_linha: isChecked ? 1 : 0,
      });
      await carregarDados(); // Recarrega os dados para atualizar a lista
    } catch (error) {
      console.error("Erro ao atualizar posição:", error);
    }
  };

  // Função passada para o componente Player para salvar a habilidade
  const handleAtualizarHabilidade = async (jogadorId: number, partidaId: number, novaHabilidade: number) => {
    try {
      console.log("Atualizando habilidade para jogadorId:", jogadorId, "com valor:", novaHabilidade);
      
      // 1. Chama o serviço de atualização (PUT)
      await atualizarPartidaUsuario(jogadorId, partidaId, { habilidade: novaHabilidade }); 
        
      // 2. RECUPERA A LISTA ATUALIZADA DO SERVIDOR (Este é o passo crucial!)
      const confirmadosData = await buscarConfirmados(Number(id));
      setJogadoresConfirmados(confirmadosData); // Atualiza o estado que é passado como prop para o Player
    } catch (error) {
      console.error("Erro ao atualizar habilidade:", error);
      throw error; // Lança o erro para que o componente Player possa exibi-lo
    }
  }

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

          <hr />

          <h3>Jogadores Confirmados ({jogadoresConfirmados.length})</h3>
          <ul>
            {/* Renderiza o componente Player, passando a nova função de salvar */}
            {jogadoresConfirmados.map((jogador) => (
              <Player
                key={jogador.id}
                jogador={jogador}
                partida={partida}
                isOrganizador={isOrganizador}
                handleToggleJogLinha={handleToggleJogLinha}
                handleSalvarHabilidade={handleAtualizarHabilidade} 
              />
            ))}
          </ul>

          <hr />

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
              <label>
                Selecione sua posição:
                <select
                  value={
                    jogLinhaSelecionado === null
                      ? ""
                      : jogLinhaSelecionado
                      ? "linha"
                      : "goleiro"
                  }
                  onChange={(e) => setJogLinhaSelecionado(e.target.value === "linha")}
                >
                  <option value="">Selecione</option>
                  <option value="linha">Jogador de Linha</option>
                  <option value="goleiro">Goleiro</option>
                </select>
              </label>
              <button onClick={handleConfirmar} disabled={jogLinhaSelecionado === null}>
                Confirmar Minha Presença
              </button>
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