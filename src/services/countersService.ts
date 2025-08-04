"use client"
import { db } from '@/lib/firebase';
import { doc, runTransaction, increment } from 'firebase/firestore';

// Obtém o próximo número do contador para uma coleção específica
export const getNextCounter = async (collectionName: string): Promise<number> => {
    const counterDocRef = doc(db, 'counters', collectionName);

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
