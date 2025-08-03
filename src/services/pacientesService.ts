
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, writeBatch, updateDoc } from 'firebase/firestore';
import type { Paciente } from '@/types/paciente';

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

export const addPaciente = async (paciente: Omit<Paciente, 'id'>): Promise<string> => {
    const docRef = await addDoc(pacientesCollection, paciente);
    return docRef.id;
};

export const updatePaciente = async (id: string, paciente: Partial<Omit<Paciente, 'id'>>): Promise<void> => {
    const pacienteDoc = doc(db, 'pacientes', id);
    const { id: pacienteId, ...pacienteData } = paciente as Paciente;
    await updateDoc(pacienteDoc, pacienteData);
};

export const deletePaciente = async (id: string): Promise<void> => {
    const pacienteDoc = doc(db, 'pacientes', id);
    await deleteDoc(pacienteDoc);
};
