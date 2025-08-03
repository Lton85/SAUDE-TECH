
import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Enfermeiro } from '@/types/enfermeiro';

const enfermeirosCollection = collection(db, 'enfermeiros');

const enfermeirosData: Omit<Enfermeiro, 'id'>[] = [];

export const seedEnfermeiros = async () => {
    const snapshot = await getDocs(enfermeirosCollection);
    if (snapshot.empty) {
        const batch = writeBatch(db);
        enfermeirosData.forEach(enfermeiro => {
            const docRef = doc(enfermeirosCollection);
            batch.set(docRef, enfermeiro);
        });
        await batch.commit();
        console.log('Enfermeiros collection has been seeded.');
    }
};


export const getEnfermeiros = async (): Promise<Enfermeiro[]> => {
    await seedEnfermeiros();
    const snapshot = await getDocs(enfermeirosCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enfermeiro));
};

export const addEnfermeiro = async (enfermeiro: Omit<Enfermeiro, 'id'>): Promise<string> => {
    const docRef = await addDoc(enfermeirosCollection, enfermeiro);
    return docRef.id;
};

export const updateEnfermeiro = async (id: string, enfermeiro: Partial<Omit<Enfermeiro, 'id'>>): Promise<void> => {
    const enfermeiroDoc = doc(db, 'enfermeiros', id);
    const { id: enfermeiroId, ...enfermeiroData } = enfermeiro as Enfermeiro;
    await updateDoc(enfermeiroDoc, enfermeiroData);
};

export const deleteEnfermeiro = async (id: string): Promise<void> => {
    const enfermeiroDoc = doc(db, 'enfermeiros', id);
    await deleteDoc(enfermeiroDoc);
};
