
"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Stethoscope, Pencil, Loader2 } from "lucide-react";
import type { Profissional } from "@/types/profissional";
import { ProfissionalForm } from "./profissional-form";
import { addProfissional, updateProfissional } from "@/services/profissionaisService";
import { useToast } from "@/hooks/use-toast";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../ui/button";

const ProfissionalFormSchema = z.object({
  nome: z.string().min(3, { message: "O nome completo é obrigatório." }),
  cns: z.string().min(15, { message: "O CNS é obrigatório." }),
  crm: z.string().min(4, { message: "O Conselho é obrigatório." }),
  especialidade: z.string().min(3, { message: "A especialidade é obrigatória." }),
  sexo: z.enum(['Masculino', 'Feminino', '']).optional(),
  cpf: z.string().optional(),
  dataNascimento: z.string().optional(),
  telefone: z.string().optional(),
  cargaHoraria: z.string().optional(),
  situacao: z.boolean().default(true),
});

export type ProfissionalFormValues = z.infer<typeof ProfissionalFormSchema>;


interface ProfissionalDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
  profissional?: Profissional | null;
}

export function ProfissionalDialog({ isOpen, onOpenChange, onSuccess, profissional }: ProfissionalDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const isEditMode = !!profissional;
  
  const form = useForm<ProfissionalFormValues>({
    resolver: zodResolver(ProfissionalFormSchema),
    defaultValues: {
      nome: "",
      cns: "",
      crm: "",
      sexo: undefined,
      especialidade: "",
      cpf: "",
      dataNascimento: "",
      telefone: "",
      cargaHoraria: "",
      situacao: true,
    },
  });

  React.useEffect(() => {
    if (profissional) {
      form.reset({
        nome: profissional.nome || "",
        cns: profissional.cns || "",
        crm: profissional.crm || "",
        sexo: profissional.sexo || undefined,
        especialidade: profissional.especialidade || "",
        cpf: profissional.cpf || "",
        dataNascimento: profissional.dataNascimento || "",
        telefone: profissional.telefone || "",
        cargaHoraria: profissional.cargaHoraria || "",
        situacao: profissional.situacao === 'Ativo',
      });
    } else {
        form.reset({
            nome: "",
            cns: "",
            crm: "",
            sexo: undefined,
            especialidade: "",
            cpf: "",
            dataNascimento: "",
            telefone: "",
            cargaHoraria: "",
            situacao: true,
        });
    }
  }, [profissional, isOpen, form]);

  const handleSubmit = async (values: ProfissionalFormValues) => {
    setIsSubmitting(true);
    try {
      const profissionalData = {
          ...values,
          situacao: values.situacao ? 'Ativo' : 'Inativo',
          sexo: values.sexo || "",
          cpf: values.cpf || "",
          dataNascimento: values.dataNascimento || "",
          telefone: values.telefone || "",
          cargaHoraria: values.cargaHoraria || "",
      };

      if (isEditMode && profissional) {
        await updateProfissional(profissional.id, profissionalData);
        toast({
          title: "Profissional Atualizado!",
          description: `Os dados de ${values.nome} foram atualizados com sucesso.`,
          className: "bg-green-500 text-white"
        });
      } else {
        await addProfissional(profissionalData as Omit<Profissional, 'id' | 'codigo' | 'historico'>);
        toast({
          title: "Profissional Cadastrado!",
          description: `O profissional ${values.nome} foi adicionado com sucesso.`,
          className: "bg-green-500 text-white"
        });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: `Erro ao ${isEditMode ? 'atualizar' : 'cadastrar'} profissional`,
        description: (error as Error).message || "Não foi possível salvar os dados do profissional. Tente novamente.",
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
            {isEditMode ? <Pencil /> : <Stethoscope />}
            {isEditMode ? "Editar Profissional" : "Cadastrar Novo Profissional"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? "Altere os dados abaixo para atualizar o cadastro do profissional." : "Preencha os campos abaixo para adicionar um novo profissional ao sistema."}
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <ProfissionalForm isEditMode={isEditMode}/>
                <DialogFooter className="mt-4 pt-4 border-t items-center">
                    <ProfissionalForm.SituacaoCheckbox isEditMode={isEditMode} />
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
