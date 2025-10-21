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
            throw new Error(
                `Número insuficiente de jogadores para o sorteio. Mínimo necessário: ${minJogadoresPartida}`
            );
        }

        // Número fixo de jogadores por time (metade do mínimo exigido)
        const jogadoresPorTime = Math.ceil(minJogadoresPartida / 2);

        // Quantos times dá pra formar
        let totalTimes = Math.max(1, Math.floor(jogadores.length / jogadoresPorTime));
        const jogadoresSobrando = jogadores.length % jogadoresPorTime;
        if (jogadoresSobrando > 0) {
            totalTimes += 1;
        }

        // Cria os times
        const times: Time[] = Array.from({ length: totalTimes }, (_, i) => ({
            nome: `Time ${String.fromCharCode(65 + i)}`,
            jogadores: [],
            mediaHabilidade: 0,
        }));

        // Separa goleiros e jogadores de linha
        const goleiros = jogadores.filter(j => !j.jog_linha);
        const linha = jogadores.filter(j => j.jog_linha);

        // Classifica jogadores por faixa
        const faixas: Record<string, Jogador[]> = {
            MUITO_RUIM: [],
            RUIM: [],
            BOM: [],
            MUITO_BOM: [],
        };
        linha.forEach(j => faixas[classificarFaixa(j.habilidade)].push(j));
        Object.keys(faixas).forEach(k => (faixas[k] = embaralhar(faixas[k])));

        // Distribui os jogadores de linha de forma equilibrada entre os times
        for (const key of Object.keys(faixas)) {
            const grupo = faixas[key];
            let i = 0;
            for (const jogador of grupo) {
                times[i % totalTimes].jogadores.push(jogador);
                i++;
            }
        }

        // Distribui goleiros (1 por time, se possível)
        for (const g of goleiros) {
            const possiveis = times.filter(
                t => !t.jogadores.some(j => !j.jog_linha)
            );
            if (possiveis.length === 0) break;
            embaralhar(possiveis)[0].jogadores.push(g);
        }

        // Garante que cada time tenha exatamente "jogadoresPorTime"
        // Se sobrar jogador, vira substituto do último time
        const todosJogadores = [...jogadores];
        const jogadoresUsados = new Set<number>();
        times.forEach(t => {
            while (t.jogadores.length < jogadoresPorTime) {
                const resto = todosJogadores.filter(j => !jogadoresUsados.has(j.id));
                if (resto.length === 0) break;
                const j = resto[Math.floor(Math.random() * resto.length)];
                t.jogadores.push(j);
                jogadoresUsados.add(j.id);
            }
        });

        // Se sobrar jogador, cria substitutos pro último time
        const sobras = todosJogadores.filter(j => !jogadoresUsados.has(j.id));
        const ultimoTime = times[times.length - 1];
        if (sobras.length > 0) {
            ultimoTime.substitutos = sobras.map((j, i) => ({
                vaga: i + 1,
                opcoes: [{ jogadorId: j.id, nome: j.nome }],
            }));
        }

        // Calcula média de habilidade de cada time
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