
"use client"

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, onSnapshot, updateDoc, doc, Timestamp, orderBy, deleteDoc, writeBatch } from 'firebase/firestore';
import type { FilaDeEsperaItem } from '@/types/fila';
import { createChamada } from './chamadasService';
import { getDoc } from 'firebase/firestore';
import { startOfDay, endOfDay } from 'date-fns';
import { getNextCounter } from './countersService';
import { getEmpresa } from './empresaService';
import { Empresa, Classificacao } from '@/types/empresa';


interface SearchFilters {
    dateFrom: Date;
    dateTo: Date;
}

interface FullSearchFilters extends SearchFilters {
    pacienteId?: string;
    profissionalId?: string;
    departamentoId?: string;
    classificacao?: string;
    status?: string;
}

const getPrioridade = (classificacao: FilaDeEsperaItem['classificacao'], classificacoesConfig: Classificacao[]): FilaDeEsperaItem['prioridade'] => {
    const config = classificacoesConfig.find(c => c.id === classificacao);
    const index = config ? classificacoesConfig.indexOf(config) : -1;

    // Prioridades padrão para os 4 tipos base
    if (classificacao === 'Preferencial') return 1;
    if (classificacao === 'Urgencia') return 2;
    if (classificacao === 'Normal') return 3;
    if (classificacao === 'Outros') return 4;
    
    // Para novos tipos, a prioridade é baseada na ordem em que aparecem, após os padrões
    return index !== -1 ? index + 5 : 99;
}

export const addPreCadastroToFila = async (
    classificacao: Classificacao,
    classificacoes: Classificacao[]
): Promise<string> => {
    try {
        const filaDeEsperaCollection = collection(db, 'filaDeEspera');
        
        const prioridade = getPrioridade(classificacao.id, classificacoes);
        const counterName = `senha_${classificacao.id.toLowerCase()}`;
        const ticketPrefix = classificacao.nome.charAt(0).toUpperCase();

        const ticketNumber = await getNextCounter(counterName, true);
        const senha = `${ticketPrefix}-${String(ticketNumber).padStart(2, '0')}`;

        await addDoc(filaDeEsperaCollection, {
            senha,
            classificacao: classificacao.id, // Salva o ID da classificação
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

export const addPacienteToFila = async (item: Omit<FilaDeEsperaItem, 'id' | 'chegadaEm' | 'chamadaEm' | 'finalizadaEm' | 'canceladaEm' | 'prioridade'>, atendimentoPendenteId?: string ) => {
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
        
        const empresaConfig = await getEmpresa();
        const classificacoes = empresaConfig?.classificacoes || [];
        const prioridade = getPrioridade(item.classificacao, classificacoes);


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

/**
 * Consulta que requer um índice composto no Firestore.
 * Coleção: filaDeEspera
 * Campos: status (Ascendente), chegadaEm (Ascendente)
 * Link para criação: https://console.firebase.google.com/v1/r/project/saude-facil-99832/firestore/indexes?create_composite=ClZwcm9qZWN0cy9zYXVkZS1mYWNpbC05OTgzMi9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvZmlsYURlRXNwZXJhL2luZGV4ZXMvXxABGgoKBnN0YXR1cxABGg0KCWNoZWdhZGFFbRABGgwKCF9fbmFtZV9fEAE
 */
export const getAtendimentosPendentes = (
    onUpdate: (data: FilaDeEsperaItem[]) => void,
    onError: (error: string) => void
) => {
    const q = query(
        collection(db, "filaDeEspera"), 
        where("status", "==", "pendente"),
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
        console.error("Error fetching pending queue: ", error);
        onError("Não foi possível buscar as senhas pendentes. Verifique se o índice do Firestore foi criado. O link para criação está nos comentários do código no arquivo 'filaDeEsperaService.ts'.");
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

/**
 * Consulta que requer um índice composto no Firestore.
 * Coleção: filaDeEspera
 * Campos: status (Ascendente), prioridade (Ascendente), chegadaEm (Ascendente)
 * Link para criação: https://console.firebase.google.com/v1/r/project/saude-facil-99832/firestore/indexes?create_composite=Cl5wcm9qZWN0cy9zYXVkZS1mYWNpbC05OTgzMi9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvZmlsYURlRXNwZXJhL2luZGV4ZXMvXxABGgoKBnN0YXR1cxABEg4KCnByaW9yaWRhZGUQARINCgljaGVnYWRhRW0QARoMCghfX25hbWVfXxAB
 */
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
        onError("Não foi possível buscar a fila de atendimento. Verifique se o índice do Firestore foi criado. O link para criação está nos comentários do código no arquivo 'filaDeEsperaService.ts'.");
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

export const getAtendimentosFinalizadosHoje = (
    onUpdate: (data: FilaDeEsperaItem[]) => void,
    onError: (error: string) => void
) => {
    const startOfToday = startOfDay(new Date());

    const q = query(
        collection(db, "relatorios_atendimentos"),
        where("finalizadaEm", ">=", startOfToday)
    );

    const qCanceled = query(
        collection(db, "relatorios_atendimentos"),
        where("canceladaEm", ">=", startOfToday)
    );

    const combineAndUpdate = (finalizados: FilaDeEsperaItem[], cancelados: FilaDeEsperaItem[]) => {
        const combined = [...finalizados, ...cancelados];
        combined.sort((a, b) => {
            const timeA = a.finalizadaEm?.toMillis() || a.canceladaEm?.toMillis() || 0;
            const timeB = b.finalizadaEm?.toMillis() || b.canceladaEm?.toMillis() || 0;
            return timeB - timeA;
        });
        onUpdate(combined);
    };

    let finalizadosData: FilaDeEsperaItem[] = [];
    let canceladosData: FilaDeEsperaItem[] = [];

    const unsubFinalizados = onSnapshot(q, (snapshot) => {
        finalizadosData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as FilaDeEsperaItem));
        combineAndUpdate(finalizadosData, canceladosData);
    }, (error) => {
        const firestoreError = error as any;
        let errorMessage = "Não foi possível buscar os atendimentos finalizados de hoje.";
        if (firestoreError.code === 'failed-precondition' && firestoreError.message.includes('index')) {
            const urlMatch = firestoreError.message.match(/https:\/\/[^ ]+/);
            if (urlMatch) {
                errorMessage += ` É necessário criar um índice no Firestore. Acesse: ${urlMatch[0]}`;
            }
        }
        console.error("Error fetching today's finalized appointments: ", error);
        onError(errorMessage);
    });

    const unsubCancelados = onSnapshot(qCanceled, (snapshot) => {
        canceladosData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as FilaDeEsperaItem));
        combineAndUpdate(finalizadosData, canceladosData);
    }, (error) => {
        const firestoreError = error as any;
        let errorMessage = "Não foi possível buscar os atendimentos cancelados de hoje.";
        if (firestoreError.code === 'failed-precondition' && firestoreError.message.includes('index')) {
            const urlMatch = firestoreError.message.match(/https:\/\/[^ ]+/);
            if (urlMatch) {
                errorMessage += ` É necessário criar um índice no Firestore. Acesse: ${urlMatch[0]}`;
            }
        }
        console.error("Error fetching today's canceled appointments: ", error);
        onError(errorMessage);
    });


    return () => {
        unsubFinalizados();
        unsubCancelados();
    };
};


export const chamarPaciente = async (item: FilaDeEsperaItem, tipoChamada: 'atendimento' | 'triagem' = 'atendimento') => {
    if (!item.id) {
        throw new Error("ID do item da fila não encontrado.");
    }
    
    let sala: string = "";
    let profissional: string = "";
    let paciente: string = "";
    let novoStatus: FilaDeEsperaItem['status'];

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
        paciente = item.pacienteNome || "Paciente";
        novoStatus = "em-atendimento";
    } else {
        const empresaConfig = await getEmpresa();
        
        if (empresaConfig?.exibirLocalChamadaTriagem) {
            sala = empresaConfig.localChamadaTriagem || "Recepção";
        } else {
            sala = ""; // Se não for para exibir, o texto fica vazio
        }

        novoStatus = "chamado-triagem";
        paciente = ""; // Ocultar nome do paciente na triagem
        profissional = ""; // Ocultar nome do profissional na triagem
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

export const retornarParaPendente = async (id: string): Promise<void> => {
    if (!id) {
        throw new Error("ID do item da fila não encontrado.");
    }
    const filaDocRef = doc(db, "filaDeEspera", id);
    await updateDoc(filaDocRef, {
        status: "pendente",
        chamadaEm: null,
        // Limpa os dados de identificação para que possa ser re-identificado
        pacienteId: null,
        pacienteNome: null,
    });
};

export const retornarPacienteParaTriagem = async (id: string): Promise<void> => {
    if (!id) {
        throw new Error("ID do item da fila não encontrado.");
    }
    const filaDocRef = doc(db, "filaDeEspera", id);
    await updateDoc(filaDocRef, {
        status: "chamado-triagem",
        chamadaEm: serverTimestamp(),
        departamentoId: null,
        departamentoNome: null,
        departamentoNumero: null,
        profissionalId: null,
        profissionalNome: null,
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


export const cancelarAtendimento = async (item: FilaDeEsperaItem, motivo?: string) => {
    if (!item || !item.id) throw new Error("ID do item da fila não encontrado.");

    const filaDocRef = doc(db, "filaDeEspera", item.id);
    
    // Create a new document in relatorios_atendimentos
    const relatoriosCollectionRef = collection(db, 'relatorios_atendimentos');
    await addDoc(relatoriosCollectionRef, {
        ...item,
        status: "cancelado",
        motivoCancelamento: motivo || null,
        canceladaEm: serverTimestamp(),
    });
    
    // Delete the original document from filaDeEspera
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
            where("pacienteId", "==", pacienteId)
            // A ordenação será feita no lado do cliente para evitar erros de índice complexos
        );

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FilaDeEsperaItem));
        
        // Ordenar por data de finalização ou cancelamento, a mais recente primeiro
        data.sort((a, b) => {
            const timeA = a.finalizadaEm?.toMillis() || a.canceladaEm?.toMillis() || 0;
            const timeB = b.finalizadaEm?.toMillis() || b.canceladaEm?.toMillis() || 0;
            return timeB - timeA;
        });

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
        
        const qFinalizados = query(
            collection(db, "relatorios_atendimentos"),
            where("finalizadaEm", ">=", Timestamp.fromDate(start)),
            where("finalizadaEm", "<=", Timestamp.fromDate(end))
        );

        const qCancelados = query(
            collection(db, "relatorios_atendimentos"),
            where("canceladaEm", ">=", Timestamp.fromDate(start)),
            where("canceladaEm", "<=", Timestamp.fromDate(end))
        );

        const [finalizadosSnapshot, canceladosSnapshot] = await Promise.all([
            getDocs(qFinalizados),
            getDocs(qCancelados)
        ]);
        
        const finalizadosData = finalizadosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FilaDeEsperaItem));
        const canceladosData = canceladosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FilaDeEsperaItem));
        
        const allData = [...finalizadosData, ...canceladosData].sort((a, b) => {
            const timeA = a.finalizadaEm?.toMillis() || a.canceladaEm?.toMillis() || 0;
            const timeB = b.finalizadaEm?.toMillis() || b.canceladaEm?.toMillis() || 0;
            return timeB - timeA;
        });
        
        return allData;

    } catch (error) {
        const firestoreError = error as any;
        let errorMessage = "Não foi possível carregar o relatório de atendimentos.";
        if (firestoreError.code === 'failed-precondition' && firestoreError.message.includes('index')) {
            const urlMatch = firestoreError.message.match(/https:\/\/[^ ]+/);
            if (urlMatch) {
                errorMessage += ` É necessário criar um índice no Firestore. Acesse: ${urlMatch[0]}`;
            }
        }
        console.error("Erro ao buscar histórico de atendimentos por período:", error);
        throw new Error(errorMessage);
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

    if (filters.status && filters.status !== 'todos') {
        data = data.filter(item => item.status === filters.status);
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
        const empresaConfig = await getEmpresa();
        const classificacoes = empresaConfig?.classificacoes || [];
        updates.prioridade = getPrioridade(data.classificacao, classificacoes);
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
        const empresaConfig = await getEmpresa();
        const classificacoes = empresaConfig?.classificacoes || [];
        updates.prioridade = getPrioridade(data.classificacao, classificacoes);
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

export const clearAllRelatorios = async (): Promise<number> => {
    try {
        const q = query(collection(db, "relatorios_atendimentos"));
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
        throw new Error("Não foi possível limpar os relatórios de atendimento.");
    }
};

export const clearAllAtendimentos = async (): Promise<number> => {
    try {
        const q = query(collection(db, "filaDeEspera"));
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
        console.error("Erro ao limpar a fila de atendimentos:", error);
        throw new Error("Não foi possível limpar a fila de atendimentos.");
    }
};

    

    