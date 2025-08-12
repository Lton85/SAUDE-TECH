
export interface Classificacao {
    id: string; // Ex: "Normal", "Preferencial", "custom_123"
    nome: string; // Ex: "Atendimento Normal", "Preferencial", "Guichê 1"
    descricao?: string; // Ex: "Para consultas de rotina", "Gestantes, Idosos, Cadeirantes"
    ativa: boolean;
    editavel: boolean; // Para impedir a exclusão dos 4 padrões
}

export interface Empresa {
    id: string;
    codigoCliente: string;
    razaoSocial: string;
    nomeFantasia: string;
    cnpj: string;
    cep: string;
    endereco: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;
    telefone: string;
    email: string;
    nomeImpressora?: string;
    classificacoes?: Classificacao[];
    // Deprecated, use `classificacoes` instead
    classificacoesAtendimento?: string[];
    // Deprecated, use `classificacoes` instead
    nomesClassificacoes?: {
        Normal: string;
        Preferencial: string;
        Urgencia: string;
        Outros: string;
        [key: string]: string; // Para classificações customizadas
    };
    tabletInfoSize?: 'pequeno' | 'medio' | 'grande';
    tabletCardSize?: 'pequeno' | 'medio' | 'grande';
    exibirUltimasSenhas?: boolean;
    localChamadaTriagem?: string;
    exibirLocalChamadaTriagem?: boolean;
}
