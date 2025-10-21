export interface Jogador {
    id: number;
    nome: string;
    organizador: boolean;
    jog_linha: boolean; // false = goleiro
    habilidade: number;
}

export interface Time {
    nome: string;
    jogadores: Jogador[];
    mediaHabilidade: number;
    substitutos?: { vaga: number; opcoes: { jogadorId: number; nome: string }[] }[];
}

const RATING_FAIXAS = {
    MUITO_RUIM: [50, 60],
    RUIM: [61, 70],
    BOM: [71, 80],
    MUITO_BOM: [81, 90],
};

// Embaralhar genérico
function embaralhar<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5);
}

// Descobrir a faixa do jogador
function classificarFaixa(habilidade: number): keyof typeof RATING_FAIXAS {
    if (habilidade <= 60) return "MUITO_RUIM";
    if (habilidade <= 70) return "RUIM";
    if (habilidade <= 80) return "BOM";
    return "MUITO_BOM";
}

const AlgoritmoSorteio = {
    balancear: (jogadores: Jogador[], minJogadoresPartida: number): Time[] => {
        const jogadoresPorTime = Math.ceil(minJogadoresPartida / 2);
        
        // Regra de Mínimo: Pelo menos 2 times completos
        if (jogadores.length < 2 * jogadoresPorTime) {
            throw new Error(
                `Número insuficiente de jogadores para formar 2 times completos. Mínimo necessário: ${2 * jogadoresPorTime}`
            );
        }
        
        // O total de times é o máximo possível + 1 (para o resto, se houver)
        const maxTimesCompletos = Math.floor(jogadores.length / jogadoresPorTime);
        const totalTimes = Math.max(2, maxTimesCompletos + (jogadores.length % jogadoresPorTime > 0 ? 1 : 0));
        
        // Cria os times
        const times: Time[] = Array.from({ length: totalTimes }, (_, i) => ({
            nome: `Time ${String.fromCharCode(65 + i)}`,
            jogadores: [],
            mediaHabilidade: 0,
        }));

        const todosJogadores = embaralhar([...jogadores]);
        const jogadoresUsados = new Set<number>();

        // 1. Separação de Goleiros
        let goleiros = todosJogadores.filter(j => !j.jog_linha);
        let linha = todosJogadores.filter(j => j.jog_linha);
        
        // 2. Classificação e Embaralhamento de jogadores de linha
        const faixas: Record<string, Jogador[]> = {
            MUITO_BOM: [], BOM: [], RUIM: [], MUITO_RUIM: [],
        };
        linha.forEach(j => faixas[classificarFaixa(j.habilidade)].push(j));
        Object.keys(faixas).forEach(k => (faixas[k] = embaralhar(faixas[k])));
        
        // 3. PRIORIDADE: Preenchimento de Time A (índice 0) e Time B (índice 1)
        const timesParaCompletar = [times[0], times[1]];
        let teamIndex = 0; // Alterna entre Time A e Time B

        // Itera por faixas (do melhor para o pior) para balancear
        for (const key of Object.keys(faixas).reverse()) {
            const grupo = faixas[key];
            while (grupo.length > 0) {
                if (timesParaCompletar[0].jogadores.length === jogadoresPorTime && 
                    timesParaCompletar[1].jogadores.length === jogadoresPorTime) {
                    break; // Ambos estão completos
                }

                const timeAtual = timesParaCompletar[teamIndex];
                
                if (timeAtual.jogadores.length < jogadoresPorTime) {
                    const jogador = grupo.shift()!;
                    timeAtual.jogadores.push(jogador);
                    jogadoresUsados.add(jogador.id);
                }
                
                // Alterna o time
                teamIndex = (teamIndex + 1) % 2;
            }
            if (timesParaCompletar[0].jogadores.length === jogadoresPorTime && 
                timesParaCompletar[1].jogadores.length === jogadoresPorTime) {
                break; 
            }
        }
        
        // Juntar jogadores de linha que sobraram
        let linhaRestante = Object.values(faixas).flat();
        
        // 4. Distribuição de Goleiros
        // Tenta dar 1 goleiro para A e 1 para B
        for (let i = 0; i < 2 && goleiros.length > 0; i++) {
             if (!times[i].jogadores.some(j => !j.jog_linha) && times[i].jogadores.length < jogadoresPorTime) {
                 const goleiro = goleiros.shift()!;
                 times[i].jogadores.push(goleiro);
                 jogadoresUsados.add(goleiro.id);
             }
        }
        // Goleiros restantes são adicionados ao pool de jogadores restantes
        let restantes = [...linhaRestante, ...goleiros];

        // 5. Preenchimento de vagas finais para A e B (caso falhe o passo 3 e 4)
        for (let i = 0; i < 2; i++) {
            const vagasFaltando = jogadoresPorTime - times[i].jogadores.length;
            for (let v = 0; v < vagasFaltando && restantes.length > 0; v++) {
                const jogador = restantes.shift()!;
                times[i].jogadores.push(jogador);
                jogadoresUsados.add(jogador.id);
            }
        }
        
        // 6. Alocação dos jogadores restantes nos times C, D, ...
        // Se houver mais times, eles recebem o restante
        for (let i = 2; i < totalTimes && restantes.length > 0; i++) {
            const time = times[i];
            const vagasFaltando = jogadoresPorTime - time.jogadores.length;
            
            for (let v = 0; v < vagasFaltando && restantes.length > 0; v++) {
                const jogador = restantes.shift()!;
                time.jogadores.push(jogador);
                jogadoresUsados.add(jogador.id);
            }
        }
        
        // 7. Lógica de substituição cruzada para o ÚLTIMO time INCOMPLETO
        
        // Encontrar o último time incompleto
        let ultimoTimeIncompleto: Time | undefined = undefined;
        let vagasUltimoTime = 0;
        
        for (let i = times.length - 1; i >= 0; i--) {
            const t = times[i];
            const vagasFaltando = jogadoresPorTime - t.jogadores.length;
            if (vagasFaltando > 0) {
                ultimoTimeIncompleto = t;
                vagasUltimoTime = vagasFaltando;
                break;
            }
        }
        
        // O pool de substitutos são os jogadores que sobraram (lista 'restantes')
        if (ultimoTimeIncompleto && restantes.length > 0) {
            
            // Pool A (simula Time 1) e Pool B (simula Time 2)
            const metade = Math.ceil(restantes.length / 2);
            let poolSubstitutoA = restantes.slice(0, metade);
            let poolSubstitutoB = restantes.slice(metade);
            
            ultimoTimeIncompleto.substitutos = [];
            
            for (let vaga = 1; vaga <= vagasUltimoTime; vaga++) {
                const opcoes: { jogadorId: number; nome: string }[] = [];
                
                // Opção 1: do Pool A
                if (poolSubstitutoA.length > 0) {
                    const subA = poolSubstitutoA.shift()!;
                    opcoes.push({ jogadorId: subA.id, nome: subA.nome });
                }
                
                // Opção 2: do Pool B
                if (poolSubstitutoB.length > 0) {
                    const subB = poolSubstitutoB.shift()!;
                    opcoes.push({ jogadorId: subB.id, nome: subB.nome });
                }

                if (opcoes.length > 0) {
                     ultimoTimeIncompleto.substitutos.push({ vaga, opcoes });
                } else {
                     break; // Acabaram os substitutos
                }
            }
        }
        
        // 8. Calcula média de habilidade de cada time
        times.forEach(t => {
            if (t.jogadores.length > 0) {
                const soma = t.jogadores.reduce((acc, j) => acc + j.habilidade, 0);
                t.mediaHabilidade = soma / t.jogadores.length;
            } else {
                t.mediaHabilidade = 0;
            }
        });

        return times;
    },
};

export default AlgoritmoSorteio;