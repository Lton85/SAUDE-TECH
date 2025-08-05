"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PlusCircle, Pencil, Loader2 } from "lucide-react";
import type { Departamento } from "@/types/departamento";
import { DepartamentoForm } from "./departamento-form";
import { addDepartamento, updateDepartamento } from "@/services/departamentosService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const DepartamentoFormSchema = z.object({
  nome: z.string().min(3, { message: "O nome é obrigatório." }),
  numero: z.string().optional(),
  situacao: z.boolean().default(true),
});

export type DepartamentoFormValues = z.infer<typeof DepartamentoFormSchema>;

interface DepartamentoDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
  departamento?: Departamento | null;
}

export function DepartamentoDialog({ isOpen, onOpenChange, onSuccess, departamento }: DepartamentoDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const isEditMode = !!departamento;

  const form = useForm<DepartamentoFormValues>({
    resolver: zodResolver(DepartamentoFormSchema),
    defaultValues: {
      nome: "",
      numero: "",
      situacao: true,
    },
  });

  React.useEffect(() => {
    if (departamento) {
      form.reset({
        nome: departamento.nome || "",
        numero: departamento.numero || "",
        situacao: departamento.situacao === 'Ativo',
      });
    } else {
        form.reset({
            nome: "",
            numero: "",
            situacao: true,
        });
    }
  }, [departamento, isOpen, form]);

  const handleSubmit = async (values: DepartamentoFormValues) => {
    setIsSubmitting(true);
    try {
       const departamentoData = {
        nome: values.nome,
        numero: values.numero || "",
        situacao: values.situacao ? 'Ativo' : 'Inativo',
      };

      if (isEditMode && departamento) {
        await updateDepartamento(departamento.id, departamentoData);
        toast({
          title: "Departamento Atualizado!",
          description: `Os dados de ${values.nome} foram atualizados.`,
          className: "bg-green-500 text-white"
        });
      } else {
        await addDepartamento(departamentoData as Omit<Departamento, 'id' | 'codigo' | 'historico'>);
        toast({
          title: "Departamento Cadastrado!",
          description: `${values.nome} foi adicionado com sucesso.`,
          className: "bg-green-500 text-white"
        });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar departamento:", error);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditMode ? <Pencil /> : <PlusCircle />}
            {isEditMode ? "Editar Departamento" : "Novo Departamento"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? "Altere os dados abaixo para atualizar o cadastro." : "Preencha os campos abaixo para adicionar um novo departamento."}
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <DepartamentoForm />
                <DialogFooter className="mt-4 pt-4 border-t items-center">
                    <DepartamentoForm.SituacaoCheckbox isEditMode={isEditMode} />
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
