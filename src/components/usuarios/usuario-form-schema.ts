
import * as z from "zod";

export const UsuarioFormSchema = z.object({
  nome: z.string().min(3, { message: "O nome é obrigatório." }),
  cpf: z.string().min(11, { message: "O CPF deve ter 11 dígitos." }),
  usuario: z.string().min(3, { message: "O usuário é obrigatório." }),
  senha: z.string().optional(),
  confirmarSenha: z.string().optional(),
  situacao: z.boolean().default(true),
}).refine(data => {
    if(data.senha || data.confirmarSenha) {
        return data.senha === data.confirmarSenha;
    }
    return true;
}, {
    message: "As senhas não coincidem.",
    path: ["confirmarSenha"],
}).refine(data => {
    // Se a senha estiver presente, ela deve ter pelo menos 6 caracteres
    if(data.senha) {
        return data.senha.length >= 6;
    }
    return true;
}, {
    message: "A senha deve ter no mínimo 6 caracteres.",
    path: ["senha"],
});


export type UsuarioFormValues = z.infer<typeof UsuarioFormSchema>;
