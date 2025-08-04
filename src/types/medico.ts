export interface Medico {
    id: string;
    codigo: string;
    nome: string;
    crm: string;
    cns: string;
    sexo: 'Masculino' | 'Feminino';
    especialidade: string;
    cpf: string;
    dataNascimento: string;
    telefone: string;
    cargaHoraria: string;
    situacao: 'Ativo' | 'Inativo';
    historico: {
        criadoEm: string;
        criadoPor: string;
        alteradoEm: string;
        alteradoPor: string;
    }
}
