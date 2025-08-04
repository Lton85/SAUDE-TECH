export interface Departamento {
    id: string;
    codigo: string;
    nome: string;
    numero?: string;
    situacao: 'Ativo' | 'Inativo';
    historico: {
        criadoEm: string;
        criadoPor: string;
        alteradoEm: string;
        alteradoPor: string;
    }
}
