"use client"
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import type { Departamento } from '@/types/departamento';
import { getNextCounter } from './countersService';

const departamentosCollection = collection(db, 'departamentos');

const departamentosData: Omit<Departamento, 'id' | 'codigo'>[] = [
    { nome: "Recepção", situacao: 'Ativo' },
    { nome: "Triagem", situacao: 'Ativo' },
    { nome: "Consultório 1", numero: "01", situacao: 'Ativo' },
    { nome: "Consultório 2", numero: "02", situacao: 'Ativo' },
    { nome: "Sala de Coleta", numero: "03", situacao: 'Inativo' },
];

export const seedDepartamentos = async () => {
    try {
        const snapshot = await getDocs(departamentosCollection);
        if (snapshot.empty && departamentosData.length > 0) {
            const batch = writeBatch(db);
            for (const depto of departamentosData) {
                const docRef = doc(departamentosCollection);
                const nextId = await getNextCounter('departamentos');
                const codigo = String(nextId).padStart(3, '0');
                batch.set(docRef, { ...depto, codigo });
            }
            await batch.commit();
            console.log('Departamentos collection has been seeded.');
        }
    } catch (error) {
        console.error("Error seeding departamentos: ", error);
    }
};

export const getDepartamentos = async (): Promise<Departamento[]> => {
    await seedDepartamentos();
    const snapshot = await getDocs(departamentosCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Departamento)).sort((a, b) => parseInt(a.codigo) - parseInt(b.codigo));
};

export const addDepartamento = async (departamento: Omit<Departamento, 'id' | 'codigo'>): Promise<string> => {
    const nextId = await getNextCounter('departamentos');
    const codigo = String(nextId).padStart(3, '0');
    const docRef = await addDoc(departamentosCollection, { ...departamento, codigo });
    return docRef.id;
};

export const updateDepartamento = async (id: string, departamento: Partial<Omit<Departamento, 'id' | 'codigo'>>): Promise<void> => {
    const departamentoDoc = doc(db, 'departamentos', id);
    await updateDoc(departamentoDoc, departamento);
};

export const deleteDepartamento = async (id: string): Promise<void> => {
    const departamentoDoc = doc(db, 'departamentos', id);
    await deleteDoc(departamentoDoc);
};
