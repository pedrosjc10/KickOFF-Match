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
  PartidaDetalhes as PartidaDetalhesType,
} from "../services/partidaService";
import "../styles/PartidaDetalhes.css";
import { useUserStore } from "../stores/userStore";
import Player from "../components/Player";

const PartidaDetalhes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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

  const carregarDados = async () => {
    if (!id || !usuario?.id) return;
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

      const organizador = await verificarSeOrganizador(usuario?.id, Number(id));
      setIsOrganizador(organizador);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
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
      await carregarDados();
    } catch (error) {
      console.error("Erro ao atualizar posição:", error);
    }
  };

  const handleAtualizarHabilidade = async (jogadorId: number, partidaId: number, novaHabilidade: number) => {
    try {
      await atualizarPartidaUsuario(jogadorId, partidaId, { habilidade: novaHabilidade });
      const confirmadosData = await buscarConfirmados(Number(id));
      setJogadoresConfirmados(confirmadosData);
    } catch (error) {
      console.error("Erro ao atualizar habilidade:", error);
      throw error;
    }
  };

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

  const handleConfirmarTimes = async () => {
    if (!partida?.id || timesSorteados.length === 0) return;

    try {
      const confirmadosList = await buscarConfirmados(Number(partida.id));

      const desconfirmacaoPromessas = confirmadosList.map(jogador =>
        atualizarPartidaUsuario(jogador.id, partida.id, { confirmado: false })
      );
      await Promise.all(desconfirmacaoPromessas);

      setTimesSorteados([]);
      await carregarDados();
      alert("Times confirmados! Jogadores não escalados foram movidos para a lista de participantes.");
    } catch (error) {
      console.error("Erro ao confirmar times:", error);
      alert("Erro ao confirmar times. Tente novamente.");
    }
  };

  const handleDesconfirmarTodos = async () => {
    if (!partida?.id || !isOrganizador) return;
    const ok = window.confirm(
      "Tem certeza que deseja desconfirmar TODOS os jogadores confirmados?"
    );
    if (!ok) return;

    try {
      setDesconfirmandoAll(true);
      const confirmadosAtual = await buscarConfirmados(Number(partida.id));

      if (!confirmadosAtual.length) {
        alert("Não há jogadores confirmados para desconfirmar.");
        setDesconfirmandoAll(false);
        return;
      }

      const promessas = confirmadosAtual.map(jogador =>
        atualizarPartidaUsuario(jogador.id, partida.id, { confirmado: false })
      );

      await Promise.allSettled(promessas);
      alert("Todos os jogadores confirmados foram desconfirmados.");
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
      await leavePartida(usuario?.id || 0, partida?.id || 0);
      alert("Você saiu da partida com sucesso!");
      await carregarDados();
      navigate(`/meusrachas`);
    } catch (error) {
      console.error("Erro ao sair da partida:", error);
      alert("Erro ao sair da partida. Tente novamente.");
    }
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
            {Array.isArray(partida.local) && partida.local.length > 0 ? (
              `${partida.local[0].nome} - ${partida.local[0].cidade}`
            ) : (
              "Local não informado"
            )}
          </p>
          <p>
            <strong>Tipo de Partida:</strong> {partida.tipoPartida?.nometipopartida} (
            {partida.tipoPartida?.quantidadejogadores} por time)
          </p>
          <hr />

          {isOrganizador && timesSorteados.length === 0 && jogadoresConfirmados.length > 0 && (
            <div className="sorteio-area">
              <button onClick={handleSortearTimes}>Sortear Times</button>
              <button
                onClick={handleDesconfirmarTodos}
                style={{ marginLeft: 12, background: "#f66", color: "#fff" }}
                disabled={desconfirmandoAll}
              >
                {desconfirmandoAll ? "Desconfirmando..." : "Desconfirmar Todos"}
              </button>
            </div>
          )}

          {timesSorteados.length > 0 && (
            <div className="times-sorteados-container">
              <h3>Resultado do Sorteio</h3>
              <div className="times-grid">
                {timesSorteados.map((time) => (
                  <div key={time.nome} className={`time-card ${time.nome.replace(" ", "-").toLowerCase()}`}>
                    <h4>{time.nome} (Média: {Math.round(Number(time.mediaHabilidade))})</h4>
                    <ul>
                      {time.jogadores.map((jogador) => (
                        <li key={jogador.id}>
                          {jogador.nome} ({jogador.habilidade})
                          {jogador.jog_linha === false && (
                            <span style={{ color: "red" }}> (G)</span>
                          )}
                        </li>
                      ))}
                    </ul>

                    {/* ✅ Substitutos corrigido */}
                    {Array.isArray(time.substitutos) && time.substitutos.length > 0 && (
                      <div className="substitutos-bloco">
                        <h5>Substitutos</h5>
                        {time.substitutos.map((vaga, idx) => (
                          <div key={idx} className="substituto-item">
                            <p>
                              <em>Vaga {vaga.vaga}:</em>{" "}
                              {vaga.opcoes?.map((o: { nome: string }) => o.nome).join(" ou ")}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="confirmar-sorteio-area">
                <button onClick={handleConfirmarTimes}>CONFIRMAR E FECHAR TIMES</button>
                <button onClick={() => setTimesSorteados([])}>Sortear Novamente</button>
              </div>
              <hr />
            </div>
          )}

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

          <h3>Jogadores Participantes ({jogadoresNaoConfirmados.length})</h3>
          <ul>
            {jogadoresNaoConfirmados.map((jogador) => (
              <li key={jogador.id}>
                {jogador.nome} {jogador.organizador ? <span>(Organizador)</span> : null}
              </li>
            ))}
          </ul>

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

          <div className="sair-container">
            <button onClick={handleSairDaPartida}>Sair da Partida</button>
          </div>
        </>
      ) : (
        <p>Partida não encontrada</p>
      )}
    </div>
  );
};

export default PartidaDetalhes;
