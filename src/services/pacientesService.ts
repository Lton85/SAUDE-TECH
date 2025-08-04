
"use client"
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, writeBatch, updateDoc, onSnapshot, getDoc } from 'firebase/firestore';
import type { Paciente } from '@/types/paciente';
import { getNextCounter } from './countersService';

const pacientesCollection = collection(db, 'pacientes');

// Dados de exemplo para popular a coleção, se estiver vazia.
const pacientesData: Omit<Paciente, 'id' | 'codigo' | 'idade'>[] = [];

// Popula a coleção de pacientes se ela estiver vazia.
export const seedPacientes = async () => {
    try {
        const snapshot = await getDocs(pacientesCollection);
        if (snapshot.empty && pacientesData.length > 0) {
            const batch = writeBatch(db);
            for (const paciente of pacientesData) {
                const docRef = doc(pacientesCollection);
                const nextId = await getNextCounter('pacientes_v2');
                const codigo = String(nextId).padStart(3, '0');
                const birthDate = new Date(paciente.nascimento.split('/').reverse().join('-'));
                const age = new Date().getFullYear() - birthDate.getFullYear();
                
                batch.set(docRef, { ...paciente, codigo, idade: `${age}a` });
            }
            await batch.commit();
            console.log('Pacientes collection has been seeded.');
        }
    } catch (error) {
        console.error("Error seeding pacientes: ", error);
    }
};

// Obtém todos os pacientes do banco de dados.
export const getPacientes = async (): Promise<Paciente[]> => {
    // await seedPacientes(); // Comentado para não popular
    const snapshot = await getDocs(pacientesCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Paciente)).sort((a, b) => a.nome.localeCompare(b.nome));
};


// Obtém todos os pacientes em tempo real.
export const getPacientesRealtime = (
    onUpdate: (data: Paciente[]) => void,
    onError: (error: string) => void
) => {
    const q = collection(db, "pacientes");

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const data: Paciente[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Paciente));
        
        data.sort((a, b) => a.nome.localeCompare(b.nome));
        onUpdate(data);
    }, (error) => {
        console.error("Error fetching pacientes in realtime: ", error);
        onError("Não foi possível buscar a lista de pacientes.");
    });

    return unsubscribe;
};


// Adiciona um novo paciente ao banco de dados.
export const addPaciente = async (paciente: Omit<Paciente, 'id' | 'codigo' | 'historico'>): Promise<string> => {
    const nextId = await getNextCounter('pacientes_v2');
    const codigo = String(nextId).padStart(3, '0');
    
    const newPatient = {
        ...paciente,
        codigo,
        historico: {
            criadoEm: new Date().toISOString(),
            criadoPor: 'Recepção (Cadastro)',
            alteradoEm: new Date().toISOString(),
            alteradoPor: 'Recepção (Cadastro)',
        }
    }
    const docRef = await addDoc(pacientesCollection, newPatient);
    return docRef.id;
};

// Atualiza um paciente existente no banco de dados.
export const updatePaciente = async (id: string, paciente: Partial<Omit<Paciente, 'id' | 'codigo' | 'historico'>>): Promise<void> => {
    const pacienteDoc = doc(db, 'pacientes', id);
    const docSnap = await getDoc(pacienteDoc);

    if (!docSnap.exists()) {
        throw new Error("Paciente não encontrado");
    }

    const existingData = docSnap.data() as Paciente;
    
    const updatedData: Partial<Paciente> = {
        ...paciente,
        historico: {
            ...existingData.historico,
            alteradoEm: new Date().toISOString(),
            alteradoPor: 'Recepção (Edição)',
        }
    }

    await updateDoc(pacienteDoc, updatedData);
};

// Exclui um paciente do banco de dados.
export const deletePaciente = async (id: string): Promise<void> => {
    const pacienteDoc = doc(db, 'pacientes', id);
    await deleteDoc(pacienteDoc);
};
