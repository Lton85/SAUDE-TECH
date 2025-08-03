export interface Paciente {
    id: string;
    nome: string;
    mae: string;
    sexo: string;
    idade: string;
    nascimento: string;
    cns: string;
    cpf: string;
    situacao: 'Ativo' | 'Inativo';
    historico: {
        criadoEm: string;
        criadoPor: string;
        alteradoEm: string;
        alteradoPor: string;
    }
}
