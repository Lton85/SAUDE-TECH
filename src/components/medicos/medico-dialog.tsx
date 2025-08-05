
"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Stethoscope, Pencil, Loader2 } from "lucide-react";
import type { Medico } from "@/types/medico";
import { MedicoForm } from "./medico-form";
import { addMedico, updateMedico } from "@/services/medicosService";
import { useToast } from "@/hooks/use-toast";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../ui/button";

const MedicoFormSchema = z.object({
  nome: z.string().min(3, { message: "O nome completo é obrigatório." }),
  cns: z.string().min(15, { message: "O CNS é obrigatório." }),
  crm: z.string().min(4, { message: "O CRM é obrigatório." }),
  especialidade: z.string().min(3, { message: "A especialidade é obrigatória." }),
  sexo: z.enum(['Masculino', 'Feminino', '']).optional(),
  cpf: z.string().optional(),
  dataNascimento: z.string().optional(),
  telefone: z.string().optional(),
  cargaHoraria: z.string().optional(),
  situacao: z.boolean().default(true),
});

export type MedicoFormValues = z.infer<typeof MedicoFormSchema>;


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
  
  const form = useForm<MedicoFormValues>({
    resolver: zodResolver(MedicoFormSchema),
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
    if (medico) {
      form.reset({
        nome: medico.nome || "",
        cns: medico.cns || "",
        crm: medico.crm || "",
        sexo: medico.sexo || undefined,
        especialidade: medico.especialidade || "",
        cpf: medico.cpf || "",
        dataNascimento: medico.dataNascimento || "",
        telefone: medico.telefone || "",
        cargaHoraria: medico.cargaHoraria || "",
        situacao: medico.situacao === 'Ativo',
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
  }, [medico, isOpen, form]);

  const handleSubmit = async (values: MedicoFormValues) => {
    setIsSubmitting(true);
    try {
      const medicoData = {
          ...values,
          situacao: values.situacao ? 'Ativo' : 'Inativo',
          sexo: values.sexo || "",
          cpf: values.cpf || "",
          dataNascimento: values.dataNascimento || "",
          telefone: values.telefone || "",
          cargaHoraria: values.cargaHoraria || "",
      };

      if (isEditMode && medico) {
        await updateMedico(medico.id, medicoData);
        toast({
          title: "Médico Atualizado!",
          description: `Os dados de ${values.nome} foram atualizados com sucesso.`,
          className: "bg-green-500 text-white"
        });
      } else {
        await addMedico(medicoData as Omit<Medico, 'id' | 'codigo' | 'historico'>);
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
        description: (error as Error).message || "Não foi possível salvar os dados do médico. Tente novamente.",
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
            {isEditMode ? "Editar Médico" : "Cadastrar Novo Médico"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? "Altere os dados abaixo para atualizar o cadastro do médico." : "Preencha os campos abaixo para adicionar um novo médico ao sistema."}
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <MedicoForm isEditMode={isEditMode}/>
                <DialogFooter className="mt-4 pt-4 border-t items-center">
                    <MedicoForm.SituacaoCheckbox isEditMode={isEditMode} />
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
