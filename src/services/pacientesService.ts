
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import type { Paciente } from '@/types/paciente';
import type { DocumentReference } from 'firebase/firestore';

const pacientesCollection = collection(db, 'pacientes');

const pacientesData: Omit<Paciente, 'id'>[] = [];


export const seedPacientes = async () => {
    const snapshot = await getDocs(pacientesCollection);
    if (snapshot.empty) {
        const batch = writeBatch(db);
        pacientesData.forEach(paciente => {
            const docRef = doc(pacientesCollection);
            batch.set(docRef, paciente);
        });
        await batch.commit();
        console.log('Pacientes collection has been seeded.');
    }
};

export const getPacientes = async (): Promise<Paciente[]> => {
    await seedPacientes();
    const snapshot = await getDocs(pacientesCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Paciente));
};

export const addPaciente = async (paciente: Omit<Paciente, 'id'>): Promise<DocumentReference> => {
    const { id, ...dataToSave } = paciente as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    return await addDoc(pacientesCollection, dataToSave);
};

export const deletePaciente = async (id: string): Promise<void> => {
    const pacienteDoc = doc(db, 'pacientes', id);
    await deleteDoc(pacienteDoc);
};
