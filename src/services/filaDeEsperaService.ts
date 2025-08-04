"use client"

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, onSnapshot, updateDoc, doc, Timestamp, orderBy, deleteDoc } from 'firebase/firestore';
import type { FilaDeEsperaItem } from '@/types/fila';
import { createChamada } from './chamadasService';
import { getDoc } from 'firebase/firestore';


export const addPacienteToFila = async (item: Omit<FilaDeEsperaItem, 'id' | 'chegadaEm' | 'chamadaEm' | 'finalizadaEm'>) => {
    // Verifica se o paciente já está na fila de qualquer departamento
    const q = query(collection(db, "filaDeEspera"), where("pacienteId", "==", item.pacienteId), where("status", "in", ["aguardando", "em-atendimento"]));
    const existing = await getDocs(q);
    
    if (!existing.empty) {
        const existingItem = existing.docs[0].data();
        throw new Error(`Este paciente já está na fila de ${existingItem.departamentoNome}.`);
    }

    try {
        await addDoc(collection(db, 'filaDeEspera'), {
            ...item,
            chegadaEm: serverTimestamp() 
        });
    } catch (error) {
        console.error("Erro ao adicionar paciente à fila: ", error);
        throw new Error("Não foi possível adicionar o paciente à fila no Firestore.");
    }
};

export const getFilaDeEspera = (
    onUpdate: (data: FilaDeEsperaItem[]) => void,
    onError: (error: string) => void
) => {
    const q = query(
        collection(db, "filaDeEspera"), 
        where("status", "==", "aguardando")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const data: FilaDeEsperaItem[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as FilaDeEsperaItem)).filter(item => item.chegadaEm); 
        
        // Ordena os dados no lado do cliente
        data.sort((a, b) => {
            if (a.chegadaEm && b.chegadaEm) {
                return a.chegadaEm.toMillis() - b.chegadaEm.toMillis();
            }
            return 0;
        });
        
        onUpdate(data);
    }, (error) => {
        console.error("Error fetching queue: ", error);
        onError("Não foi possível buscar a fila de atendimento.");
    });

    return unsubscribe;
};

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
    const sala = departamentoData.numero ? `Sala ${departamentoData.numero}` : 'Recepção';


    // 2. Register the call on the public panel
    await createChamada({
        ticket: item.senha,
        room: sala,
        doctor: item.profissionalNome,
    });
    
    // 3. Update the patient's status in the queue
    const filaDocRef = doc(db, "filaDeEspera", item.id);
    await updateDoc(filaDocRef, {
        status: "em-atendimento",
        chamadaEm: serverTimestamp()
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
            where("status", "==", "finalizado")
        );

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FilaDeEsperaItem));
        
        // Ordena os dados no lado do cliente para evitar a necessidade de um índice composto
        data.sort((a, b) => {
            const timeA = a.finalizadaEm?.toMillis() || 0;
            const timeB = b.finalizadaEm?.toMillis() || 0;
            return timeB - timeA; // Descending order
        });
        
        return data;

    } catch (error) {
        console.error("Erro ao buscar histórico de atendimentos:", error);
        throw new Error("Não foi possível carregar o histórico do paciente.");
    }
};
