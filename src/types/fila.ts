
import type { Timestamp } from 'firebase/firestore';

export interface FilaDeEsperaItem {
    id: string;
    pacienteId?: string;
    pacienteNome?: string;
    departamentoId?: string;
    departamentoNome?: string;
    departamentoNumero?: string;
    profissionalId?: string;
    profissionalNome?: string;
    senha: string;
    chegadaEm: Timestamp;
    chamadaEm?: Timestamp;
    finalizadaEm?: Timestamp;
    canceladaEm?: Timestamp;
    status: 'pendente' | 'chamado-triagem' | 'aguardando' | 'em-atendimento' | 'finalizado' | 'cancelado';
    classificacao: string; // Mudado para string para aceitar IDs customizados
    prioridade: number; // 1: Preferencial, 2: Urgência, 3: Normal, 4: Outros, 5+: Custom
    motivoCancelamento?: string;
}
