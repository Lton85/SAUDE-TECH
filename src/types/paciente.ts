export interface Paciente {
    id: string;
    codigo: string;
    nome: string;
    mae?: string;
    pai?: string;
    sexo?: 'Masculino' | 'Feminino' | '';
    idade: string;
    nascimento?: string;
    cns: string;
    cpf?: string;
    situacao: 'Ativo' | 'Inativo';
    estadoCivil?: 'Solteiro(a)' | 'Casado(a)' | 'Divorciado(a)' | 'Viúvo(a)' | 'União Estável' | '';
    cep?: string;
    endereco?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    email?: string;
    telefone?: string;
    observacoes?: string;
    historico: {
        criadoEm: string;
        criadoPor: string;
        alteradoEm: string;
        alteradoPor: string;
    }
}
