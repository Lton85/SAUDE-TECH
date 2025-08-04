"use client"
import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Enfermeiro } from '@/types/enfermeiro';

const enfermeirosCollection = collection(db, 'enfermeiros');

// Dados de exemplo para popular a coleção, se estiver vazia.
const enfermeirosData: Omit<Enfermeiro, 'id'>[] = [
    { nome: "Mariana Silva", coren: "111222/SP", turno: "Manhã" },
    { nome: "Pedro Costa", coren: "333444/SP", turno: "Tarde" },
    { nome: "Beatriz Oliveira", coren: "555666/SP", turno: "Noite" },
];

// Popula a coleção de enfermeiros se ela estiver vazia.
export const seedEnfermeiros = async () => {
    try {
        const snapshot = await getDocs(enfermeirosCollection);
        if (snapshot.empty && enfermeirosData.length > 0) {
            const batch = writeBatch(db);
            enfermeirosData.forEach(enfermeiro => {
                const docRef = doc(enfermeirosCollection);
                batch.set(docRef, enfermeiro);
            });
            await batch.commit();
            console.log('Enfermeiros collection has been seeded.');
        }
    } catch (error) {
        console.error("Error seeding enfermeiros: ", error);
    }
};

// Obtém todos os enfermeiros do banco de dados.
export const getEnfermeiros = async (): Promise<Enfermeiro[]> => {
    await seedEnfermeiros();
    const snapshot = await getDocs(enfermeirosCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enfermeiro));
};

// Adiciona um novo enfermeiro ao banco de dados.
export const addEnfermeiro = async (enfermeiro: Omit<Enfermeiro, 'id'>): Promise<string> => {
    const docRef = await addDoc(enfermeirosCollection, enfermeiro);
    return docRef.id;
};

// Atualiza um enfermeiro existente no banco de dados.
export const updateEnfermeiro = async (id: string, enfermeiro: Partial<Omit<Enfermeiro, 'id'>>): Promise<void> => {
    const enfermeiroDoc = doc(db, 'enfermeiros', id);
    await updateDoc(enfermeiroDoc, enfermeiro);
};

// Exclui um enfermeiro do banco de dados.
export const deleteEnfermeiro = async (id: string): Promise<void> => {
    const enfermeiroDoc = doc(db, 'enfermeiros', id);
    await deleteDoc(enfermeiroDoc);
};
