
"use client"
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, writeBatch, updateDoc, onSnapshot, getDoc, query, orderBy, where } from 'firebase/firestore';
import type { Paciente } from '@/types/paciente';
import { getNextCounter } from './countersService';
import { getCurrentUser } from './authService';

const pacientesCollection = collection(db, 'pacientes');

const checkDuplicate = async (field: 'cpf' | 'cns', value: string, currentId?: string): Promise<void> => {
    if (!value) return; // Do not check for empty values
    
    const q = query(pacientesCollection, where(field, "==", value));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
        if (currentId) {
            // In update mode, check if the found document is different from the current one
            const isDuplicate = snapshot.docs.some(doc => doc.id !== currentId);
            if (isDuplicate) {
                throw new Error(`O ${field.toUpperCase()} informado já está cadastrado para outro paciente.`);
            }
        } else {
            // In add mode, any result is a duplicate
            throw new Error(`O ${field.toUpperCase()} informado já está cadastrado.`);
        }
    }
}

export const getPacientes = async (): Promise<Paciente[]> => {
    const q = query(pacientesCollection, orderBy("codigo", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Paciente));
};


export const getPacientesRealtime = (
    onUpdate: (data: Paciente[]) => void,
    onError: (error: string) => void
) => {
    const q = query(collection(db, "pacientes"), orderBy("codigo", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const data: Paciente[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Paciente));
        
        onUpdate(data);
    }, (error) => {
        console.error("Error fetching pacientes in realtime: ", error);
        onError("Não foi possível buscar a lista de pacientes.");
    });

    return unsubscribe;
};

export const addPaciente = async (paciente: Omit<Paciente, 'id' | 'codigo' | 'historico'>): Promise<string> => {
    // Check for duplicates before adding
    await checkDuplicate('cpf', paciente.cpf || '');
    await checkDuplicate('cns', paciente.cns);
    
    const nextId = await getNextCounter('pacientes_v2');
    const codigo = String(nextId).padStart(3, '0');
    const loggedUser = getCurrentUser();
    
    const newPatient: Omit<Paciente, 'id'> = {
        ...paciente,
        codigo,
        historico: {
            criadoEm: new Date().toISOString(),
            criadoPor: loggedUser?.nome || 'Admin',
            alteradoEm: new Date().toISOString(),
            alteradoPor: loggedUser?.nome || 'Admin',
        }
    }
    const docRef = await addDoc(pacientesCollection, newPatient);
    return docRef.id;
};

export const updatePaciente = async (id: string, paciente: Partial<Omit<Paciente, 'id' | 'codigo' | 'historico'>>): Promise<void> => {
    // Check for duplicates before updating
    if (paciente.cpf) await checkDuplicate('cpf', paciente.cpf, id);
    if (paciente.cns) await checkDuplicate('cns', paciente.cns, id);

    const pacienteDoc = doc(db, 'pacientes', id);
    const docSnap = await getDoc(pacienteDoc);

    if (!docSnap.exists()) {
        throw new Error("Paciente não encontrado");
    }

    const existingData = docSnap.data() as Paciente;
    const loggedUser = getCurrentUser();
    
    const updatedData: Partial<Omit<Paciente, 'id'>> = {
        ...paciente,
        historico: {
            ...existingData.historico,
            alteradoEm: new Date().toISOString(),
            alteradoPor: loggedUser?.nome || 'Admin',
        }
    }

    await updateDoc(pacienteDoc, updatedData);
};

export const deletePaciente = async (id: string): Promise<void> => {
    const pacienteDoc = doc(db, 'pacientes', id);
    await deleteDoc(pacienteDoc);
};

export const clearAllPacientes = async (): Promise<number> => {
    try {
        const snapshot = await getDocs(pacientesCollection);
        if (snapshot.empty) {
            return 0;
        }

        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        return snapshot.size;
    } catch (error) {
        console.error("Erro ao limpar a coleção de pacientes:", error);
        throw new Error("Não foi possível excluir todos os pacientes.");
    }
};

    
