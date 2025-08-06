
"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { UserPlus, Pencil, Loader2 } from "lucide-react";
import type { Enfermeiro } from "@/types/enfermeiro";
import { EnfermeiroForm } from "./enfermeiro-form";
import { addEnfermeiro, updateEnfermeiro } from "@/services/enfermeirosService";
import { useToast } from "@/hooks/use-toast";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../ui/button";

const EnfermeiroFormSchema = z.object({
  nome: z.string().min(3, { message: "O nome completo é obrigatório." }),
  cns: z.string().min(15, { message: "O CNS é obrigatório." }),
  coren: z.string().min(4, { message: "O COREN é obrigatório." }),
  especialidade: z.string().min(3, { message: "A especialidade é obrigatória." }),
  sexo: z.enum(['Masculino', 'Feminino', '']).optional(),
  cpf: z.string().optional(),
  dataNascimento: z.string().optional(),
  telefone: z.string().optional(),
  turno: z.enum(['Manhã', 'Tarde', 'Noite', '']).optional(),
  situacao: z.boolean().default(true),
  cnpj: z.string().optional(), // Added to match other forms, though not used here
});

export type EnfermeiroFormValues = z.infer<typeof EnfermeiroFormSchema>;


interface EnfermeiroDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
  enfermeiro?: Enfermeiro | null;
}

export function EnfermeiroDialog({ isOpen, onOpenChange, onSuccess, enfermeiro }: EnfermeiroDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const isEditMode = !!enfermeiro;

  const form = useForm<EnfermeiroFormValues>({
    resolver: zodResolver(EnfermeiroFormSchema),
    defaultValues: {
      nome: "",
      cns: "",
      coren: "",
      especialidade: "",
      sexo: undefined,
      cpf: "",
      dataNascimento: "",
      telefone: "",
      turno: "Manhã",
      situacao: true,
    },
  });

  React.useEffect(() => {
    if (enfermeiro) {
      form.reset({
        nome: enfermeiro.nome || "",
        cns: enfermeiro.cns || "",
        coren: enfermeiro.coren || "",
        especialidade: enfermeiro.especialidade || "",
        sexo: enfermeiro.sexo || undefined,
        cpf: enfermeiro.cpf || "",
        dataNascimento: enfermeiro.dataNascimento || "",
        telefone: enfermeiro.telefone || "",
        turno: enfermeiro.turno || "Manhã",
        situacao: enfermeiro.situacao === 'Ativo',
      });
    } else {
        form.reset({
            nome: "",
            cns: "",
            coren: "",
            especialidade: "",
            sexo: undefined,
            cpf: "",
            dataNascimento: "",
            telefone: "",
            turno: "Manhã",
            situacao: true,
        });
    }
  }, [enfermeiro, isOpen, form]);

  const handleSubmit = async (values: EnfermeiroFormValues) => {
    setIsSubmitting(true);
    try {
      const enfermeiroData = {
          ...values,
          situacao: values.situacao ? 'Ativo' : 'Inativo',
          sexo: values.sexo || "",
          cpf: values.cpf || "",
          dataNascimento: values.dataNascimento || "",
          telefone: values.telefone || "",
          turno: values.turno || "",
      };

      if (isEditMode && enfermeiro) {
        await updateEnfermeiro(enfermeiro.id, enfermeiroData);
        toast({
          title: "Enfermeiro(a) Atualizado(a)!",
          description: `Os dados de ${values.nome} foram atualizados.`,
          className: "bg-green-500 text-white"
        });
      } else {
        await addEnfermeiro(enfermeiroData as Omit<Enfermeiro, 'id' | 'codigo' | 'historico'>);
        toast({
          title: "Enfermeiro(a) Cadastrado(a)!",
          description: `${values.nome} foi adicionado(a) com sucesso.`,
          className: "bg-green-500 text-white"
        });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: `Erro ao ${isEditMode ? 'atualizar' : 'cadastrar'}`,
        description: (error as Error).message || `Não foi possível salvar os dados. Tente novamente.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditMode ? <Pencil /> : <UserPlus />}
            {isEditMode ? "Editar Enfermeiro(a)" : "Novo Enfermeiro(a)"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? "Altere os dados abaixo para atualizar o cadastro." : "Preencha os campos abaixo para adicionar um(a) novo(a) enfermeiro(a)."}
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <EnfermeiroForm isEditMode={isEditMode} />
                <DialogFooter className="mt-4 pt-4 border-t items-center">
                    <EnfermeiroForm.SituacaoCheckbox isEditMode={isEditMode} />
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
