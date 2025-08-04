"use client"
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, writeBatch, updateDoc } from 'firebase/firestore';
import type { Paciente } from '@/types/paciente';
import { getNextCounter } from './countersService';

const pacientesCollection = collection(db, 'pacientes');

// Dados de exemplo para popular a coleção, se estiver vazia.
const pacientesData: Omit<Paciente, 'id' | 'codigo' | 'idade'>[] = [
  {
    nome: "João da Silva",
    mae: "Maria da Silva",
    pai: "José da Silva",
    sexo: "Masculino",
    nascimento: "15/05/1988",
    cns: "123456789012345",
    cpf: "111.222.333-44",
    situacao: "Ativo",
    estadoCivil: "Casado(a)",
    raca: "Parda",
    cep: "01001-000",
    endereco: "Praça da Sé",
    numero: "s/n",
    bairro: "Sé",
    cidade: "São Paulo",
    uf: "SP",
    nacionalidade: "Brasileira",
    email: "joao.silva@example.com",
    telefone: "(11) 98765-4321",
    observacoes: "Paciente com histórico de hipertensão.",
    historico: {
        criadoEm: new Date().toISOString(),
        criadoPor: "Sistema (Seed)",
        alteradoEm: new Date().toISOString(),
        alteradoPor: "Sistema (Seed)",
    }
  },
  {
    nome: "Maria Oliveira",
    mae: "Ana Oliveira",
    pai: "Carlos Oliveira",
    sexo: "Feminino",
    nascimento: "22/11/1995",
    cns: "987654321098765",
    cpf: "444.555.666-77",
    situacao: "Ativo",
    estadoCivil: "Solteiro(a)",
    raca: "Branca",
    cep: "20031-050",
    endereco: "Av. Pres. Wilson",
    numero: "165",
    bairro: "Centro",
    cidade: "Rio de Janeiro",
    uf: "RJ",
    nacionalidade: "Brasileira",
    email: "maria.oliveira@example.com",
    telefone: "(21) 91234-5678",
    observacoes: "",
    historico: {
        criadoEm: new Date().toISOString(),
        criadoPor: "Sistema (Seed)",
        alteradoEm: new Date().toISOString(),
        alteradoPor: "Sistema (Seed)",
    }
  },
];

// Popula a coleção de pacientes se ela estiver vazia.
export const seedPacientes = async () => {
    try {
        const snapshot = await getDocs(pacientesCollection);
        if (snapshot.empty && pacientesData.length > 0) {
            const batch = writeBatch(db);
            for (const paciente of pacientesData) {
                const docRef = doc(pacientesCollection);
                const nextId = await getNextCounter('pacientes');
                const codigo = String(nextId).padStart(4, '0');
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
    await seedPacientes();
    const snapshot = await getDocs(pacientesCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Paciente)).sort((a, b) => a.nome.localeCompare(b.nome));
};

// Adiciona um novo paciente ao banco de dados.
export const addPaciente = async (paciente: Omit<Paciente, 'id' | 'codigo'>): Promise<string> => {
    const nextId = await getNextCounter('pacientes');
    const codigo = String(nextId).padStart(4, '0');
    const docRef = await addDoc(pacientesCollection, { ...paciente, codigo });
    return docRef.id;
};

// Atualiza um paciente existente no banco de dados.
export const updatePaciente = async (id: string, paciente: Partial<Omit<Paciente, 'id'>>): Promise<void> => {
    const pacienteDoc = doc(db, 'pacientes', id);
    await updateDoc(pacienteDoc, paciente);
};

// Exclui um paciente do banco de dados.
export const deletePaciente = async (id: string): Promise<void> => {
    const pacienteDoc = doc(db, 'pacientes', id);
    await deleteDoc(pacienteDoc);
};
