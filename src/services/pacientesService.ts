"use client"
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, writeBatch, updateDoc } from 'firebase/firestore';
import type { Paciente } from '@/types/paciente';
import { getNextCounter } from './countersService';

const pacientesCollection = collection(db, 'pacientes');

// Dados de exemplo para popular a coleção, se estiver vazia.
const pacientesData: Omit<Paciente, 'id' | 'codigo' | 'idade'>[] = [];

// Popula a coleção de pacientes se ela estiver vazia.
export const seedPacientes = async () => {
    try {
        const snapshot = await getDocs(pacientesCollection);
        if (snapshot.empty && pacientesData.length > 0) {
            const batch = writeBatch(db);
            for (const paciente of pacientesData) {
                const docRef = doc(pacientesCollection);
                const nextId = await getNextCounter('pacientes_v2');
                const codigo = String(nextId).padStart(3, '0');
                const birthDate = new Date(paciente.nascimento.split('/').reverse().join('-'));
                const age = new Date().getFullYear() - birthDate.getFullYear();
                
                batch.set(docRef, { ...paciente, codigo, idade: `${age}a` });
            }
            await batch.commit();
            console.log('Pacientes collection has been seeded.');
        }
    } catch (error) {
        console.error("Error seeding pacientes: ", error);
    }
};

// Obtém todos os pacientes do banco de dados.
export const getPacientes = async (): Promise<Paciente[]> => {
    await seedPacientes();
    const snapshot = await getDocs(pacientesCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Paciente)).sort((a, b) => a.nome.localeCompare(b.nome));
};

// Adiciona um novo paciente ao banco de dados.
export const addPaciente = async (paciente: Omit<Paciente, 'id' | 'codigo'>): Promise<string> => {
    const nextId = await getNextCounter('pacientes_v2');
    const codigo = String(nextId).padStart(3, '0');
    const docRef = await addDoc(pacientesCollection, { ...paciente, codigo });
    return docRef.id;
};

// Atualiza um paciente existente no banco de dados.
export const updatePaciente = async (id: string, paciente: Partial<Omit<Paciente, 'id'>>): Promise<void> => {
    const pacienteDoc = doc(db, 'pacientes', id);
    await updateDoc(pacienteDoc, paciente);
};

// Exclui um paciente do banco de dados.
export const deletePaciente = async (id: string): Promise<void> => {
    const pacienteDoc = doc(db, 'pacientes', id);
    await deleteDoc(pacienteDoc);
};
