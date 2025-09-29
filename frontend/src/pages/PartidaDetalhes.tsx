import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  buscarDetalhesPartida,
  buscarConfirmados,
  atualizarPartidaUsuario,
  buscarTodosParticipantes,
  verificarSeOrganizador,
  Jogador,
} from "../services/partidaService";
import "../styles/PartidaDetalhes.css";
import { useUserStore } from "../stores/userStore";

// Importe o novo componente
import Player from "../components/Player"; // Certifique-se de que o caminho está correto

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

// Interface para rastrear a edição de habilidade de um jogador específico (MANTIDA AQUI)
interface EdicaoHabilidade {
  jogadorId: number | null;
  valor: number | string;
  erro: string;
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

  // LÓGICA DE EDIÇÃO DE HABILIDADE
  const [editandoHabilidade, setEditandoHabilidade] = useState<EdicaoHabilidade>({
    jogadorId: null,
    valor: "",
    erro: "",
  });

  // Encontra o usuário logado na lista de não confirmados
  const usuarioLogadoNaoConfirmou = jogadoresNaoConfirmados.find(
    (jogador) => jogador.id === usuario?.id
  );

  // Carrega todos os dados da partida
  const carregarDados = async () => {
    if (!id) return;
    if (!usuario?.id) return;
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

      // Verifica se o usuário logado é o organizador da partida
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
      await atualizarPartidaUsuario(usuarioLogadoNaoConfirmou.id, {
        confirmado: 1,
        jog_linha: jogLinhaSelecionado ? 1 : 0,
      });
      await carregarDados();
    } catch (error) {
      console.error("Erro ao confirmar presença:", error);
    }
  };

  // Função passada para o componente filho (Não alterada)
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

  // Função original que faz a chamada PUT (mantida)
  const handleAlterarHabilidade = async (jogadorId: number, novaHabilidade: number) => {
    try {
      await atualizarPartidaUsuario(jogadorId, { habilidade: novaHabilidade });
      // Não chame carregarDados aqui, a nova função de salvar fará isso
    } catch (error) {
      console.error("Erro ao atualizar habilidade:", error);
      throw error; // Propagar o erro para o handler de salvar
    }
  };

  // Função para Salvar com Validação e Controle de Estado (mantida)
  const handleSalvarHabilidadeComValidacao = async (jogadorId: number) => {
    const valorNumerico = Number(editandoHabilidade.valor);

    // 1. Validação de Parâmetros
    if (isNaN(valorNumerico)) {
      setEditandoHabilidade({ ...editandoHabilidade, erro: "Valor inválido." });
      return;
    }
    if (valorNumerico < 50 || valorNumerico > 90) {
      setEditandoHabilidade({
        ...editandoHabilidade,
        erro: "O valor deve ser entre 50 e 90.",
      });
      return;
    }

    try {
      // 2. Chama a função de serviço
      await handleAlterarHabilidade(jogadorId, valorNumerico);
      
      // 3. Limpa o estado de edição e recarrega dados
      setEditandoHabilidade({ jogadorId: null, valor: "", erro: "" });
      await carregarDados();
    } catch (error) {
      setEditandoHabilidade({ ...editandoHabilidade, erro: "Erro ao salvar no servidor." });
    }
  };


  // Função para iniciar a edição (mantida)
  const handleIniciarEdicao = (jogador: Jogador) => {
    setEditandoHabilidade({
      jogadorId: jogador.id,
      valor: jogador.habilidade ?? 50, // Pega o valor atual ou um default
      erro: "",
    });
  };

  // Função para cancelar a edição (mantida)
  const handleCancelarEdicao = () => {
    setEditandoHabilidade({ jogadorId: null, valor: "", erro: "" });
  };
  // FIM CÓDIGO DE EDIÇÃO

  const handleAtualizarHabilidade = async (jogadorId: number, novaHabilidade: number) => {
    try {
      console.log("Atualizando habilidade para jogadorId:", jogadorId, "com valor:", novaHabilidade);
        await atualizarPartidaUsuario(jogadorId, { habilidade: novaHabilidade }); 
        
        // **IMPORTANTE**: Após salvar, recarregue a lista de jogadores 
        // para que o valor de 'jogador.habilidade' no Player seja atualizado.
        const confirmadosData = await buscarConfirmados(Number(id));
        setJogadoresConfirmados(confirmadosData);
    } catch (error) {
        console.error("Erro ao atualizar habilidade:", error);
        throw error; // Lança o erro para ser capturado no componente Player (opcional, dependendo da sua necessidade)
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
            {/* UTILIZANDO O NOVO COMPONENTE AQUI */}
            {jogadoresConfirmados.map((jogador) => (
              <Player
        key={jogador.id}
        jogador={jogador}
        isOrganizador={isOrganizador}
        handleToggleJogLinha={handleToggleJogLinha}
        handleSalvarHabilidade={handleAtualizarHabilidade} // Passando a nova função
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