import { db } from '@/lib/firebase';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import type { Departamento } from '@/types/departamento';

const departamentosCollection = collection(db, 'departamentos');

export const getDepartamentos = async (): Promise<Departamento[]> => {
    const snapshot = await getDocs(departamentosCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Departamento));
};

export const addDepartamento = async (departamento: Omit<Departamento, 'id'>): Promise<string> => {
    const docRef = await addDoc(departamentosCollection, departamento);
    return docRef.id;
};

export const updateDepartamento = async (id: string, departamento: Partial<Omit<Departamento, 'id'>>): Promise<void> => {
    const departamentoDoc = doc(db, 'departamentos', id);
    await updateDoc(departamentoDoc, departamento);
};

export const deleteDepartamento = async (id: string): Promise<void> => {
    const departamentoDoc = doc(db, 'departamentos', id);
    await deleteDoc(departamentoDoc);
};
