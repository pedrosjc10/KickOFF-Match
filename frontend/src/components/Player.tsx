import React from "react";
import { Jogador } from "../services/partidaService"; // Certifique-se de que o caminho está correto
import { useUserStore } from "../stores/userStore"; // Certifique-se de que o caminho está correto

// Interface para rastrear a edição de habilidade de um jogador específico (copiada do PartidaDetalhes)
interface EdicaoHabilidade {
  jogadorId: number | null;
  valor: number | string;
  erro: string;
}

interface JogadorConfirmadoItemProps {
  jogador: Jogador;
  isOrganizador: boolean;
  editandoHabilidade: EdicaoHabilidade;
  setEditandoHabilidade: React.Dispatch<React.SetStateAction<EdicaoHabilidade>>;
  handleToggleJogLinha: (jogadorId: number, isChecked: boolean) => Promise<void>;
  handleIniciarEdicao: (jogador: Jogador) => void;
  handleSalvarHabilidadeComValidacao: (jogadorId: number) => Promise<void>;
  handleCancelarEdicao: () => void;
}

const Player: React.FC<JogadorConfirmadoItemProps> = ({
  jogador,
  isOrganizador,
  editandoHabilidade,
  setEditandoHabilidade,
  handleToggleJogLinha,
  handleIniciarEdicao,
  handleSalvarHabilidadeComValidacao,
  handleCancelarEdicao,
}) => {
  const { usuario } = useUserStore();
  const isEditing = editandoHabilidade.jogadorId === jogador.id;
  const isUsuarioLogado = jogador.id === usuario?.id;

  return (
    <li key={jogador.id}>
      {jogador.nome}{" "}
      {jogador.organizador ? <span>(Organizador)</span> : null}

      {/* Checkbox de Posição (Linha/Goleiro) */}
      {isUsuarioLogado ? (
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

      {/* Campo para alterar habilidade, visível apenas para organizador */}
      {isOrganizador && (
        <span style={{ marginLeft: "10px" }}>
          <label>
            Habilidade:
            {isEditing ? (
              <>
                <input
                  type="number"
                  min={50}
                  max={90}
                  value={editandoHabilidade.valor}
                  style={{ width: "40px", marginLeft: "5px" }}
                  onChange={(e) =>
                    setEditandoHabilidade({
                      ...editandoHabilidade,
                      valor: e.target.value,
                      erro: "", // Limpa o erro ao digitar
                    })
                  }
                />
                <button
                  onClick={() => handleSalvarHabilidadeComValidacao(jogador.id)}
                  style={{ marginLeft: "5px" }}
                  disabled={!!editandoHabilidade.erro}
                >
                  Salvar
                </button>
                <button
                  onClick={handleCancelarEdicao}
                  style={{ marginLeft: "5px" }}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <span style={{ marginLeft: "5px" }}>
                  <strong>{jogador.habilidade ?? "N/A"}</strong>
                </span>
                <button
                  onClick={() => handleIniciarEdicao(jogador)}
                  style={{ marginLeft: "5px" }}
                >
                  Editar
                </button>
              </>
            )}
          </label>
          {/* Exibe o erro de validação específico para esta linha */}
          {isEditing && editandoHabilidade.erro && (
            <span style={{ color: "red", marginLeft: "10px" }}>
              ({editandoHabilidade.erro})
            </span>
          )}
        </span>
      )}
    </li>
  );
};

export default Player;