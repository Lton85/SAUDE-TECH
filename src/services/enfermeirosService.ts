import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import type { Enfermeiro } from '@/types/enfermeiro';

const enfermeirosCollection = collection(db, 'enfermeiros');

const enfermeirosData: Omit<Enfermeiro, 'id'>[] = [
    { nome: 'Mariana Lima', coren: '111222-SP', turno: 'Manhã' },
    { nome: 'Felipe Souza', coren: '333444-RJ', turno: 'Tarde' },
    { nome: 'Juliana Ribeiro', coren: '555666-MG', turno: 'Noite' },
];

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
