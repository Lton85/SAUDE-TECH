import * as z from "zod";

export const PatientFormSchema = z.object({
  nome: z.string().min(3, { message: "O nome completo é obrigatório." }),
  mae: z.string().optional(),
  pai: z.string().optional(),
  cns: z.string().min(15, { message: "O CNS deve ter pelo menos 15 dígitos." }),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  nascimento: z.string().optional(),
  sexo: z.enum(['Masculino', 'Feminino', '']).optional(),
  estadoCivil: z.enum(['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável', '']).optional(),
  cep: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  email: z.string().email({ message: "Digite um e-mail válido." }).optional().or(z.literal('')),
  telefone: z.string().optional(),
  observacoes: z.string().optional(),
  situacao: z.boolean().default(true),
});
