"use client"
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, writeBatch, updateDoc } from 'firebase/firestore';
import type { Medico } from '@/types/medico';
import { getNextCounter } from './countersService';

const medicosCollection = collection(db, 'medicos');

// Dados de exemplo para popular a coleção, se estiver vazia.
const medicosData: Omit<Medico, 'id' | 'codigo'>[] = [
    { nome: "Dr. Ricardo Alves", crm: "123456/SP", especialidade: "Clínico Geral" },
    { nome: "Dra. Ana Costa", crm: "654321/RJ", especialidade: "Cardiologista" },
    { nome: "Dr. Lucas Martins", crm: "112233/MG", especialidade: "Ortopedista" },
];

// Popula a coleção de médicos se ela estiver vazia.
export const seedMedicos = async () => {
    try {
        const snapshot = await getDocs(medicosCollection);
        if (snapshot.empty && medicosData.length > 0) {
            const batch = writeBatch(db);
            for (const medico of medicosData) {
                const docRef = doc(medicosCollection);
                const nextId = await getNextCounter('medicos_v1');
                const codigo = String(nextId).padStart(3, '0');
                batch.set(docRef, { ...medico, codigo });
            }
            await batch.commit();
            console.log('Medicos collection has been seeded.');
        }
    } catch (error) {
        console.error("Error seeding medicos: ", error);
    }
};

// Obtém todos os médicos do banco de dados.
export const getMedicos = async (): Promise<Medico[]> => {
    await seedMedicos();
    const snapshot = await getDocs(medicosCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medico)).sort((a, b) => parseInt(a.codigo) - parseInt(b.codigo));
};

// Adiciona um novo médico ao banco de dados.
export const addMedico = async (medico: Omit<Medico, 'id' | 'codigo'>): Promise<string> => {
    const nextId = await getNextCounter('medicos_v1');
    const codigo = String(nextId).padStart(3, '0');
    const docRef = await addDoc(medicosCollection, { ...medico, codigo });
    return docRef.id;
};

// Atualiza um médico existente no banco de dados.
export const updateMedico = async (id: string, medico: Partial<Omit<Medico, 'id'>>): Promise<void> => {
    const medicoDoc = doc(db, 'medicos', id);
    await updateDoc(medicoDoc, medico);
};

// Exclui um médico do banco de dados.
export const deleteMedico = async (id: string): Promise<void> => {
    const medicoDoc = doc(db, 'medicos', id);
    await deleteDoc(medicoDoc);
};
