
"use client"
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, writeBatch, updateDoc, getDoc, query, orderBy } from 'firebase/firestore';
import type { Usuario } from '@/types/usuario';
import { getNextCounter } from './countersService';

const usuariosCollection = collection(db, 'usuarios');

export const getUsuarios = async (): Promise<Usuario[]> => {
    const q = query(usuariosCollection, orderBy("codigo"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Usuario));
};

export const addUsuario = async (usuario: Omit<Usuario, 'id' | 'codigo' | 'historico'>): Promise<string> => {
    const nextId = await getNextCounter('usuarios');
    const codigo = String(nextId).padStart(3, '0');
    const newUsuario = {
        ...usuario,
        codigo,
        historico: {
            criadoEm: new Date().toISOString(),
            criadoPor: 'Admin (Cadastro)',
            alteradoEm: new Date().toISOString(),
            alteradoPor: 'Admin (Cadastro)',
        }
    }
    const docRef = await addDoc(usuariosCollection, newUsuario);
    return docRef.id;
};

export const updateUsuario = async (id: string, usuario: Partial<Omit<Usuario, 'id' | 'codigo' | 'historico'>>): Promise<void> => {
    const usuarioDocRef = doc(db, 'usuarios', id);
    const usuarioSnap = await getDoc(usuarioDocRef);
    if (!usuarioSnap.exists()) {
        throw new Error("Usuário não encontrado");
    }
    const existingUsuario = usuarioSnap.data() as Usuario;

    const usuarioToUpdate: Partial<Omit<Usuario, 'id'>> = {
        ...usuario,
        historico: {
            ...existingUsuario.historico,
            alteradoEm: new Date().toISOString(),
            alteradoPor: 'Admin (Edição)',
        }
    }
    await updateDoc(usuarioDocRef, usuarioToUpdate);
};

export const deleteUsuario = async (id: string): Promise<void> => {
    const usuarioDoc = doc(db, 'usuarios', id);
    await deleteDoc(usuarioDoc);
};
