import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, getDoc, writeBatch } from 'firebase/firestore';
import type { Paciente } from '@/types/paciente';

const pacientesCollection = collection(db, 'pacientes');

const pacientesData: Omit<Paciente, 'id'>[] = [
  {
    nome: 'Aarao de Carvalho da Costa',
    mae: 'Marinete de Carvalho da Costa',
    sexo: 'Masculino',
    idade: '49a',
    nascimento: '28/01/1976',
    cns: '706403696677388',
    cpf: '844.481.724-49',
    situacao: 'Ativo',
    historico: {
        criadoEm: '2023-10-26T06:50:00',
        criadoPor: 'Recepção',
        alteradoEm: '2023-10-26T07:00:00',
        alteradoPor: 'Triagem',
    }
  },
  {
    nome: 'Beatriz Almeida',
    mae: 'Juliana Almeida',
    sexo: 'Feminino',
    idade: '32a',
    nascimento: '15/05/1992',
    cns: '700001234567890',
    cpf: '123.456.789-00',
    situacao: 'Ativo',
    historico: {
        criadoEm: '2023-10-27T08:00:00',
        criadoPor: 'Recepção',
        alteradoEm: '2023-10-27T08:15:00',
        alteradoPor: 'Triagem',
    }
  },
  {
    nome: 'Carlos Eduardo Pereira',
    mae: 'Maria Pereira',
    sexo: 'Masculino',
    idade: '55a',
    nascimento: '10/11/1968',
    cns: '701234567890123',
    cpf: '987.654.321-11',
    situacao: 'Inativo',
    historico: {
        criadoEm: '2023-10-28T09:30:00',
        criadoPor: 'Recepção',
        alteradoEm: '2023-10-28T10:00:00',
        alteradoPor: 'Recepção',
    }
  },
];


export const seedPacientes = async () => {
    const snapshot = await getDocs(pacientesCollection);
    if (snapshot.empty) {
        const batch = writeBatch(db);
        pacientesData.forEach(paciente => {
            const docRef = doc(pacientesCollection);
            batch.set(docRef, paciente);
        });
        await batch.commit();
        console.log('Pacientes collection has been seeded.');
    }
};

export const getPacientes = async (): Promise<Paciente[]> => {
    await seedPacientes();
    const snapshot = await getDocs(pacientesCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Paciente));
};

export const addPaciente = async (paciente: Omit<Paciente, 'id'>): Promise<Paciente> => {
    const docRef = await addDoc(pacientesCollection, paciente);
    return { id: docRef.id, ...paciente };
};

export const deletePaciente = async (id: string): Promise<void> => {
    const pacienteDoc = doc(db, 'pacientes', id);
    await deleteDoc(pacienteDoc);
};
