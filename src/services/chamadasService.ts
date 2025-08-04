
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
