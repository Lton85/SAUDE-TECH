
"use client"
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, writeBatch, updateDoc, onSnapshot, getDoc, query, orderBy } from 'firebase/firestore';
import type { Paciente } from '@/types/paciente';
import { getNextCounter } from './countersService';
import { getCurrentUser } from './authService';

const pacientesCollection = collection(db, 'pacientes');

export const getPacientes = async (): Promise<Paciente[]> => {
    const q = query(pacientesCollection, orderBy("codigo"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Paciente));
};


export const getPacientesRealtime = (
    onUpdate: (data: Paciente[]) => void,
    onError: (error: string) => void
) => {
    const q = query(collection(db, "pacientes"), orderBy("codigo", "desc"));

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

    