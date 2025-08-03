"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Stethoscope, Pencil } from "lucide-react";
import type { Medico } from "@/types/medico";
import { MedicoForm } from "./medico-form";
import { addMedico, updateMedico } from "@/services/medicosService";
import { useToast } from "@/hooks/use-toast";

interface MedicoDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
  medico?: Medico | null;
}

export function MedicoDialog({ isOpen, onOpenChange, onSuccess, medico }: MedicoDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const isEditMode = !!medico;

  const handleSubmit = async (values: Omit<Medico, 'id'>) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await updateMedico(medico.id, values);
        toast({
          title: "Médico Atualizado!",
          description: `Os dados de ${values.nome} foram atualizados com sucesso.`,
          className: "bg-green-500 text-white"
        });
      } else {
        await addMedico(values);
        toast({
          title: "Médico Cadastrado!",
          description: `O médico ${values.nome} foi adicionado com sucesso.`,
          className: "bg-green-500 text-white"
        });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: `Erro ao ${isEditMode ? 'atualizar' : 'cadastrar'} médico`,
        description: "Não foi possível salvar os dados do médico. Tente novamente.",
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
            {isEditMode ? <Pencil /> : <Stethoscope />}
            {isEditMode ? "Editar Médico" : "Cadastrar Novo Médico"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? "Altere os dados abaixo para atualizar o cadastro do médico." : "Preencha os campos abaixo para adicionar um novo médico ao sistema."}
          </DialogDescription>
        </DialogHeader>
        <MedicoForm
          onSubmit={handleSubmit}
          defaultValues={medico || {}}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
