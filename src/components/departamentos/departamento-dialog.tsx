"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PlusCircle, Pencil, Loader2 } from "lucide-react";
import type { Departamento } from "@/types/departamento";
import { DepartamentoForm } from "./departamento-form";
import { addDepartamento, updateDepartamento } from "@/services/departamentosService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";

interface DepartamentoDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
  departamento?: Departamento | null;
}

export function DepartamentoDialog({ isOpen, onOpenChange, onSuccess, departamento }: DepartamentoDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  const isEditMode = !!departamento;

  const handleSubmit = async (values: Omit<Departamento, 'id'>) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await updateDepartamento(departamento.id, values);
        toast({
          title: "Departamento Atualizado!",
          description: `Os dados de ${values.nome} foram atualizados.`,
          className: "bg-green-500 text-white"
        });
      } else {
        await addDepartamento(values);
        toast({
          title: "Departamento Cadastrado!",
          description: `${values.nome} foi adicionado com sucesso.`,
          className: "bg-green-500 text-white"
        });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: `Erro ao ${isEditMode ? 'atualizar' : 'cadastrar'}`,
        description: `Não foi possível salvar os dados. Tente novamente.`,
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
        <DepartamentoForm
          ref={formRef}
          onSubmit={handleSubmit}
          defaultValues={departamento || {}}
        />
         <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
            </Button>
            <Button type="submit" form="departamento-form" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
