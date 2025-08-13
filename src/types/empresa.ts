
export interface Classificacao {
    id: string; // Ex: "Normal", "Preferencial", "custom_123"
    nome: string; // Ex: "Atendimento Normal", "Preferencial", "Guichê 1"
    nomeAtivo?: boolean;
    descricao?: string; // Ex: "Para consultas de rotina", "Gestantes, Idosos, Cadeirantes"
    descricaoAtiva?: boolean;
    ativa: boolean; // Será derivado de nomeAtivo ou descricaoAtiva
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
    tabletInfoSize?: 'pequeno' | 'medio' | 'grande';
    tabletCardSize?: 'pequeno' | 'medio' | 'grande';
    exibirUltimasSenhas?: boolean;
    localChamadaTriagem?: string;
    exibirLocalChamadaTriagem?: boolean;
}
