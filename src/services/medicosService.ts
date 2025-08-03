import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import type { Medico } from '@/types/medico';

const medicosCollection = collection(db, 'medicos');

const medicosData: Omit<Medico, 'id'>[] = [];

export const seedMedicos = async () => {
    const snapshot = await getDocs(medicosCollection);
    if (snapshot.empty) {
        const batch = writeBatch(db);
        medicosData.forEach(medico => {
            const docRef = doc(medicosCollection);
            batch.set(docRef, medico);
        });
        await batch.commit();
        console.log('Medicos collection has been seeded.');
    }
};

export const getMedicos = async (): Promise<Medico[]> => {
    await seedMedicos();
    const snapshot = await getDocs(medicosCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medico));
};
