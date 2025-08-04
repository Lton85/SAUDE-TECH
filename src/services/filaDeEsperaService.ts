"use client"

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

export interface FilaDeEsperaItem {
    id?: string;
    pacienteId: string;
    pacienteNome: string;
    departamentoId: string;
    departamentoNome: string;
    profissionalId: string;
    profissionalNome: string;
    senha: string;
    chegadaEm: Date;
    chamadaEm?: Date;
    finalizadaEm?: Date;
    status: 'aguardando' | 'em-atendimento' | 'finalizado';
}

const filaCollection = collection(db, 'filaDeEspera');

export const addPacienteToFila = async (item: Omit<FilaDeEsperaItem, 'id' | 'chegadaEm'> & { chegadaEm: Date }) => {
    // Verifica se o paciente já está na fila de qualquer departamento
    const q = query(filaCollection, where("pacienteId", "==", item.pacienteId), where("status", "in", ["aguardando", "em-atendimento"]));
    const existing = await getDocs(q);
    
    if (!existing.empty) {
        const existingItem = existing.docs[0].data();
        throw new Error(`Este paciente já está na fila de ${existingItem.departamentoNome}.`);
    }

    try {
        await addDoc(filaCollection, {
            ...item,
            chegadaEm: serverTimestamp() 
        });
    } catch (error) {
        console.error("Erro ao adicionar paciente à fila: ", error);
        throw new Error("Não foi possível adicionar o paciente à fila no Firestore.");
    }
};
