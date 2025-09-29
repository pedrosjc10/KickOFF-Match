import React, { useState } from "react";
import { Jogador } from "../services/partidaService"; 
import { useUserStore } from "../stores/userStore"; 

// Interface JogadorConfirmadoItemProps simplificada
interface JogadorConfirmadoItemProps {
  jogador: Jogador;
  isOrganizador: boolean;
  // Funções que o componente pai deve fornecer
  handleToggleJogLinha: (jogadorId: number, isChecked: boolean) => Promise<void>;
  handleSalvarHabilidade: (jogadorId: number, novaHabilidade: number) => Promise<void>;
}

const Player: React.FC<JogadorConfirmadoItemProps> = ({
  jogador,
  isOrganizador,
  handleToggleJogLinha,
  handleSalvarHabilidade,
}) => {
  const { usuario } = useUserStore();
  const isUsuarioLogado = jogador.id === usuario?.id;

  // --- NOVO ESTADO INTERNO PARA EDIÇÃO DE HABILIDADE ---
  const [isEditing, setIsEditing] = useState(false);
  // O valor inicial é a habilidade atual do jogador (ou 0 se for null/undefined)
  const [habilidadeEmEdicao, setHabilidadeEmEdicao] = useState<number | string>(jogador.habilidade ?? "");
  const [erroEdicao, setErroEdicao] = useState("");
  // ------------------------------------------------------

  // Lógica para iniciar a edição
  const handleIniciarEdicao = () => {
    setIsEditing(true);
    // Usa a habilidade atual do jogador como valor inicial.
    // Garante que é um número (ou string vazia) para o input
    setHabilidadeEmEdicao(jogador.habilidade ?? ""); 
    setErroEdicao("");
  };

  // Lógica de validação e salvamento
  const handleSalvarComValidacaoInterna = async (jogadorId: number) => {
    const valorNumerico = Number(habilidadeEmEdicao);

    if (isNaN(valorNumerico)) {
      setErroEdicao("Deve ser um número.");
      return;
    }

    if (valorNumerico < 50 || valorNumerico > 90) {
      setErroEdicao("Habilidade deve ser entre 50 e 90.");
      return;
    }

    setErroEdicao(""); // Limpa o erro
    
    try {
        await handleSalvarHabilidade(jogadorId, valorNumerico); // Chama a função de salvamento do pai
        setIsEditing(false); // Fecha o modo de edição se o salvamento for bem-sucedido
    } catch (error) {
        // Se a função do pai retornar um erro (ex: erro de API), você pode capturá-lo aqui
        setErroEdicao("Erro ao salvar.");
        console.error("Erro ao salvar habilidade:", error);
    }
  };

  const handleCancelarEdicao = () => {
    setIsEditing(false);
    setHabilidadeEmEdicao(jogador.habilidade ?? ""); // Volta para o valor original do jogador
    setErroEdicao(""); // Limpa o erro
  };

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
                  value={habilidadeEmEdicao} // LIGADO AO ESTADO INTERNO
                  style={{ width: "40px", marginLeft: "5px" }}
                  onChange={(e) => {
                    // Atualiza o estado interno e limpa o erro ao digitar
                    setHabilidadeEmEdicao(e.target.value); 
                    setErroEdicao(""); 
                  }}
                />
                <button
                  onClick={() => handleSalvarComValidacaoInterna(jogador.id)}
                  style={{ marginLeft: "5px" }}
                  disabled={!!erroEdicao} // Desabilita se houver erro
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
                  onClick={handleIniciarEdicao}
                  style={{ marginLeft: "5px" }}
                >
                  Editar
                </button>
              </>
            )}
          </label>
          {/* Exibe o erro de validação específico para esta linha */}
          {isEditing && erroEdicao && (
            <span style={{ color: "red", marginLeft: "10px" }}>
              ({erroEdicao})
            </span>
          )}
        </span>
      )}
    </li>
  );
};

export default Player;