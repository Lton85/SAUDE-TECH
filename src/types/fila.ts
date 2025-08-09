
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
    classificacao: 'Normal' | 'Preferencial' | 'Urgência';
    prioridade: 1 | 2; // 1: Urgência/Preferencial, 2: Normal
    motivoCancelamento?: string;
}
