
import * as z from "zod";

export const UsuarioFormSchema = z.object({
  nome: z.string().optional(),
  cpf: z.string().optional(),
  usuario: z.string().optional(),
  senha: z.string().optional(),
  confirmarSenha: z.string().optional(),
  situacao: z.boolean().default(true),
}).refine(data => {
    // A validação de senha só se aplica se uma senha for fornecida
    if(data.senha || data.confirmarSenha) {
        return data.senha === data.confirmarSenha;
    }
    return true;
}, {
    message: "As senhas não coincidem.",
    path: ["confirmarSenha"],
});


export type UsuarioFormValues = z.infer<typeof UsuarioFormSchema>;

    