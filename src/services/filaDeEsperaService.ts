"use client"

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, onSnapshot, updateDoc, doc, Timestamp, orderBy } from 'firebase/firestore';
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
        where("status", "==", "aguardando"),
        orderBy("chegadaEm", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const data: FilaDeEsperaItem[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as FilaDeEsperaItem)).filter(item => item.chegadaEm); // Garante que o campo 'chegadaEm' não seja nulo
        
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
