import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';
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
    const medicos: Medico[] = [];
    snapshot.forEach(doc => {
        medicos.push({ id: doc.id, ...doc.data() } as Medico);
    });
    return medicos;
};

export const addMedico = async (medico: Omit<Medico, 'id'>): Promise<DocumentReference> => {
    return await addDoc(medicosCollection, medico);
};

export const deleteMedico = async (id: string): Promise<void> => {
    const medicoDoc = doc(db, 'medicos', id);
    await deleteDoc(medicoDoc);
};
