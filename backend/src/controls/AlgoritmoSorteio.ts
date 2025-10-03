// AlgoritmoSorteio.ts

// --- Nova Interface Jogador (mantida) ---
export interface Jogador {
    id: number; // u.id
    nome: string; // u.nome
    organizador: boolean; // pu.organizador
    jog_linha: boolean; // pu.jog_linha
    habilidade: number; // pu.habilidade
}
// -----------------------------------------------------------------------

// Define as faixas de habilidade
const RATING_FAIXAS = {
    MUITO_RUIM: [50, 60], // Índice 0
    RUIM: [61, 70],        // Índice 1
    BOM: [71, 80],         // Índice 2
    MUITO_BOM: [81, 90],   // Índice 3
};

export interface Time {
    nome: string;
    jogadores: Jogador[];
    mediaHabilidade: number;
    substitutos?: { vaga: number; opcoes: { jogadorId: number, nome: string }[] };
}

const AlgoritmoSorteio = {

    balancear: (jogadores: Jogador[], minJogadoresPorTime: number): Time[] => {
        
        // 1. Pré-processamento: Categorizar e Embaralhar
        const categorias: Jogador[][] = [[], [], [], []];
        jogadores.forEach(j => {
            // CORREÇÃO: Usando a constante RATING_FAIXAS para remover o aviso
            if (j.habilidade <= RATING_FAIXAS.MUITO_RUIM[1]) categorias[0].push(j);
            else if (j.habilidade <= RATING_FAIXAS.RUIM[1]) categorias[1].push(j);
            else if (j.habilidade <= RATING_FAIXAS.BOM[1]) categorias[2].push(j);
            else categorias[3].push(j);
        });

        // Embaralhar cada categoria para garantir aleatoriedade no mesmo nível
        categorias.forEach(arr => arr.sort(() => 0.5 - Math.random()));
        
        const times: Time[] = [
            { nome: "Time A", jogadores: [], mediaHabilidade: 0 }, 
            { nome: "Time B", jogadores: [], mediaHabilidade: 0 }
        ];
        let jogadoresUsados: number[] = [];

        // 2. Sorteio Principal (Times A e B)
        let timeIndex = 0;
        let totalJogadoresNecessarios = minJogadoresPorTime * 2;
        
        // Loop para preencher os times A e B de forma balanceada
        while (jogadoresUsados.length < Math.min(jogadores.length, totalJogadoresNecessarios)) {
            let adicionadoNesteCiclo = false;
            
            for (const categoria of categorias) {
                const jogador = categoria.find(j => !jogadoresUsados.includes(j.id));
                
                if (jogador && times[0].jogadores.length < minJogadoresPorTime && times[1].jogadores.length < minJogadoresPorTime) {
                    times[timeIndex].jogadores.push(jogador);
                    jogadoresUsados.push(jogador.id);
                    timeIndex = 1 - timeIndex; // Alterna o time
                    adicionadoNesteCiclo = true;
                }
            }
            if (!adicionadoNesteCiclo) break; // Sai se não houver mais jogadores disponíveis para adicionar
        }
        
        // CÁLCULO DA MÉDIA
        // A variável 'mediaTotal' desnecessária foi removida.
        
        // Recalcula a média de habilidade para os Times A e B
        if (times[0].jogadores.length > 0) {
            times[0].mediaHabilidade = times[0].jogadores.reduce((sum, j) => sum + j.habilidade, 0) / times[0].jogadores.length;
        }
        if (times[1].jogadores.length > 0) {
            times[1].mediaHabilidade = times[1].jogadores.reduce((sum, j) => sum + j.habilidade, 0) / times[1].jogadores.length;
        }
        
        // 3. Geração do Terceiro Time (Lógica Sobressalente)
        const remanescentes = jogadores.filter(j => !jogadoresUsados.includes(j.id));
        
        if (remanescentes.length >= minJogadoresPorTime) { 
            const timeC: Time = { nome: "Time C", jogadores: remanescentes, mediaHabilidade: 0 };
            
            // Recalcula a média para o Time C
            let mediaC = timeC.jogadores.reduce((sum, j) => sum + j.habilidade, 0) / timeC.jogadores.length;
            timeC.mediaHabilidade = mediaC;
            
            // Vagas faltantes para fechar o Time C
            const vagasFaltantes = minJogadoresPorTime - remanescentes.length;
            
            if (vagasFaltantes > 0) {
                // Lógica de Repetição/Substitutos (mantida)
                const opcao1 = times[0].jogadores[0]; 
                const opcao2 = times[1].jogadores[0]; 
                
                timeC.substitutos = {
                    vaga: 1, 
                    opcoes: [
                        { jogadorId: opcao1.id, nome: opcao1.nome },
                        { jogadorId: opcao2.id, nome: opcao2.nome }
                    ]
                };
            }
            
            times.push(timeC);
        }

        return times;
    }
};

export default AlgoritmoSorteio;