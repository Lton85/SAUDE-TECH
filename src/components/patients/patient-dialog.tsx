
"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { UserPlus, Pencil, Loader2 } from "lucide-react";
import type { Paciente } from "@/types/paciente";
import { PatientForm } from "./patient-form";
import { addPaciente, updatePaciente } from "@/services/pacientesService";
import { parse } from "date-fns";
import { Button } from "../ui/button";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PatientFormSchema } from "./patient-form-schema";
import { NotificationType } from "../ui/notification-dialog";

interface PatientDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: (paciente: Paciente) => void;
  paciente?: Paciente | null;
  onNotification: (notification: { type: NotificationType; title: string; message: string; }) => void;
}

export type PatientFormValues = z.infer<typeof PatientFormSchema>;

export function PatientDialog({ isOpen, onOpenChange, onSuccess, paciente, onNotification }: PatientDialogProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const isEditMode = !!paciente;

    const form = useForm<PatientFormValues>({
        resolver: zodResolver(PatientFormSchema),
        defaultValues: {
            nome: "",
            mae: "",
            pai: "",
            cns: "",
            cpf: "",
            rg: "",
            nascimento: "",
            sexo: undefined,
            estadoCivil: undefined,
            cep: "",
            endereco: "",
            numero: "",
            bairro: "",
            cidade: "",
            uf: "",
            email: "",
            telefone: "",
            observacoes: "",
            situacao: true,
        },
    });

    React.useEffect(() => {
        if (paciente) {
            form.reset({
                ...paciente,
                situacao: paciente.situacao === 'Ativo',
            });
        } else {
            form.reset({
                nome: "",
                mae: "",
                pai: "",
                cns: "",
                cpf: "",
                rg: "",
                nascimento: "",
                sexo: undefined,
                estadoCivil: undefined,
                cep: "",
                endereco: "",
                numero: "",
                bairro: "",
                cidade: "",
                uf: "",
                email: "",
                telefone: "",
                observacoes: "",
                situacao: true,
            });
        }
    }, [paciente, form, isOpen]);

    React.useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === ' ') {
                event.preventDefault(); 
                onOpenChange(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onOpenChange]);


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
                onNotification({
                    type: "success",
                    title: "Paciente Atualizado!",
                    message: `Os dados de ${values.nome} foram atualizados.`,
                });
                onSuccess({ ...paciente, ...patientData });
            } else {
                 const newPatient: Omit<Paciente, 'id' | 'codigo' | 'historico'> = {
                    ...patientData,
                    situacao: 'Ativo',
                };
                const newPatientId = await addPaciente(newPatient);
                onNotification({
                    type: "success",
                    title: "Paciente Cadastrado!",
                    message: `O paciente ${values.nome} foi adicionado com sucesso.`,
                });
                 onSuccess({ ...newPatient, id: newPatientId, codigo: "", historico: {} as any }); // Pass back the new patient
            }
            
            onOpenChange(false);
        } catch (error) {
             onNotification({
                type: "error",
                title: "Erro ao salvar paciente",
                message: (error as Error).message || "Não foi possível salvar os dados. Verifique e tente novamente.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!isSubmitting) onOpenChange(open) }}>
      <DialogContent className="sm:max-w-4xl" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditMode ? <Pencil /> : <UserPlus />}
            {isEditMode ? "Editar Paciente" : "Cadastrar Novo Paciente"}
          </DialogTitle>
           <DialogDescription>
            {isEditMode ? `Altere os dados de ${paciente?.nome}.` : "Preencha os campos abaixo para adicionar um novo paciente."}
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <PatientForm isEditMode={isEditMode} />
                 <DialogFooter className="mt-4 pt-4 border-t items-center">
                    <PatientForm.SituacaoCheckbox isEditMode={isEditMode} />
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} type="button">
                          Cancelar
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {isSubmitting ? "Salvando..." : "Salvar Paciente"}
                      </Button>
                    </div>
                </DialogFooter>
            </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
