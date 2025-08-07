
"use client";

import * as z from "zod";

export const UsuarioFormSchema = z.object({
  nome: z.string().min(3, "O nome é obrigatório."),
  cpf: z.string().optional(),
  usuario: z.string().min(3, "O nome de usuário é obrigatório."),
  senha: z.string().optional(),
  confirmarSenha: z.string().optional(),
  situacao: z.boolean().default(true),
}).refine(data => {
    if (data.senha || data.confirmarSenha) {
        return data.senha === data.confirmarSenha;
    }
    return true;
}, {
  message: "As senhas não coincidem.",
  path: ["confirmarSenha"],
}).refine(data => {
    if (!data.senha && data.confirmarSenha) {
        return false;
    }
    return true;
}, {
    message: "A senha é obrigatória se a confirmação for preenchida.",
    path: ["senha"],
});


export type UsuarioFormValues = z.infer<typeof UsuarioFormSchema>;
