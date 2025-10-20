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
        if (jogadores.length < minJogadoresPartida) {
            throw new Error(`Número insuficiente de jogadores para o sorteio. Mínimo necessário: ${minJogadoresPartida}`);
        }

        // Quantidade mínima por time (metade do mínimo total exigido)
        const minPorTime = Math.ceil(minJogadoresPartida / 2);

        // Define quantos times dá pra formar
        const totalTimes = Math.ceil(jogadores.length / minPorTime);

        // Cria os times vazios
        const times: Time[] = Array.from({ length: totalTimes }, (_, i) => ({
            nome: `Time ${String.fromCharCode(65 + i)}`,
            jogadores: [],
            mediaHabilidade: 0,
        }));

        // Separa goleiros e linha
        const goleiros = jogadores.filter(j => !j.jog_linha);
        const linha = jogadores.filter(j => j.jog_linha);

        // Classifica por faixa
        const faixas: Record<string, Jogador[]> = {
            MUITO_RUIM: [],
            RUIM: [],
            BOM: [],
            MUITO_BOM: [],
        };
        linha.forEach(j => faixas[classificarFaixa(j.habilidade)].push(j));
        Object.keys(faixas).forEach(k => faixas[k] = embaralhar(faixas[k]));

        // Distribui equilibradamente os jogadores de linha por faixa
        for (const key of Object.keys(faixas)) {
            const grupo = faixas[key];
            let i = 0;
            for (const jogador of grupo) {
                times[i % totalTimes].jogadores.push(jogador);
                i++;
            }
        }

        // Distribui goleiros (máx 1 por time)
        for (const g of goleiros) {
            const possiveis = times.filter(t => !t.jogadores.some(j => !j.jog_linha));
            if (possiveis.length === 0) break;
            embaralhar(possiveis)[0].jogadores.push(g);
        }

        // Calcula médias
        times.forEach(t => {
            if (t.jogadores.length > 0) {
                const soma = t.jogadores.reduce((acc, j) => acc + j.habilidade, 0);
                t.mediaHabilidade = soma / t.jogadores.length;
            } else t.mediaHabilidade = 0;
        });

        // Preenche último time caso fique incompleto
        const ultimoTime = times[times.length - 1];
        const vagasFaltantes = minPorTime - ultimoTime.jogadores.length;

        if (vagasFaltantes > 0) {
            ultimoTime.substitutos = [];
            for (let v = 0; v < vagasFaltantes; v++) {
                const opcao1 = times[0].jogadores[Math.floor(Math.random() * times[0].jogadores.length)];
                const opcao2 = times[1].jogadores[Math.floor(Math.random() * times[1].jogadores.length)];
                ultimoTime.substitutos.push({
                    vaga: v + 1,
                    opcoes: [
                        { jogadorId: opcao1.id, nome: opcao1.nome },
                        { jogadorId: opcao2.id, nome: opcao2.nome },
                    ],
                });
            }
        }

        return times;
    }
};

export default AlgoritmoSorteio;
