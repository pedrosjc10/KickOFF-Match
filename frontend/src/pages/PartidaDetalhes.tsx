import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  buscarDetalhesPartida,
  buscarConfirmados,
  atualizarPartidaUsuario,
  buscarTodosParticipantes,
  verificarSeOrganizador,
  Jogador,
  sortearTimes,
  Time,
  leavePartida,
  PartidaDetalhes as PartidaDetalhesType, // Renomeado para evitar conflito com o nome do componente
} from "../services/partidaService";
import "../styles/PartidaDetalhes.css";
import { useUserStore } from "../stores/userStore";

import Player from "../components/Player";

// Removida a interface 'Partida' local, usaremos a PartidaDetalhes do service

const PartidaDetalhes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // Usando PartidaDetalhesType do service para o estado
  const [partida, setPartida] = useState<PartidaDetalhesType | null>(null);
  const [jogadoresConfirmados, setJogadoresConfirmados] = useState<Jogador[]>([]);
  const [jogadoresNaoConfirmados, setJogadoresNaoConfirmados] = useState<Jogador[]>([]);
  const [timesSorteados, setTimesSorteados] = useState<Time[]>([]);
  const [loading, setLoading] = useState(true);
  const [jogLinhaSelecionado, setJogLinhaSelecionado] = useState<boolean | null>(null);
  const [isOrganizador, setIsOrganizador] = useState<boolean>(false);
  const [desconfirmandoAll, setDesconfirmandoAll] = useState<boolean>(false);
  const { usuario } = useUserStore();
  const navigate = useNavigate();

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

      // ***** A CORREÇÃO PRINCIPAL ESTÁ AQUI: SETAR O ESTADO DA PARTIDA *****
      setPartida(partidaData); 
      // ********************************************************************

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
      // Se houver um erro (como 404), garantimos que 'partida' é null
      setPartida(null); 
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
        confirmado: true,
        jog_linha: jogLinhaSelecionado ? true : false,
      });
      await carregarDados();
    } catch (error) {
      console.error("Erro ao confirmar presença:", error);
    }
  };

  const handleToggleJogLinha = async (jogadorId: number, partidaId: number, isChecked: boolean) => {
    try {
      await atualizarPartidaUsuario(jogadorId, partidaId, {
        jog_linha: isChecked ? true : false,
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

  // NOVO: Função para executar o sorteio
  const handleSortearTimes = async () => {
    if (!partida?.id) return;
    try {
      const resultado = await sortearTimes(partida.id);
      setTimesSorteados(resultado);
      console.log("Sorteio realizado:", resultado);
    } catch (error) {
      console.error("Erro ao sortear times:", error);
      alert("Erro ao sortear times. Verifique o número mínimo de jogadores.");
    }
  };

  // NOVO: Função para confirmar os times no DB e reverter o status 'confirmado' de quem não foi escalado
  const handleConfirmarTimes = async () => {
    if (!partida?.id || timesSorteados.length === 0) return;

    try {
      // Recupera a lista de jogadores confirmados e extrai os seus IDs
      const confirmadosList = await buscarConfirmados(Number(partida.id));
      console.log("Jogadores que serão desconfirmados:", confirmadosList);

      const desconfirmacaoPromessas = confirmadosList.map(jogador => 
        atualizarPartidaUsuario(jogador.id, partida.id, { 
            confirmado: false 
        })
      );
      await Promise.all(desconfirmacaoPromessas);

      // 4. Limpa o sorteio e recarrega os dados para refletir as mudanças
      setTimesSorteados([]);
      await carregarDados(); 
      alert("Times confirmados! Jogadores não escalados foram movidos para a lista de participantes.");

    } catch (error) {
      console.error("Erro ao confirmar times:", error);
      alert("Erro ao confirmar times. Tente novamente.");
    }
  }

  // Função para desconfirmar todos os jogadores confirmados (visível para organizador)
  const handleDesconfirmarTodos = async () => {
    if (!partida?.id) return;
    if (!isOrganizador) return;

    const ok = window.confirm(
      "Tem certeza que deseja desconfirmar TODOS os jogadores confirmados? Isso irá movê-los para a lista de participantes."
    );
    if (!ok) return;

    try {
      setDesconfirmandoAll(true);

      // Recarrega os confirmados atuais
      const confirmadosAtual = await buscarConfirmados(Number(partida.id));

      if (!confirmadosAtual || confirmadosAtual.length === 0) {
        alert("Não há jogadores confirmados para desconfirmar.");
        setDesconfirmandoAll(false);
        return;
      }

      console.log("Desconfirmando jogadores:", confirmadosAtual.map(j => j.nome));

      // Aqui a gente usa o id do usuário e o id da partida,
      // assumindo que a rota é tipo /partida/:partidaId/usuario/:usuarioId
      const promessas = confirmadosAtual.map(jogador =>
        atualizarPartidaUsuario(jogador.id, partida.id, { confirmado: false })
      );

      // Espera todas as requisições terminarem
      const resultados = await Promise.allSettled(promessas);

      const falhas = resultados.filter(r => r.status === "rejected");
      if (falhas.length > 0) {
        console.error("Falhas ao desconfirmar:", falhas);
        alert(
          `Alguns jogadores não foram desconfirmados corretamente (${falhas.length}). Veja o console.`
        );
      } else {
        alert("Todos os jogadores confirmados foram desconfirmados.");
      }

      // Atualiza os dados da tela
      await carregarDados();
    } catch (error) {
      console.error("Erro ao desconfirmar todos:", error);
      alert("Erro ao desconfirmar jogadores. Tente novamente.");
    } finally {
      setDesconfirmandoAll(false);
    }
  };

  const handleSairDaPartida = async () => {
    try {
      // Executa o DELETE usando o id do registro partida_usuario
      await leavePartida(usuario?.id || 0, partida?.id || 0);
      alert("Você saiu da partida com sucesso!");
      await carregarDados();
    } catch (error) {
      console.error("Erro ao sair da partida:", error);
      alert("Erro ao sair da partida. Tente novamente.");
    }
  navigate(`/meusrachas`);
};




  if (loading) return <p>Carregando...</p>;

  return (
    <div className="detalhes-container">
      {partida ? (
        <>
        <button onClick={() => navigate("/meusrachas")}>
         Voltar para Meus Rachas
        </button>

          <h2>{partida.nome}</h2>
          <p>
            <strong>Data:</strong> {new Date(partida.data).toLocaleDateString("pt-BR")} às{" "}
            {partida.hora?.slice(0, 5)}
          </p>
          <p>
            {partida && Array.isArray(partida.local) && partida.local.length > 0 ? (
            <p>{`${partida.local[0].nome} - ${partida.local[0].cidade}`}</p>
            ) : (
            <p>Local não informado</p>
            )}
            {/* Ajustado o acesso ao local, pois sua interface sugere que local pode ser um array */}
          </p>
          <p>
            <strong>Tipo de Partida:</strong> {partida.tipoPartida?.nometipopartida} ({partida.tipoPartida?.quantidadejogadores} por time)
          </p>
          <hr />

          {/* BOTÃO DE SORTEIO VISÍVEL APENAS PARA O ORGANIZADOR */}
          {isOrganizador && timesSorteados.length === 0 && jogadoresConfirmados.length > 0 && (
            <div className="sorteio-area">
              <button onClick={handleSortearTimes}>Sortear Times</button>
              <button
                onClick={handleDesconfirmarTodos}
                style={{ marginLeft: 12, background: '#f66', color: '#fff' }}
                disabled={desconfirmandoAll}
              >
                {desconfirmandoAll ? 'Desconfirmando...' : 'Desconfirmar Todos'}
              </button>
            </div>
          )}

          {/* TABELA DE TIMES SORTEADOS */}
          {timesSorteados.length > 0 && (
            <div className="times-sorteados-container">
                <h3>Resultado do Sorteio</h3>
                <div className="times-grid">
                    {timesSorteados.map((time) => (
                        <div key={time.nome} className={`time-card ${time.nome.replace(' ', '-').toLowerCase()}`}>
                            <ul>
                                {time.jogadores.map((jogador) => (
                                    <li key={jogador.id}>
                                        {jogador.nome} ({jogador.habilidade})
                                        {/* Exibe (G) se o jogador for Goleiro (jog_linha é false) e não estiver no Time C */}
                                        {time.nome !== "Time C" && jogador.jog_linha === false ? <span style={{color: 'red'}}> (G)</span> : null}
                                    </li>
                                ))}
                            </ul>
                            {/* Exibição de substitutos, se houver (Time C) */}
                            {time.substitutos && (
                                <p>
                                    **Falta {time.substitutos.vaga} vaga**
                                    <br/>
                                    Opções de Repetição: {time.substitutos.opcoes.map(o => o.nome).join(' ou ')}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
                
                <div className="confirmar-sorteio-area">
                    <button onClick={handleConfirmarTimes} >
                        CONFIRMAR E FECHAR TIMES
                    </button>
                    <button onClick={() => setTimesSorteados([])} >
                        Sortear Novamente
                    </button>
                </div>
                <hr />
            </div>
          )}

          {/* LISTA DE JOGADORES CONFIRMADOS (Visível se o sorteio não estiver sendo exibido) */}
          {timesSorteados.length === 0 && (
            <>
                <h3>Jogadores Confirmados ({jogadoresConfirmados.length})</h3>
                <ul>
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
            </>
          )}

          {/* LISTA DE JOGADORES PARTICIPANTES */}
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
          {( 
            <div className="sair-container">
              <button onClick={handleSairDaPartida} >
                Sair da Partida
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
