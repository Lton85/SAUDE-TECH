
"use client"
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit, writeBatch } from 'firebase/firestore';

interface Chamada {
    id?: string; // Adicionado para rastrear a chamada
    senha: string;
    departamentoNome: string;
    pacienteNome: string;
    profissionalNome: string;
    // O ID do item da fila original, para saber qual atendimento está no painel
    atendimentoId?: string; 
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
            atendimentoId: null, // Limpa o ID do atendimento
            timestamp: serverTimestamp() 
        });
    } catch (error) {
        console.error("Erro ao limpar painel: ", error);
        throw new Error("Não foi possível limpar o painel no Firestore.");
    }
};

/**
 * Retorna a última chamada feita no painel.
 */
export const getUltimaChamada = async (): Promise<Chamada | null> => {
    try {
        const q = query(chamadasCollection, orderBy("timestamp", "desc"), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() } as Chamada;
        }
        return null;
    } catch (error) {
        console.error("Erro ao buscar última chamada:", error);
        throw new Error("Não foi possível buscar a última chamada do painel.");
    }
};

export const clearAllChamadas = async (): Promise<number> => {
    try {
        const q = query(collection(db, "chamadas"));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return 0;
        }

        const batch = writeBatch(db);
        querySnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        await clearPainel(); // Reseta o painel para o estado inicial após limpar
        return querySnapshot.size;
    } catch (error) {
        console.error("Erro ao limpar o histórico de chamadas:", error);
        throw new Error("Não foi possível limpar o histórico de chamadas do painel.");
    }
};

    