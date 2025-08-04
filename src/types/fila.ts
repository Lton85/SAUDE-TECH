import type { Timestamp } from 'firebase/firestore';

export interface FilaDeEsperaItem {
    id: string;
    pacienteId: string;
    pacienteNome: string;
    departamentoId: string;
    departamentoNome: string;
    departamentoNumero?: string;
    profissionalId: string;
    profissionalNome: string;
    senha: string;
    chegadaEm: Timestamp;
    chamadaEm?: Timestamp;
    finalizadaEm?: Timestamp;
    status: 'aguardando' | 'em-atendimento' | 'finalizado';
    classificacao: 'Normal' | 'Emergência';
}
