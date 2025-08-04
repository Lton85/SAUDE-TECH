
"use client"
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface Chamada {
    senha: string;
    departamentoNome: string;
    pacienteNome: string;
    profissionalNome: string;
}

const chamadasCollection = collection(db, 'chamadas');

export const createChamada = async (chamadaData: Chamada) => {
    try {
        await addDoc(chamadasCollection, {
            ...chamadaData,
            timestamp: serverTimestamp() 
        });
    } catch (error) {
        console.error("Erro ao criar chamada: ", error);
        throw new Error("Não foi possível registrar a chamada no Firestore.");
    }
};

export const clearPainel = async () => {
    try {
        await addDoc(chamadasCollection, {
            senha: '----',
            departamentoNome: 'Aguardando...',
            pacienteNome: 'Aguardando paciente...',
            profissionalNome: 'Aguardando profissional...',
            timestamp: serverTimestamp() 
        });
    } catch (error) {
        console.error("Erro ao limpar painel: ", error);
        throw new Error("Não foi possível limpar o painel no Firestore.");
    }
};
