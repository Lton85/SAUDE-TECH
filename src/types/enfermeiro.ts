export interface Enfermeiro {
    id: string;
    codigo: string;
    nome: string;
    coren: string;
    cns: string;
    sexo: 'Masculino' | 'Feminino' | '';
    especialidade: string;
    cpf: string;
    dataNascimento: string;
    telefone: string;
    turno: 'Manhã' | 'Tarde' | 'Noite' | '';
    situacao: 'Ativo' | 'Inativo';
    historico: {
        criadoEm: string;
        criadoPor: string;
        alteradoEm: string;
        alteradoPor: string;
    }
}
