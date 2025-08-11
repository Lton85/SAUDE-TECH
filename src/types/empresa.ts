
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
    classificacoesAtendimento?: string[];
    tabletInfoSize?: 'pequeno' | 'medio' | 'grande';
    tabletCardSize?: 'pequeno' | 'medio' | 'grande';
}
