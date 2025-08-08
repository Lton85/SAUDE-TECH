

"use client"

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, onSnapshot, updateDoc, doc, Timestamp, orderBy, deleteDoc, writeBatch } from 'firebase/firestore';
import type { FilaDeEsperaItem } from '@/types/fila';
import { createChamada } from './chamadasService';
import { getDoc } from 'firebase/firestore';
import { startOfDay, endOfDay } from 'date-fns';
import { getNextCounter } from './countersService';


interface SearchFilters {
    dateFrom: Date;
    dateTo: Date;
}

interface FullSearchFilters extends SearchFilters {
    pacienteId?: string;
    profissionalId?: string;
    departamentoId?: string;
    classificacao?: string;
}

const getPrioridade = (classificacao: FilaDeEsperaItem['classificacao']): FilaDeEsperaItem['prioridade'] => {
    switch (classificacao) {
        case 'Urgência': return 1;
        case 'Preferencial': return 2;
        case 'Normal': return 3;
        default: return 3;
    }
}

export const addPreCadastroToFila = async (classificacao: FilaDeEsperaItem['classificacao']): Promise<string> => {
    try {
        const filaDeEsperaCollection = collection(db, 'filaDeEspera');
        const prioridade = getPrioridade(classificacao);

        const counterName = classificacao === 'Urgência' ? 'senha_emergencia' : (classificacao === 'Preferencial' ? 'senha_preferencial' : 'senha_normal');
        const ticketNumber = await getNextCounter(counterName, true);
        const ticketPrefix = classificacao === 'Urgência' ? 'U' : (classificacao === 'Preferencial' ? 'P' : 'N');
        const senha = `${ticketPrefix}-${String(ticketNumber).padStart(3, '0')}`;

        await addDoc(filaDeEsperaCollection, {
            senha,
            classificacao,
            prioridade,
            chegadaEm: serverTimestamp(),
            status: 'pendente'
        });
        
        return senha;

    } catch (error) {
        console.error("Erro ao adicionar pré-cadastro à fila: ", error);
        throw new Error("Não foi possível gerar a senha no Firestore.");
    }
}

export const addPacienteToFila = async (item: Omit<FilaDeEsperaItem, 'id' | 'chegadaEm' | 'chamadaEm' | 'finalizadaEm' | 'prioridade'>, atendimentoPendenteId?: string ) => {
    try {
        const filaDeEsperaCollection = collection(db, 'filaDeEspera');
        
        // Check if patient is already in queue ('aguardando' or 'em-atendimento')
        if (item.pacienteId) {
            const q = query(
                filaDeEsperaCollection, 
                where("pacienteId", "==", item.pacienteId), 
                where("status", "in", ["aguardando", "em-atendimento"])
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                 const doc = querySnapshot.docs[0].data();
                 const status = doc.status === 'aguardando' ? 'aguardando atendimento' : 'em atendimento';
                throw new Error(`Este paciente já está ${status} e não pode ser adicionado novamente à fila.`);
            }
        }
        
        const prioridade = getPrioridade(item.classificacao);

        // If it's completing a pending registration, update it
        if (atendimentoPendenteId) {
            const docRef = doc(db, "filaDeEspera", atendimentoPendenteId);
             await updateDoc(docRef, {
                ...item,
                prioridade,
                status: 'aguardando'
            });
        } else { // Otherwise, create a new one
            await addDoc(filaDeEsperaCollection, {
                ...item,
                prioridade,
                chegadaEm: serverTimestamp(),
                chamadaEm: null,
                finalizadaEm: null,
                status: 'aguardando'
            });
        }
    } catch (error) {
        console.error("Erro ao adicionar paciente à fila: ", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Não foi possível adicionar o paciente à fila no Firestore.");
    }
};

export const getAtendimentosPendentes = (
    onUpdate: (data: FilaDeEsperaItem[]) => void,
    onError: (error: string) => void
) => {
    const q = query(
        collection(db, "filaDeEspera"), 
        where("status", "==", "pendente")
    );

     const unsubscribe = onSnapshot(q, (snapshot) => {
        const data: FilaDeEsperaItem[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as FilaDeEsperaItem));
        
        onUpdate(data);
    }, (error) => {
        console.error("Error fetching pending queue: ", error);
        onError("Não foi possível buscar as senhas pendentes.");
    });

    return unsubscribe;
}

export const getAtendimentosEmTriagem = (
    onUpdate: (data: FilaDeEsperaItem[]) => void,
    onError: (error: string) => void
) => {
    const q = query(
        collection(db, "filaDeEspera"), 
        where("status", "==", "chamado-triagem")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const data: FilaDeEsperaItem[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as FilaDeEsperaItem));
        
        onUpdate(data);
    }, (error) => {
        console.error("Error fetching in-triage queue: ", error);
        onError("Não foi possível buscar as senhas em triagem.");
    });

    return unsubscribe;
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
        
        onUpdate(data);
    }, (error) => {
        console.error("Error fetching in-progress appointments: ", error);
        onError("Não foi possível buscar os atendimentos em andamento.");
    });

    return unsubscribe;
}


export const chamarPaciente = async (item: FilaDeEsperaItem, tipoChamada: 'atendimento' | 'triagem' = 'atendimento') => {
    if (!item.id) {
        throw new Error("ID do item da fila não encontrado.");
    }
    
    let sala = "Triagem";
    let profissional = "Triagem";
    let paciente = item.pacienteNome || "Paciente";
    let novoStatus: FilaDeEsperaItem['status'] = "em-atendimento";

    if (tipoChamada === 'atendimento') {
         if (!item.departamentoId || !item.profissionalNome) {
            throw new Error("Dados do departamento ou profissional ausentes para esta chamada.");
        }
        const departamentoDocRef = doc(db, 'departamentos', item.departamentoId);
        const departamentoSnap = await getDoc(departamentoDocRef);

        if (!departamentoSnap.exists()) {
            throw new Error("Departamento não encontrado.");
        }
        const departamentoData = departamentoSnap.data();
        
        sala = item.departamentoNome || "Departamento";
        if (departamentoData.numero) {
            sala = `${item.departamentoNome} - SALA ${departamentoData.numero}`;
        }
        profissional = item.profissionalNome;
        novoStatus = "em-atendimento";
    } else {
        novoStatus = "chamado-triagem";
    }


    await createChamada({
        senha: item.senha,
        departamentoNome: sala,
        profissionalNome: profissional,
        pacienteNome: paciente,
        atendimentoId: item.id,
    });
    
    const filaDocRef = doc(db, "filaDeEspera", item.id);
    await updateDoc(filaDocRef, {
        status: novoStatus,
        chamadaEm: serverTimestamp()
    });
};

export const finalizarAtendimento = async (id: string) => {
    if (!id) throw new Error("ID do item da fila não encontrado.");

    const filaDocRef = doc(db, "filaDeEspera", id);
    const filaDocSnap = await getDoc(filaDocRef);

    if (!filaDocSnap.exists()) throw new Error("Atendimento não encontrado na fila.");
    
    const atendimentoData = filaDocSnap.data() as FilaDeEsperaItem;

    const relatoriosCollectionRef = collection(db, 'relatorios_atendimentos');
    await addDoc(relatoriosCollectionRef, {
        ...atendimentoData,
        status: "finalizado",
        finalizadaEm: serverTimestamp()
    });

    await deleteDoc(filaDocRef);
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
            collection(db, "relatorios_atendimentos"),
            where("pacienteId", "==", pacienteId),
            orderBy("finalizadaEm", "desc")
        );

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FilaDeEsperaItem));
        
        return data;

    } catch (error) {
        console.error("Erro ao buscar histórico de atendimentos:", error);
        throw new Error("Não foi possível carregar o histórico do paciente.");
    }
};

export const getHistoricoAtendimentosPorPeriodo = async (
    filters: SearchFilters
): Promise<FilaDeEsperaItem[]> => {
    const { dateFrom, dateTo } = filters;
    try {
        const start = startOfDay(dateFrom);
        const end = endOfDay(dateTo);
        
        const q = query(
            collection(db, "relatorios_atendimentos"),
            where("finalizadaEm", ">=", Timestamp.fromDate(start)),
            where("finalizadaEm", "<=", Timestamp.fromDate(end)),
            orderBy("finalizadaEm", "desc")
        );

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FilaDeEsperaItem));
        
        return data;

    } catch (error) {
        console.error("Erro ao buscar histórico de atendimentos por período:", error);
        throw new Error("Não foi possível carregar o relatório de atendimentos. Pode ser necessário criar um índice no Firestore. Verifique o console para um link de criação.");
    }
};

export const getHistoricoAtendimentosPorPeriodoComFiltros = async (
    filters: FullSearchFilters
): Promise<FilaDeEsperaItem[]> => {
    let data = await getHistoricoAtendimentosPorPeriodo(filters);

    if (filters.pacienteId && filters.pacienteId !== 'todos') {
        data = data.filter(item => item.pacienteId === filters.pacienteId);
    }

    if (filters.profissionalId && filters.profissionalId !== 'todos') {
        const docRef = doc(db, 'profissionais', filters.profissionalId);
        const docSnap = await getDoc(docRef);
        if(docSnap.exists()){
            const profissional = docSnap.data();
            data = data.filter(item => item.profissionalNome === `Dr(a). ${profissional.nome}`);
        }
    }

    if (filters.departamentoId && filters.departamentoId !== 'todos') {
        data = data.filter(item => item.departamentoId === filters.departamentoId);
    }
    
    if (filters.classificacao && filters.classificacao !== 'todos') {
        data = data.filter(item => item.classificacao === filters.classificacao);
    }
    
    return data;
}

export const getAtendimentoById = async (id: string): Promise<FilaDeEsperaItem | null> => {
    if (!id) return null;
    try {
        const docRef = doc(db, "relatorios_atendimentos", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as FilaDeEsperaItem;
        }
        return null;
    } catch (error) {
        console.error("Erro ao buscar atendimento por ID:", error);
        throw new Error("Não foi possível carregar o atendimento.");
    }
};

export const updateFilaItem = async (id: string, data: Partial<FilaDeEsperaItem>): Promise<void> => {
    if (!id) {
        throw new Error("ID do item da fila não encontrado.");
    }
    const filaDocRef = doc(db, "filaDeEspera", id);
    const updates = {...data};
    if (data.classificacao) {
        updates.prioridade = getPrioridade(data.classificacao);
    }
    await updateDoc(filaDocRef, updates);
};

export const updateHistoricoItem = async (id: string, data: Partial<FilaDeEsperaItem>): Promise<void> => {
    if (!id) {
        throw new Error("ID do item de histórico não encontrado.");
    }
    const historicoDocRef = doc(db, "relatorios_atendimentos", id);
    const updates = {...data};
    if (data.classificacao) {
        updates.prioridade = getPrioridade(data.classificacao);
    }
    await updateDoc(historicoDocRef, updates);
};

export const retornarPacienteParaFila = async (id: string): Promise<void> => {
    if (!id) {
        throw new Error("ID do item da fila não encontrado.");
    }

    const filaDocRef = doc(db, "filaDeEspera", id);
    await updateDoc(filaDocRef, {
        status: "aguardando",
        chamadaEm: null
    });
};

export const clearAllHistoricoAtendimentos = async (): Promise<number> => {
    try {
        const q = query(
            collection(db, "relatorios_atendimentos")
        );

        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return 0;
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
