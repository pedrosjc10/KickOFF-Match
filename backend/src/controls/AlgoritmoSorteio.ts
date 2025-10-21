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
        if (jogadores.length < minJogadoresPartida || jogadores.length < 2 * jogadoresPorTime) {
            throw new Error(
                `Número insuficiente de jogadores para formar 2 times completos. Mínimo necessário: ${2 * jogadoresPorTime}`
            );
        }
        
        // Determina o número máximo de times
        const totalTimes = Math.max(2, Math.ceil(jogadores.length / jogadoresPorTime));

        // Cria os times
        const times: Time[] = Array.from({ length: totalTimes }, (_, i) => ({
            nome: `Time ${String.fromCharCode(65 + i)}`,
            jogadores: [],
            mediaHabilidade: 0,
        }));

        const todosJogadores = embaralhar([...jogadores]);
        const jogadoresUsados = new Set<number>();

        // Separa goleiros e jogadores de linha para a primeira distribuição
        const goleiros = todosJogadores.filter(j => !j.jog_linha);
        const linha = todosJogadores.filter(j => j.jog_linha);
        
        // 1. Distribuição inicial de jogadores de linha por faixa (para balanceamento)
        const faixas: Record<string, Jogador[]> = {
            MUITO_RUIM: [], RUIM: [], BOM: [], MUITO_BOM: [],
        };
        linha.forEach(j => faixas[classificarFaixa(j.habilidade)].push(j));
        Object.keys(faixas).forEach(k => (faixas[k] = embaralhar(faixas[k])));

        for (const key of Object.keys(faixas)) {
            const grupo = faixas[key];
            let i = 0;
            for (const jogador of grupo) {
                // Distribui em rodízio entre todos os times
                times[i % totalTimes].jogadores.push(jogador);
                jogadoresUsados.add(jogador.id);
                i++;
            }
        }
        
        // 2. Distribuição inicial de goleiros
        let goleirosRestantes = [...goleiros];
        for(let i = 0; i < totalTimes && goleirosRestantes.length > 0; i++) {
             if (!times[i].jogadores.some(j => !j.jog_linha)) {
                 const goleiro = goleirosRestantes.shift()!;
                 times[i].jogadores.push(goleiro);
                 jogadoresUsados.add(goleiro.id);
             }
        }
        // Goleiros restantes são considerados jogadores de linha para o pool de preenchimento
        goleirosRestantes.forEach(g => jogadoresUsados.add(g.id)); // Marca como usado para não entrar no pool de sobras
        
        // O pool de jogadores restantes (inclui goleiros não alocados)
        let poolDeJogadoresRestantes = todosJogadores.filter(j => !jogadoresUsados.has(j.id));
        poolDeJogadoresRestantes = embaralhar(poolDeJogadoresRestantes);

        // 3. Preenchimento de vagas com o pool restante (prioridade: completar times)
        let poolIndex = 0;
        
        for (const time of times) {
            const vagasFaltando = jogadoresPorTime - time.jogadores.length;
            
            for (let i = 0; i < vagasFaltando; i++) {
                if (poolIndex < poolDeJogadoresRestantes.length) {
                    const jogadorExtra = poolDeJogadoresRestantes[poolIndex++];
                    time.jogadores.push(jogadorExtra);
                    // O jogador extra é agora um membro do time, removemos ele do pool de sobras
                } else {
                    // Se o pool acabar, paramos de preencher
                    break;
                }
            }
        }
        
        // 4. Jogadores que sobraram após preencher o máximo de times possível
        // Sobras são os que não foram alocados do pool:
        let sobrasParaSubstitutos = poolDeJogadoresRestantes.slice(poolIndex);

        // 5. Lógica de substituição cruzada para o ÚLTIMO time INCOMPLETO
        const ultimoTime = times[times.length - 1];
        
        if (ultimoTime && ultimoTime.jogadores.length < jogadoresPorTime && sobrasParaSubstitutos.length > 0) {
            
            const vagasFaltando = jogadoresPorTime - ultimoTime.jogadores.length;
            
            // Separa as sobras em dois pools: Pool A (simula Time 1) e Pool B (simula Time 2)
            const metade = Math.ceil(sobrasParaSubstitutos.length / 2);
            let poolSubstitutoA = sobrasParaSubstitutos.slice(0, metade);
            let poolSubstitutoB = sobrasParaSubstitutos.slice(metade);
            
            ultimoTime.substitutos = [];
            
            for (let vaga = 1; vaga <= vagasFaltando; vaga++) {
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
                     ultimoTime.substitutos.push({ vaga, opcoes });
                } else {
                     break; // Acabaram os substitutos
                }
            }
        }
        
        // 6. Calcula média de habilidade de cada time
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