
"use client"
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, writeBatch, updateDoc, getDoc, query, orderBy } from 'firebase/firestore';
import type { Profissional } from '@/types/profissional';
import { getNextCounter } from './countersService';

const profissionaisCollection = collection(db, 'profissionais');

// Dados de exemplo para popular a coleção, se estiver vazia.
const profissionaisData: Omit<Profissional, 'id' | 'codigo' | 'historico'>[] = [];

// Popula a coleção de profissionais se ela estiver vazia.
export const seedProfissionais = async () => {
    try {
        const snapshot = await getDocs(profissionaisCollection);
        if (snapshot.empty && profissionaisData.length > 0) {
            const batch = writeBatch(db);
            for (const profissional of profissionaisData) {
                const docRef = doc(profissionaisCollection);
                const nextId = await getNextCounter('profissionais_v2');
                const codigo = String(nextId).padStart(3, '0');
                const profissionalWithHistory = {
                    ...profissional,
                    codigo,
                    historico: {
                        criadoEm: new Date().toISOString(),
                        criadoPor: 'Admin (Seed)',
                        alteradoEm: new Date().toISOString(),
                        alteradoPor: 'Admin (Seed)',
                    }
                }
                batch.set(docRef, profissionalWithHistory);
            }
            await batch.commit();
            console.log('Profissionais collection has been seeded.');
        }
    } catch (error) {
        console.error("Error seeding profissionais: ", error);
    }
};

// Obtém todos os profissionais do banco de dados.
export const getProfissionais = async (): Promise<Profissional[]> => {
    // await seedProfissionais(); // Comentado para não popular
    const q = query(profissionaisCollection, orderBy("codigo"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Profissional));
};

// Adiciona um novo profissional ao banco de dados.
export const addProfissional = async (profissional: Omit<Profissional, 'id' | 'codigo' | 'historico'>): Promise<string> => {
    const nextId = await getNextCounter('profissionais_v2');
    const codigo = String(nextId).padStart(3, '0');
    const newProfissional = {
        ...profissional,
        codigo,
        historico: {
            criadoEm: new Date().toISOString(),
            criadoPor: 'Admin (Cadastro)',
            alteradoEm: new Date().toISOString(),
            alteradoPor: 'Admin (Cadastro)',
        }
    }
    const docRef = await addDoc(profissionaisCollection, newProfissional);
    return docRef.id;
};

// Atualiza um profissional existente no banco de dados.
export const updateProfissional = async (id: string, profissional: Partial<Omit<Profissional, 'id' | 'codigo' | 'historico'>>): Promise<void> => {
    const profissionalDocRef = doc(db, 'profissionais', id);
    const profissionalSnap = await getDoc(profissionalDocRef);
    if (!profissionalSnap.exists()) {
        throw new Error("Profissional não encontrado");
    }
    const existingProfissional = profissionalSnap.data() as Profissional;

    const profissionalToUpdate: Partial<Omit<Profissional, 'id'>> = {
        ...profissional,
        historico: {
            ...existingProfissional.historico,
            alteradoEm: new Date().toISOString(),
            alteradoPor: 'Admin (Edição)',
        }
    }
    await updateDoc(profissionalDocRef, profissionalToUpdate);
};

// Exclui um profissional do banco de dados.
export const deleteProfissional = async (id: string): Promise<void> => {
    const profissionalDoc = doc(db, 'profissionais', id);
    await deleteDoc(profissionalDoc);
};

    
