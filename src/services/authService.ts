
"use client";

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { Usuario } from '@/types/usuario';
import { getEmpresa } from './empresaService';

const AUTH_USER_KEY = 'saude_facil_auth_user';

export const login = async (username: string, pass: string, clientCode: string): Promise<Usuario> => {
  if (!username || !pass || !clientCode) {
    throw new Error('Usuário, senha e código do cliente são obrigatórios.');
  }

  // 1. Verificar o código do cliente
  const empresa = await getEmpresa();
  if (!empresa || empresa.codigoCliente !== clientCode) {
    throw new Error('Código do cliente inválido.');
  }

  // 2. Buscar o usuário
  const q = query(collection(db, 'usuarios'), where('usuario', '==', username));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error('Usuário ou senha inválidos.');
  }

  const userDoc = querySnapshot.docs[0];
  const user = { id: userDoc.id, ...userDoc.data() } as Usuario;

  // 3. Verificar a senha e o status
  if (user.senha !== pass) {
    throw new Error('Usuário ou senha inválidos.');
  }
  if (user.situacao !== 'Ativo') {
    throw new Error('Este usuário está inativo.');
  }

  // 4. Salvar usuário na sessão
  if (typeof window !== 'undefined') {
    const { senha, ...userToStore } = user;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userToStore));
    window.location.href = '/atendimento'; // Redireciona após o login
  }

  const { senha, ...userToReturn } = user;
  return userToReturn;
};

export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_USER_KEY);
  }
};

export const checkAuth = (): boolean => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem(AUTH_USER_KEY);
    return !!user;
  }
  return false;
};

export const getCurrentUser = (): Omit<Usuario, 'senha'> | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem(AUTH_USER_KEY);
    if (userStr) {
      return JSON.parse(userStr) as Omit<Usuario, 'senha'>;
    }
  }
  return null;
};
