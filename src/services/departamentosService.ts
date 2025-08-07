
"use client"
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, writeBatch, query, where, getDoc } from 'firebase/firestore';
import type { Departamento } from '@/types/departamento';
import { getNextCounter } from './countersService';
import { getCurrentUser } from './authService';

const departamentosCollection = collection(db, 'departamentos');

export const getDepartamentos = async (): Promise<Departamento[]> => {
    const snapshot = await getDocs(departamentosCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Departamento)).sort((a, b) => {
        if (a.codigo && b.codigo) {
            return a.codigo.localeCompare(b.codigo);
        }
        return 0;
    });
};

const checkSalaExists = async (numero: string, currentId?: string): Promise<boolean> => {
    if (!numero) return false;
    const q = query(departamentosCollection, where("numero", "==", numero));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return false;
    
    // If we are updating, exclude the current document from the check
    if (currentId) {
        return snapshot.docs.some(doc => doc.id !== currentId);
    }
    
    // If we are adding, any result means the room number exists
    return true;
};

export const addDepartamento = async (departamento: Omit<Departamento, 'id' | 'codigo' | 'historico'>): Promise<string> => {
    if (departamento.numero && await checkSalaExists(departamento.numero)) {
        throw new Error("O número da sala já está em uso por outro departamento.");
    }
    const nextId = await getNextCounter('departamentos_v2');
    const codigo = String(nextId).padStart(3, '0');
    const loggedUser = getCurrentUser();
     const newDepartamento: Omit<Departamento, 'id'> = {
        ...departamento,
        codigo,
        historico: {
            criadoEm: new Date().toISOString(),
            criadoPor: loggedUser?.nome || 'Admin',
            alteradoEm: new Date().toISOString(),
            alteradoPor: loggedUser?.nome || 'Admin',
        }
    };
    const docRef = await addDoc(departamentosCollection, newDepartamento);
    return docRef.id;
};

export const updateDepartamento = async (id: string, departamento: Partial<Omit<Departamento, 'id' | 'codigo' | 'historico'>>): Promise<void> => {
    if (departamento.numero && await checkSalaExists(departamento.numero, id)) {
        throw new Error("O número da sala já está em uso por outro departamento.");
    }
    const departamentoDoc = doc(db, 'departamentos', id);
    const existingDocSnap = await getDoc(departamentoDoc);

    if(!existingDocSnap.exists()) {
        throw new Error("Departamento não encontrado.");
    }

    const existingData = existingDocSnap.data() as Departamento;
    const loggedUser = getCurrentUser();

    const updatedDepartamento: Partial<Departamento> = {
        ...departamento,
        historico: {
            ...existingData.historico,
            alteradoEm: new Date().toISOString(),
            alteradoPor: loggedUser?.nome || 'Admin',
        }
    };

    await updateDoc(departamentoDoc, updatedDepartamento);
};

export const deleteDepartamento = async (id: string): Promise<void> => {
    const departamentoDoc = doc(db, 'departamentos', id);
    
    const q = query(collection(db, "filaDeEspera"), where("departamentoId", "==", id));
    const activePatientsInQueue = await getDocs(q);
    if (!activePatientsInQueue.empty) {
        throw new Error(`Não é possível excluir. Existem ${activePatientsInQueue.size} pacientes na fila ou em atendimento neste departamento.`);
    }

    await deleteDoc(departamentoDoc);
};

    