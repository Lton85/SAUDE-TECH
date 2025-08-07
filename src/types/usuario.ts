
export interface Usuario {
    id: string;
    codigo: string;
    nome: string;
    cpf: string;
    usuario: string;
    senha?: string; // Senha deve ser opcional no retorno do DB
    situacao: 'Ativo' | 'Inativo';
    permissoes?: string[]; // Array de IDs de menu permitidos
    historico: {
        criadoEm: string;
        criadoPor: string;
        alteradoEm: string;
        alteradoPor: string;
    }
}
