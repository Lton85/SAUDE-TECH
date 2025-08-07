
"use client";

import * as z from "zod";

const anexoSchema = z.object({
  name: z.string(),
  url: z.string(),
  type: z.string(),
});

export const UsuarioFormSchema = z.object({
  nome: z.string().min(3, "O nome é obrigatório."),
  cpf: z.string().optional(),
  usuario: z.string().min(3, "O nome de usuário é obrigatório."),
  senha: z.string().min(1, "A senha é obrigatória."),
  confirmarSenha: z.string(),
  situacao: z.boolean().default(true),
  anexos: z.array(anexoSchema).optional(),
}).refine(data => data.senha === data.confirmarSenha, {
  message: "As senhas não coincidem.",
  path: ["confirmarSenha"],
});

export type UsuarioFormValues = z.infer<typeof UsuarioFormSchema>;
