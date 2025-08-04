
"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UserPlus, Pencil, Loader2 } from "lucide-react";
import type { Paciente } from "@/types/paciente";
import { PatientForm } from "./patient-form";
import { addPaciente, updatePaciente } from "@/services/pacientesService";
import { useToast } from "@/hooks/use-toast";
import { parse } from "date-fns";

interface PatientDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
  paciente?: Paciente | null;
}

type PatientFormValues = Omit<Paciente, 'id' | 'idade' | 'situacao' | 'historico'  | 'codigo'>;


export function PatientDialog({ isOpen, onOpenChange, onSuccess, paciente }: PatientDialogProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const { toast } = useToast();
    const isEditMode = !!paciente;

    const handleSubmit = async (values: PatientFormValues) => {
        setIsSubmitting(true);
        try {
            let age = "";
            if (values.nascimento) {
                const birthDate = parse(values.nascimento, 'dd/MM/yyyy', new Date());
                age = `${new Date().getFullYear() - birthDate.getFullYear()}a`;
            }

            // Sanitize optional fields to be empty strings instead of undefined
            const patientData = {
                ...values,
                idade: age,
                mae: values.mae || "",
                pai: values.pai || "",
                nascimento: values.nascimento || "",
                sexo: values.sexo || "",
                cpf: values.cpf || "",
                estadoCivil: values.estadoCivil || "",
                cep: values.cep || "",
                endereco: values.endereco || "",
                numero: values.numero || "",
                bairro: values.bairro || "",
                cidade: values.cidade || "",
                uf: values.uf || "",
                email: values.email || "",
                telefone: values.telefone || "",
                observacoes: values.observacoes || "",
            };

            if (isEditMode && paciente) {
                await updatePaciente(paciente.id, patientData);
                toast({
                    title: "Paciente Atualizado!",
                    description: `Os dados de ${values.nome} foram atualizados.`,
                    className: "bg-green-500 text-white"
                });
            } else {
                 const newPatient: Omit<Paciente, 'id' | 'codigo' | 'historico'> = {
                    ...patientData,
                    situacao: 'Ativo',
                };
                await addPaciente(newPatient);
                toast({
                    title: "Paciente Cadastrado!",
                    description: `O paciente ${values.nome} foi adicionado com sucesso.`,
                    className: "bg-green-500 text-white"
                });
            }
            
            onSuccess();
            onOpenChange(false);
        } catch (error) {
             toast({
                title: "Erro ao salvar paciente",
                description: (error as Error).message || "Não foi possível salvar os dados. Verifique e tente novamente.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }
  
    const defaultValues = React.useMemo(() => {
        if (isEditMode && paciente) {
            return {
                ...paciente,
            };
        }
        return {
            pai: '',
            cep: '',
            endereco: '',
            numero: '',
            bairro: '',
            cidade: '',
            uf: '',
            email: '',
            telefone: '',
            observacoes: '',
        };
    }, [paciente, isEditMode]);


  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!isSubmitting) onOpenChange(open) }}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditMode ? <Pencil /> : <UserPlus />}
            {isEditMode ? "Editar Paciente" : "Cadastrar Novo Paciente"}
          </DialogTitle>
           <DialogDescription>
            {isEditMode ? `Altere os dados de ${paciente?.nome}.` : "Preencha os campos abaixo para adicionar um novo paciente."}
          </DialogDescription>
        </DialogHeader>
        
        <PatientForm
          onSubmit={handleSubmit}
          defaultValues={defaultValues}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
