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
} // mantém suas interfaces se já tiver

const RATING_FAIXAS = {
    MUITO_RUIM: [50, 60],
    RUIM: [61, 70],
    BOM: [71, 80],
    MUITO_BOM: [81, 90],
};

// Função auxiliar: sorteia array
function embaralhar<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5);
}

// Função para descobrir a faixa do jogador
function classificarFaixa(habilidade: number): keyof typeof RATING_FAIXAS {
    if (habilidade <= 60) return "MUITO_RUIM";
    if (habilidade <= 70) return "RUIM";
    if (habilidade <= 80) return "BOM";
    return "MUITO_BOM";
}

const AlgoritmoSorteio = {
    balancear: (jogadores: Jogador[], minJogadoresPartida: number): Time[] => {
        // mínimo total exigido
        if (jogadores.length < minJogadoresPartida) {
            throw new Error(`Número insuficiente de jogadores para o sorteio. Mínimo necessário: ${minJogadoresPartida}`);
        }

        // número mínimo por time (metade do total da partida)
        const minPorTime = Math.ceil(minJogadoresPartida / 2);

        // separa goleiros e linha
        const goleiros = jogadores.filter(j => !j.jog_linha);
        const linha = jogadores.filter(j => j.jog_linha);

        // classifica jogadores de linha por faixa
        const faixas: Record<string, Jogador[]> = {
            MUITO_RUIM: [],
            RUIM: [],
            BOM: [],
            MUITO_BOM: [],
        };

        linha.forEach(j => faixas[classificarFaixa(j.habilidade)].push(j));
        Object.keys(faixas).forEach(k => faixas[k] = embaralhar(faixas[k]));

        // define número de times
        const totalTimes = Math.ceil(jogadores.length / minPorTime);
        const times: Time[] = Array.from({ length: totalTimes }, (_, i) => ({
            nome: `Time ${String.fromCharCode(65 + i)}`,
            jogadores: [],
            mediaHabilidade: 0,
        }));

        // distribui jogadores de linha equilibradamente por faixa
        for (const key of Object.keys(faixas)) {
            const grupo = faixas[key];
            let i = 0;
            for (const jogador of grupo) {
                times[i % totalTimes].jogadores.push(jogador);
                i++;
            }
        }

        // distribui goleiros (máx 1 por time)
        for (const g of goleiros) {
            const possiveis = times.filter(t => !t.jogadores.some(j => !j.jog_linha));
            if (possiveis.length === 0) break;
            embaralhar(possiveis)[0].jogadores.push(g);
        }

        // calcula médias
        times.forEach(t => {
            if (t.jogadores.length > 0) {
                const soma = t.jogadores.reduce((acc, j) => acc + j.habilidade, 0);
                t.mediaHabilidade = soma / t.jogadores.length;
            } else t.mediaHabilidade = 0;
        });

        // preenche times incompletos
        const jogadoresUsados = times.flatMap(t => t.jogadores.map(j => j.id));
        const remanescentes = jogadores.filter(j => !jogadoresUsados.includes(j.id));

        const ultimoTime = times[times.length - 1];
        const vagasFaltantes = minPorTime - ultimoTime.jogadores.length;

        if (vagasFaltantes > 0) {
        ultimoTime.substitutos = [];

        for (let v = 0; v < vagasFaltantes; v++) {
            if (remanescentes.length === 0) break;

            const indiceAleatorio = Math.floor(Math.random() * remanescentes.length);
            const jogador = remanescentes.splice(indiceAleatorio, 1)[0]; // remove da lista pra não repetir

            ultimoTime.substitutos.push({
            vaga: v + 1,
            opcoes: [{                
                nome: jogador.nome,
                jogadorId: jogador.id,
            }]
            });
        }
        }

        return times;

    }
};

export default AlgoritmoSorteio;
