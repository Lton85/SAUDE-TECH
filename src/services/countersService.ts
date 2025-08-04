"use client"
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

// Obtém o próximo número do contador para uma coleção específica
export const getNextCounter = async (collectionName: string): Promise<number> => {
    const counterDocRef = doc(db, 'counters', collectionName);
    const counterDoc = await getDoc(counterDocRef);

    if (!counterDoc.exists()) {
        // Se o contador não existir, cria um novo com valor inicial
        await setDoc(counterDocRef, { nextId: 1 });
        return 1;
    } else {
        // Se o contador já existir, incrementa o valor e o retorna
        await updateDoc(counterDocRef, { nextId: increment(1) });
        const updatedCounter = await getDoc(counterDocRef);
        return updatedCounter.data()?.nextId;
    }
};
