
"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { KeyRound, Pencil, Loader2 } from "lucide-react";
import type { Usuario } from "@/types/usuario";
import { UsuarioForm } from "./usuario-form";
import { addUsuario, updateUsuario } from "@/services/usuariosService";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UsuarioFormSchema, type UsuarioFormValues } from "./usuario-form-schema";
import { Button } from "../ui/button";
import { NotificationType } from "../ui/notification-dialog";

interface UsuarioDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
  usuario?: Usuario | null;
  onNotification: (notification: { type: NotificationType; title: string; message: string; }) => void;
}

export function UsuarioDialog({ isOpen, onOpenChange, onSuccess, usuario, onNotification }: UsuarioDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isEditMode = !!usuario;
  
  const form = useForm<UsuarioFormValues>({
    resolver: zodResolver(UsuarioFormSchema),
    defaultValues: {
      nome: "",
      cpf: "",
      usuario: "",
      senha: "",
      confirmarSenha: "",
      situacao: true,
    },
  });

  React.useEffect(() => {
    if (usuario && isOpen) {
      form.reset({
        nome: usuario.nome || "",
        cpf: usuario.cpf || "",
        usuario: usuario.usuario || "",
        senha: "", // Sempre limpar a senha
        confirmarSenha: "",
        situacao: usuario.situacao === 'Ativo',
      });
    } else if (!usuario && isOpen) {
        form.reset({
            nome: "",
            cpf: "",
            usuario: "",
            senha: "",
            confirmarSenha: "",
            situacao: true,
        });
    }
  }, [usuario, isOpen, form]);

  const handleSubmit = async (values: UsuarioFormValues) => {
    if (isEditMode && !values.senha && values.confirmarSenha) {
        form.setError("senha", { type: "manual", message: "A senha é obrigatória se a confirmação for preenchida." });
        return;
    }

    if (values.senha && values.senha.length > 0 && values.senha !== values.confirmarSenha) {
        form.setError("confirmarSenha", { type: "manual", message: "As senhas não coincidem." });
        return;
    }

    setIsSubmitting(true);
    try {
      const { confirmarSenha, ...rest } = values;
      const usuarioData: Partial<Usuario> = {
          ...rest,
          situacao: values.situacao ? 'Ativo' : 'Inativo',
          nome: values.nome || "",
          cpf: values.cpf || "",
          usuario: values.usuario || "",
      };
      
      // Remove a senha se não for fornecida no modo de edição
      if (isEditMode && (!values.senha || values.senha.length === 0)) {
          delete usuarioData.senha;
      } else if (!isEditMode && (!values.senha || values.senha.length === 0)) {
          form.setError("senha", { type: "manual", message: "A senha é obrigatória." });
          setIsSubmitting(false);
          return;
      }

      if (isEditMode && usuario) {
        await updateUsuario(usuario.id, usuarioData);
        onNotification({
          type: "success",
          title: "Usuário Atualizado!",
          message: `Os dados de ${values.nome} foram atualizados.`,
        });
      } else {
        await addUsuario(usuarioData as Omit<Usuario, 'id' | 'codigo' | 'historico'>);
        onNotification({
          type: "success",
          title: "Usuário Cadastrado!",
          message: `O usuário ${values.nome} foi adicionado com sucesso.`,
        });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      onNotification({
        type: "error",
        title: `Erro ao ${isEditMode ? 'atualizar' : 'cadastrar'}`,
        message: (error as Error).message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditMode ? <Pencil /> : <KeyRound />}
            {isEditMode ? "Editar Usuário" : "Novo Usuário"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? "Altere os dados para atualizar o cadastro." : "Preencha os campos para adicionar um novo usuário."}
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <UsuarioForm isEditMode={isEditMode}/>
                <DialogFooter className="mt-4 pt-4 border-t items-center">
                    <UsuarioForm.SituacaoCheckbox isEditMode={isEditMode} />
                    <div className="flex gap-2">
                         <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </DialogFooter>
            </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
