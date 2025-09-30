import React, { useState, useEffect } from "react";
import { Jogador, PartidaDetalhes } from "../services/partidaService"; 
import { useUserStore } from "../stores/userStore"; 

interface JogadorConfirmadoItemProps {
  jogador: Jogador;
  partida: PartidaDetalhes;
  isOrganizador: boolean;
  handleToggleJogLinha: (jogadorId: number, partidaId: number, isChecked: boolean) => Promise<void>;
  handleSalvarHabilidade: (jogadorId: number, partidaId: number, novaHabilidade: number) => Promise<void>;
}

const Player: React.FC<JogadorConfirmadoItemProps> = ({
  jogador,
  partida,
  isOrganizador,
  handleToggleJogLinha,
  handleSalvarHabilidade,
}) => {
  const { usuario } = useUserStore();
  const isUsuarioLogado = jogador.id === usuario?.id;

  // ESTADO INTERNO DE EDIÇÃO
  const [isEditing, setIsEditing] = useState(false);
  const [habilidadeEmEdicao, setHabilidadeEmEdicao] = useState<number | string>(
    jogador.habilidade ?? ""
  );
  const [erroEdicao, setErroEdicao] = useState("");

  // NOVO: Sincroniza o estado interno com a prop 'jogador.habilidade'
  // Isso garante que após o salvamento no componente pai, a tela seja atualizada.
  useEffect(() => {
    // Só atualiza o estado interno se NÃO estiver no modo de edição.
    // Isso evita sobrescrever o que o usuário está digitando.
    if (!isEditing) {
      setHabilidadeEmEdicao(jogador.habilidade ?? "");
    }
  }, [jogador.habilidade, isEditing]);


  const handleIniciarEdicao = () => {
    setIsEditing(true);
    setHabilidadeEmEdicao(jogador.habilidade ?? ""); 
    setErroEdicao("");
  };

  const handleSalvarComValidacaoInterna = async (jog: Jogador, partida: PartidaDetalhes) => {
    const valorNumerico = Number(habilidadeEmEdicao);

    if (isNaN(valorNumerico)) {
      setErroEdicao("Deve ser um número.");
      return;
    }

    if (valorNumerico < 50 || valorNumerico > 90) {
      setErroEdicao("Habilidade deve ser entre 50 e 90.");
      return;
    }

    setErroEdicao(""); 
    
    try {
      // Chama a função do pai, que salva na API e recarrega a lista
      await handleSalvarHabilidade(jog.id, partida.id, valorNumerico); 
      setIsEditing(false); // Fecha o modo de edição
    } catch (error) {
      setErroEdicao("Erro ao salvar.");
      console.error("Erro ao salvar habilidade:", error);
    }
  };

  const handleCancelarEdicao = () => {
    setIsEditing(false);
    // Ao cancelar, forçamos o valor original da prop (que já foi atualizada)
    setHabilidadeEmEdicao(jogador.habilidade ?? ""); 
    setErroEdicao(""); 
  };

  return (
    <li key={jogador.id}>
      {jogador.nome}{" "}
      {jogador.organizador ? <span>(Organizador)</span> : null}

      {/* Checkbox de Posição (Linha/Goleiro) */}
      {isUsuarioLogado ? (
        <label>
          <input
            onChange={(e) =>
              handleToggleJogLinha(jogador.id, partida.id, e.target.checked)
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
                    setHabilidadeEmEdicao(e.target.value); 
                    setErroEdicao(""); 
                  }}
                />
                <button
                  onClick={() => handleSalvarComValidacaoInterna(jogador, partida)}
                  style={{ marginLeft: "5px" }}
                  disabled={!!erroEdicao} 
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