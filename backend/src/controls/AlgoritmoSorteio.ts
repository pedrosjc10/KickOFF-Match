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



const AlgoritmoSorteio = {
    balancear: (jogadores: Jogador[], minJogadoresPorTime: number): Time[] => {
        const times: Time[] = [];

        // Separar goleiros e jogadores de linha
        const goleiros = jogadores.filter(j => !j.jog_linha);
        const linha = jogadores.filter(j => j.jog_linha);

        // Embaralhar todos para evitar padrões fixos
        const shuffle = (arr: any[]) => arr.sort(() => 0.5 - Math.random());
        shuffle(goleiros);
        shuffle(linha);

        // Função para calcular média
        const calcMedia = (arr: Jogador[]) =>
            arr.length > 0 ? arr.reduce((s, j) => s + j.habilidade, 0) / arr.length : 0;

        // Criar os dois primeiros times
        const timeA: Time = { nome: "Time A", jogadores: [], mediaHabilidade: 0 };
        const timeB: Time = { nome: "Time B", jogadores: [], mediaHabilidade: 0 };
        times.push(timeA, timeB);

        // Atribuir goleiros (máx 1 por time)
        if (goleiros.length > 0) timeA.jogadores.push(goleiros.shift()!);
        if (goleiros.length > 0) timeB.jogadores.push(goleiros.shift()!);

        // Ordenar jogadores por habilidade (decrescente)
        linha.sort((a, b) => b.habilidade - a.habilidade);

        // Alternar jogadores entre A e B até completarem
        linha.forEach((j, i) => {
            const alvo = i % 2 === 0 ? timeA : timeB;
            if (alvo.jogadores.length < minJogadoresPorTime) {
                alvo.jogadores.push(j);
            } else {
                (alvo === timeA ? timeB : timeA).jogadores.push(j);
            }
        });

        // Calcular médias
        timeA.mediaHabilidade = calcMedia(timeA.jogadores);
        timeB.mediaHabilidade = calcMedia(timeB.jogadores);

        // Jogadores restantes (se houver mais que o necessário)
        const usados = [...timeA.jogadores, ...timeB.jogadores].map(j => j.id);
        let remanescentes = jogadores.filter(j => !usados.includes(j.id));

        let contadorTimes = 3;

        // Criar novos times enquanto restarem jogadores
        while (remanescentes.length > 0) {
            const novoTime: Time = { nome: `Time ${contadorTimes}`, jogadores: [], mediaHabilidade: 0 };
            contadorTimes++;

            // Adiciona goleiro se houver
            if (goleiros.length > 0) novoTime.jogadores.push(goleiros.shift()!);

            // Preenche até minJogadoresPorTime ou o quanto der
            while (novoTime.jogadores.length < minJogadoresPorTime && remanescentes.length > 0) {
                novoTime.jogadores.push(remanescentes.shift()!);
            }

            // Se ainda ficou incompleto, criar substituições com 2 opções
            const vagasFaltantes = minJogadoresPorTime - novoTime.jogadores.length;
            if (vagasFaltantes > 0) {
                novoTime.substitutos = [];
                for (let v = 1; v <= vagasFaltantes; v++) {
                    novoTime.substitutos.push({
                        vaga: v,
                        opcoes: [
                            { jogadorId: timeA.jogadores[0].id, nome: timeA.jogadores[0].nome },
                            { jogadorId: timeB.jogadores[0].id, nome: timeB.jogadores[0].nome }
                        ]
                    });
                }
            }

            novoTime.mediaHabilidade = calcMedia(novoTime.jogadores);
            times.push(novoTime);
        }

        return times;
    }
};

export default AlgoritmoSorteio;
