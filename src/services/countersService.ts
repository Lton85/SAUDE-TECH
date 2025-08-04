
"use client"
import { db } from '@/lib/firebase';
import { doc, runTransaction, increment, writeBatch } from 'firebase/firestore';

// Obtém o próximo número do contador para um contador específico
export const getNextCounter = async (counterName: string): Promise<number> => {
    const counterDocRef = doc(db, 'counters', counterName);

    try {
        const nextId = await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(counterDocRef);

            if (!counterDoc.exists()) {
                // Se o contador não existir, inicializa com 2 e retorna 1.
                transaction.set(counterDocRef, { nextId: 2 });
                return 1;
            }

            const currentId = counterDoc.data().nextId;
            transaction.update(counterDocRef, { nextId: increment(1) });
            return currentId;
        });
        return nextId;
    } catch (error) {
        console.error("Transaction failed: ", error);
        throw error;
    }
};

// Reinicia os contadores de senha para 1
export const resetCounters = async (): Promise<void> => {
    const normalCounterRef = doc(db, 'counters', 'senha_normal');
    const emergenciaCounterRef = doc(db, 'counters', 'senha_emergencia');

    try {
        const batch = writeBatch(db);
        batch.set(normalCounterRef, { nextId: 1 });
        batch.set(emergenciaCounterRef, { nextId: 1 });
        await batch.commit();
    } catch (error) {
        console.error("Error resetting counters: ", error);
        throw new Error("Não foi possível reiniciar os contadores de senha.");
    }
};
