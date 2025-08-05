"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UserPlus, Pencil, Loader2 } from "lucide-react";
import type { Enfermeiro } from "@/types/enfermeiro";
import { EnfermeiroForm, type EnfermeiroFormValues } from "./enfermeiro-form";
import { addEnfermeiro, updateEnfermeiro } from "@/services/enfermeirosService";
import { useToast } from "@/hooks/use-toast";

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
        <EnfermeiroForm
          onSubmit={handleSubmit}
          enfermeiro={enfermeiro}
          isSubmitting={isSubmitting}
          onCancel={() => onOpenChange(false)}
          isEditMode={isEditMode}
        />
      </DialogContent>
    </Dialog>
  );
}
