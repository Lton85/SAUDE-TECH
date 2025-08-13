
"use client"
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit, writeBatch, setDoc, doc, deleteDoc } from 'firebase/firestore';

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
        const chamadaRef = doc(chamadasCollection);
        await setDoc(chamadaRef, {
            ...chamadaData,
            id: chamadaRef.id, 
            timestamp: serverTimestamp() 
        });
    } catch (error) {
        console.error("Erro ao criar chamada: ", error);
        throw new Error("Não foi possível registrar a chamada no Firestore.");
    }
};

export const clearPainel = async () => {
    try {
        const clearCallRef = doc(chamadasCollection, 'clear-call');
        await setDoc(clearCallRef, {
            id: 'clear-call',
            senha: '----',
            departamentoNome: 'Aguardando...',
            pacienteNome: '', // Alterado para vazio
            profissionalNome: '', // Alterado para vazio
            atendimentoId: null,
            timestamp: serverTimestamp() 
        });
    } catch (error) {
        console.error("Erro ao limpar painel: ", error);
        throw new Error("Não foi possível limpar o painel no Firestore.");
    }
};


export const clearHistoryChamadas = async (): Promise<void> => {
    try {
        const q = query(chamadasCollection, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);

        if (snapshot.docs.length <= 1) {
            return; // Keep the latest call
        }

        const batch = writeBatch(db);
        // Get all documents except the most recent one
        const docsToDelete = snapshot.docs.slice(1);
        
        docsToDelete.forEach(doc => {
            // Do not delete the special 'clear-call' document
            if (doc.id !== 'clear-call') {
                batch.delete(doc.ref);
            }
        });

        await batch.commit();

    } catch (error) {
        console.error("Erro ao limpar o histórico de chamadas:", error);
        throw new Error("Não foi possível limpar o histórico de chamadas do painel.");
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
        const snapshot = await getDocs(chamadasCollection);
        if (snapshot.empty) {
            return 0;
        }

        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        await clearPainel();

        return snapshot.size;
    } catch (error) {
        console.error("Erro ao limpar o histórico de chamadas:", error);
        throw new Error("Não foi possível limpar o histórico de chamadas do painel.");
    }
};
