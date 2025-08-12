

"use client";

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { Empresa } from '@/types/empresa';

const empresaCollectionName = 'empresa';
const empresaDocId = 'config'; // Usaremos um ID fixo para o documento da empresa

const empresaDocRef = doc(db, empresaCollectionName, empresaDocId);

/**
 * Busca os dados da empresa no Firestore.
 * @returns {Promise<Empresa | null>} Os dados da empresa ou null se não existirem.
 */
export const getEmpresa = async (): Promise<Empresa | null> => {
    try {
        const docSnap = await getDoc(empresaDocRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Empresa;
        }
        return null;
    } catch (error) {
        console.error("Erro ao buscar dados da empresa: ", error);
        throw new Error("Não foi possível buscar as informações da empresa.");
    }
};

/**
 * Salva ou atualiza os dados da empresa no Firestore.
 * @param {Partial<Empresa>} data - Os dados da empresa para salvar (pode ser parcial).
 */
export const saveOrUpdateEmpresa = async (data: Partial<Empresa>): Promise<void> => {
    try {
        // Usa setDoc com merge: true para criar ou atualizar o documento
        await setDoc(empresaDocRef, data, { merge: true });
    } catch (error) {
        console.error("Erro ao salvar dados da empresa: ", error);
        throw new Error("Não foi possível salvar as informações da empresa.");
    }
};
