
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
  onSuccess: (paciente: Paciente) => void;
  paciente?: Paciente | null;
}

type PatientFormValues = Omit<Paciente, 'id' | 'idade' | 'historico'  | 'codigo' | 'situacao'> & { situacao: boolean };


export function PatientDialog({ isOpen, onOpenChange, onSuccess, paciente }: PatientDialogProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const { toast } = useToast();
    const isEditMode = !!paciente;

    const handleSubmit = async (values: PatientFormValues) => {
        setIsSubmitting(true);
        try {
            let age = "";
            if (values.nascimento) {
                try {
                    const birthDate = parse(values.nascimento, 'dd/MM/yyyy', new Date());
                    if(!isNaN(birthDate.getTime())) {
                        age = `${new Date().getFullYear() - birthDate.getFullYear()}a`;
                    }
                } catch(e) { /* ignore parse error */ }
            }
            
            const situacao = values.situacao ? 'Ativo' : 'Inativo';

            // Sanitize optional fields to be empty strings instead of undefined
            const patientData = {
                ...values,
                idade: age,
                situacao,
                mae: values.mae || "",
                pai: values.pai || "",
                nascimento: values.nascimento || "",
                sexo: values.sexo || "",
                cpf: values.cpf || "",
                rg: values.rg || "",
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
                onSuccess({ ...paciente, ...patientData });
            } else {
                 const newPatient: Omit<Paciente, 'id' | 'codigo' | 'historico'> = {
                    ...patientData,
                    situacao: 'Ativo',
                };
                const newPatientId = await addPaciente(newPatient);
                toast({
                    title: "Paciente Cadastrado!",
                    description: `O paciente ${values.nome} foi adicionado com sucesso.`,
                    className: "bg-green-500 text-white"
                });
                 onSuccess({ ...newPatient, id: newPatientId, codigo: "", historico: {} as any }); // Pass back the new patient
            }
            
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
                situacao: paciente.situacao === 'Ativo',
            };
        }
        return {
            id: undefined, // ensure id is undefined for new patient
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
            rg: '',
            situacao: true,
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
          isEditMode={isEditMode}
        />
      </DialogContent>
    </Dialog>
  );
}
