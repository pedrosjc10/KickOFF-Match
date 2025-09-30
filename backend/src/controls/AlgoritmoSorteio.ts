// AlgoritmoSorteio.ts

// --- Nova Interface Jogador baseada nos dados buscados pelo Controller ---
// NOTA: O 'id' e 'nome' vêm da relação 'usuario' (u.id, u.nome).
// Os demais campos vêm de 'PartidaUsuario' (pu.habilidade, pu.organizador, pu.jog_linha).
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
            // Mantenha a mesma lógica de categorização baseada em habilidade
            if (j.habilidade <= 60) categorias[0].push(j);
            else if (j.habilidade <= 70) categorias[1].push(j);
            else if (j.habilidade <= 80) categorias[2].push(j);
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
        // O array 'jogadoresRestantes' não é mais necessário aqui, use 'jogadores'
        
        // Loop para preencher os times A e B de forma balanceada
        while (jogadoresUsados.length < Math.min(jogadores.length, totalJogadoresNecessarios)) {
            let adicionadoNesteCiclo = false;
            
            // Itera sobre as categorias (do pior ao melhor, ou do melhor ao pior, dependendo da ordem)
            for (const categoria of categorias) {
                // Encontra o primeiro jogador da categoria que ainda não foi usado
                const jogador = categoria.find(j => !jogadoresUsados.includes(j.id));
                
                // Distribui se houver jogador e se os times ainda não estiverem completos
                if (jogador && times[0].jogadores.length < minJogadoresPorTime && times[1].jogadores.length < minJogadoresPorTime) {
                    times[timeIndex].jogadores.push(jogador);
                    jogadoresUsados.push(jogador.id);
                    timeIndex = 1 - timeIndex; // Alterna o time
                    adicionadoNesteCiclo = true;
                }
            }
            if (!adicionadoNesteCiclo) break; // Sai se não houver mais jogadores disponíveis para adicionar
        }
        
        // ... (Cálculos de Média e Lógica de Substitutos, que permanecem os mesmos)

        // Calcula a média dos jogadores que foram de fato escalados
        const mediaTotal = jogadoresUsados.reduce((sum, id) => 
            sum + jogadores.find(j => j.id === id)!.habilidade, 0
        ) / jogadoresUsados.length;
        
        // Recalcula a média de habilidade para os Times A e B
        times[0].mediaHabilidade = times[0].jogadores.reduce((sum, j) => sum + j.habilidade, 0) / times[0].jogadores.length;
        times[1].mediaHabilidade = times[1].jogadores.reduce((sum, j) => sum + j.habilidade, 0) / times[1].jogadores.length;
        
        // 3. Geração do Terceiro Time (Lógica Sobressalente)
        const remanescentes = jogadores.filter(j => !jogadoresUsados.includes(j.id));
        
        if (remanescentes.length >= minJogadoresPorTime - 1) { 
            const timeC: Time = { nome: "Time C", jogadores: remanescentes, mediaHabilidade: 0 };
            
            // Recalcula a média para o Time C
            let mediaC = timeC.jogadores.reduce((sum, j) => sum + j.habilidade, 0) / timeC.jogadores.length;
            timeC.mediaHabilidade = mediaC;
            
            // Vagas faltantes para fechar o Time C
            const vagasFaltantes = minJogadoresPorTime - remanescentes.length;
            
            if (vagasFaltantes > 0) {
                // Lógica de Repetição/Substitutos (mantida como estava)
                const opcao1 = times[0].jogadores[0]; // Jogador arbitrários do Time A
                const opcao2 = times[1].jogadores[0]; // Jogador arbitrários do Time B
                
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