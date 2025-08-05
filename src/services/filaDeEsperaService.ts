
"use client"

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, onSnapshot, updateDoc, doc, Timestamp, orderBy, deleteDoc, writeBatch } from 'firebase/firestore';
import type { FilaDeEsperaItem } from '@/types/fila';
import { createChamada } from './chamadasService';
import { getDoc } from 'firebase/firestore';


export const addPacienteToFila = async (item: Omit<FilaDeEsperaItem, 'id' | 'chegadaEm' | 'chamadaEm' | 'finalizadaEm'>) => {
    try {
        // Check for 'aguardando' status
        const qAguardando = query(collection(db, 'filaDeEspera'), where("pacienteId", "==", item.pacienteId), where("status", "==", "aguardando"));
        const aguardandoSnapshot = await getDocs(qAguardando);
        if (!aguardandoSnapshot.empty) {
            throw new Error("Este paciente já está na fila de atendimento.");
        }

        // Check for 'em-atendimento' status
        const qEmAtendimento = query(collection(db, 'filaDeEspera'), where("pacienteId", "==", item.pacienteId), where("status", "==", "em-atendimento"));
        const emAtendimentoSnapshot = await getDocs(qEmAtendimento);
        if (!emAtendimentoSnapshot.empty) {
            throw new Error("Este paciente já está em atendimento.");
        }
        
        const prioridade = item.classificacao === 'Emergência' ? 1 : 2;

        await addDoc(collection(db, 'filaDeEspera'), {
            ...item,
            prioridade,
            chegadaEm: serverTimestamp(),
            chamadaEm: null,
            finalizadaEm: null
        });
    } catch (error) {
        console.error("Erro ao adicionar paciente à fila: ", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Não foi possível adicionar o paciente à fila no Firestore.");
    }
};

export const getFilaDeEspera = (
    onUpdate: (data: FilaDeEsperaItem[]) => void,
    onError: (error: string) => void
) => {
    const q = query(
        collection(db, "filaDeEspera"), 
        where("status", "==", "aguardando"),
        orderBy("prioridade"),
        orderBy("chegadaEm")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const data: FilaDeEsperaItem[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as FilaDeEsperaItem));
        
        onUpdate(data);
    }, (error) => {
        console.error("Error fetching queue: ", error);
        onError("Não foi possível buscar a fila de atendimento. Pode ser necessário criar um índice no Firestore. Verifique o console para um link de criação.");
    });

    return unsubscribe;
};

export const getAtendimentosEmAndamento = (
    onUpdate: (data: FilaDeEsperaItem[]) => void,
    onError: (error: string) => void
) => {
     const q = query(
        collection(db, "filaDeEspera"), 
        where("status", "==", "em-atendimento")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const data: FilaDeEsperaItem[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as FilaDeEsperaItem));

        data.sort((a, b) => {
            if (a.chamadaEm && b.chamadaEm) {
                return b.chamadaEm.toDate().getTime() - a.chamadaEm.toDate().getTime();
            }
            return 0;
        });
        
        onUpdate(data);
    }, (error) => {
        console.error("Error fetching in-progress appointments: ", error);
        onError("Não foi possível buscar os atendimentos em andamento.");
    });

    return unsubscribe;
}


export const chamarPaciente = async (item: FilaDeEsperaItem) => {
    if (!item.id) {
        throw new Error("ID do item da fila não encontrado.");
    }

    // 1. Get the department details to find the room number
    const departamentoDocRef = doc(db, 'departamentos', item.departamentoId);
    const departamentoSnap = await getDoc(departamentoDocRef);

    if (!departamentoSnap.exists()) {
        throw new Error("Departamento não encontrado.");
    }
    const departamentoData = departamentoSnap.data();
    
    let sala = item.departamentoNome;
    if (departamentoData.numero) {
        sala = `${item.departamentoNome} - SALA ${departamentoData.numero}`;
    }


    // 2. Register the call on the public panel
    await createChamada({
        senha: item.senha,
        departamentoNome: sala,
        profissionalNome: item.profissionalNome,
        pacienteNome: item.pacienteNome,
    });
    
    // 3. Update the patient's status in the queue
    const filaDocRef = doc(db, "filaDeEspera", item.id);
    await updateDoc(filaDocRef, {
        status: "em-atendimento",
        chamadaEm: serverTimestamp()
    });
};

export const finalizarAtendimento = async (id: string) => {
    if (!id) {
        throw new Error("ID do item da fila não encontrado.");
    }

    const filaDocRef = doc(db, "filaDeEspera", id);
    await updateDoc(filaDocRef, {
        status: "finalizado",
        finalizadaEm: serverTimestamp()
    });
};


export const deleteFilaItem = async (id: string): Promise<void> => {
    if (!id) {
        throw new Error("ID do item da fila não encontrado.");
    }
    const filaDocRef = doc(db, "filaDeEspera", id);
    await deleteDoc(filaDocRef);
};


export const getHistoricoAtendimentos = async (pacienteId: string): Promise<FilaDeEsperaItem[]> => {
    if (!pacienteId) {
        return [];
    }
    try {
        const q = query(
            collection(db, "filaDeEspera"),
            where("pacienteId", "==", pacienteId),
            where("status", "==", "finalizado"),
            orderBy("chegadaEm", "desc")
        );

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FilaDeEsperaItem));
        
        return data;

    } catch (error) {
        console.error("Erro ao buscar histórico de atendimentos:", error);
        throw new Error("Não foi possível carregar o histórico do paciente.");
    }
};

export const updateFilaItem = async (id: string, data: Partial<FilaDeEsperaItem>): Promise<void> => {
    if (!id) {
        throw new Error("ID do item da fila não encontrado.");
    }
    const filaDocRef = doc(db, "filaDeEspera", id);
    const updates = {...data};
    if (data.classificacao) {
        updates.prioridade = data.classificacao === 'Emergência' ? 1 : 2;
    }
    await updateDoc(filaDocRef, updates);
};

export const retornarPacienteParaFila = async (id: string): Promise<void> => {
    if (!id) {
        throw new Error("ID do item da fila não encontrado.");
    }

    const filaDocRef = doc(db, "filaDeEspera", id);
    await updateDoc(filaDocRef, {
        status: "aguardando",
        chamadaEm: null // Reseta o horário da chamada
    });
};

export const clearAllHistoricoAtendimentos = async (): Promise<number> => {
    try {
        const q = query(
            collection(db, "filaDeEspera"),
            where("status", "==", "finalizado")
        );

        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return 0; // Nenhum documento para excluir
        }

        const batch = writeBatch(db);
        querySnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        return querySnapshot.size;
    } catch (error) {
        console.error("Erro ao limpar o histórico de atendimentos:", error);
        throw new Error("Não foi possível limpar o prontuário dos pacientes.");
    }
};
