export interface Paciente {
    id: string;
    nome: string;
    mae: string;
    sexo: 'Masculino' | 'Feminino';
    idade: string;
    nascimento: string;
    cns: string;
    cpf: string;
    situacao: 'Ativo' | 'Inativo';
    estadoCivil?: 'Solteiro(a)' | 'Casado(a)' | 'Divorciado(a)' | 'Viúvo(a)' | 'União Estável';
    raca?: 'Branca' | 'Preta' | 'Parda' | 'Amarela' | 'Indígena' | 'Não declarada';
    historico: {
        criadoEm: string;
        criadoPor: string;
        alteradoEm: string;
        alteradoPor: string;
    }
}
