export interface Medico {
    id: string;
    codigo: string;
    nome: string;
    crm: string;
    cns: string;
    especialidade: string;
    cbo: string;
    cargaHoraria: string;
    situacao: 'Ativo' | 'Inativo';
}
