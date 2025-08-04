
"use client"
import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc, addDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import type { Enfermeiro } from '@/types/enfermeiro';
import { getNextCounter } from './countersService';

const enfermeirosCollection = collection(db, 'enfermeiros');

// Dados de exemplo para popular a coleção, se estiver vazia.
const enfermeirosData: Omit<Enfermeiro, 'id' | 'codigo' | 'historico'>[] = [];

// Popula a coleção de enfermeiros se ela estiver vazia.
export const seedEnfermeiros = async () => {
    try {
        const snapshot = await getDocs(enfermeirosCollection);
        if (snapshot.empty && enfermeirosData.length > 0) {
            const batch = writeBatch(db);
            for (const enfermeiro of enfermeirosData) {
                const docRef = doc(enfermeirosCollection);
                const nextId = await getNextCounter('enfermeiros_v1');
                const codigo = String(nextId).padStart(3, '0');
                const enfermeiroWithHistory = {
                    ...enfermeiro,
                    codigo,
                    historico: {
                        criadoEm: new Date().toISOString(),
                        criadoPor: 'Admin (Seed)',
                        alteradoEm: new Date().toISOString(),
                        alteradoPor: 'Admin (Seed)',
                    }
                }
                batch.set(docRef, enfermeiroWithHistory);
            }
            await batch.commit();
            console.log('Enfermeiros collection has been seeded.');
        }
    } catch (error) {
        console.error("Error seeding enfermeiros: ", error);
    }
};

// Obtém todos os enfermeiros do banco de dados.
export const getEnfermeiros = async (): Promise<Enfermeiro[]> => {
    // await seedEnfermeiros(); // Comentado para não popular
    const snapshot = await getDocs(enfermeirosCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enfermeiro)).sort((a, b) => parseInt(a.codigo) - parseInt(b.codigo));
};

// Adiciona um novo enfermeiro ao banco de dados.
export const addEnfermeiro = async (enfermeiro: Omit<Enfermeiro, 'id' | 'codigo' | 'historico'>): Promise<string> => {
    const nextId = await getNextCounter('enfermeiros_v1');
    const codigo = String(nextId).padStart(3, '0');
    const newEnfermeiro = {
        ...enfermeiro,
        codigo,
        historico: {
            criadoEm: new Date().toISOString(),
            criadoPor: 'Admin (Cadastro)',
            alteradoEm: new Date().toISOString(),
            alteradoPor: 'Admin (Cadastro)',
        }
    }
    const docRef = await addDoc(enfermeirosCollection, newEnfermeiro);
    return docRef.id;
};

// Atualiza um enfermeiro existente no banco de dados.
export const updateEnfermeiro = async (id: string, enfermeiro: Partial<Omit<Enfermeiro, 'id' | 'codigo' | 'historico'>>): Promise<void> => {
    const enfermeiroDocRef = doc(db, 'enfermeiros', id);
    const enfermeiroSnap = await getDoc(enfermeiroDocRef);
    if (!enfermeiroSnap.exists()) {
        throw new Error("Enfermeiro(a) não encontrado(a)");
    }
    const existingEnfermeiro = enfermeiroSnap.data() as Enfermeiro;

    const enfermeiroToUpdate = {
        ...enfermeiro,
        historico: {
            ...existingEnfermeiro.historico,
            alteradoEm: new Date().toISOString(),
            alteradoPor: 'Admin (Edição)',
        }
    }
    await updateDoc(enfermeiroDocRef, enfermeiroToUpdate);
};

// Exclui um enfermeiro do banco de dados.
export const deleteEnfermeiro = async (id: string): Promise<void> => {
    const enfermeiroDoc = doc(db, 'enfermeiros', id);
    await deleteDoc(enfermeiroDoc);
};
