"use client"
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, writeBatch, query, where, getDoc } from 'firebase/firestore';
import type { Departamento } from '@/types/departamento';
import { getNextCounter } from './countersService';

const departamentosCollection = collection(db, 'departamentos');

const departamentosData: Omit<Departamento, 'id' | 'codigo'>[] = [];

export const seedDepartamentos = async () => {
    try {
        const snapshot = await getDocs(departamentosCollection);
        if (snapshot.empty && departamentosData.length > 0) {
            const batch = writeBatch(db);
            for (const depto of departamentosData) {
                const docRef = doc(departamentosCollection);
                const nextId = await getNextCounter('departamentos_v2');
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
    // await seedDepartamentos(); // Comentado para não popular
    const snapshot = await getDocs(departamentosCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Departamento)).sort((a, b) => parseInt(a.codigo) - parseInt(b.codigo));
};

const checkSalaExists = async (numero: string, currentId?: string): Promise<boolean> => {
    if (!numero) return false;
    const q = query(departamentosCollection, where("numero", "==", numero));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return false;
    // If we are updating, we need to check if the found doc is the same as the one being updated
    if (currentId) {
        return snapshot.docs.some(doc => doc.id !== currentId);
    }
    return true;
};

export const addDepartamento = async (departamento: Omit<Departamento, 'id' | 'codigo'>): Promise<string> => {
    if (await checkSalaExists(departamento.numero || '')) {
        throw new Error("O número da sala já está em uso por outro departamento.");
    }
    const nextId = await getNextCounter('departamentos_v2');
    const codigo = String(nextId).padStart(3, '0');
     const newDepartamento: Omit<Departamento, 'id'> = {
        ...departamento,
        codigo,
        historico: {
            criadoEm: new Date().toISOString(),
            criadoPor: 'Admin (Cadastro)',
            alteradoEm: new Date().toISOString(),
            alteradoPor: 'Admin (Cadastro)',
        }
    };
    const docRef = await addDoc(departamentosCollection, newDepartamento);
    return docRef.id;
};

export const updateDepartamento = async (id: string, departamento: Partial<Omit<Departamento, 'id' | 'codigo'>>): Promise<void> => {
    if (await checkSalaExists(departamento.numero || '', id)) {
        throw new Error("O número da sala já está em uso por outro departamento.");
    }
    const departamentoDoc = doc(db, 'departamentos', id);
    const existingDocSnap = await getDoc(departamentoDoc);
    const existingData = existingDocSnap.data() as Departamento;

    const updatedDepartamento = {
        ...departamento,
        historico: {
            ...existingData.historico,
            alteradoEm: new Date().toISOString(),
            alteradoPor: 'Admin (Edição)',
        }
    };

    await updateDoc(departamentoDoc, updatedDepartamento);
};

export const deleteDepartamento = async (id: string): Promise<void> => {
    const departamentoDoc = doc(db, 'departamentos', id);
    
    // Check if there are any patients in the queue for this department
    const q = query(collection(db, "filaDeEspera"), where("departamentoId", "==", id), where("status", "!=", "finalizado"));
    const activePatientsInQueue = await getDocs(q);
    if (!activePatientsInQueue.empty) {
        throw new Error(`Não é possível excluir. Existem ${activePatientsInQueue.size} pacientes na fila deste departamento.`);
    }

    await deleteDoc(departamentoDoc);
};
