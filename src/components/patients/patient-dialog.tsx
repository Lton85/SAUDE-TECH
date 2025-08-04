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

type PatientFormValues = Omit<Paciente, 'id' | 'idade' | 'situacao' | 'historico' | 'pai' | 'cep' | 'numero' | 'nacionalidade' | 'email' | 'telefone' | 'observacoes' | 'endereco' | 'codigo' | 'bairro' | 'cidade' | 'uf'> & {
    pai?: string;
    cep?: string;
    endereco: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    nacionalidade?: string;
    email?: string;
    telefone?: string;
    observacoes?: string;
};


export function PatientDialog({ isOpen, onOpenChange, onSuccess, paciente }: PatientDialogProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const { toast } = useToast();
    const isEditMode = !!paciente;

    const handleSubmit = async (values: PatientFormValues) => {
        setIsSubmitting(true);
        try {
            const birthDate = parse(values.nascimento, 'dd/MM/yyyy', new Date());
            const age = new Date().getFullYear() - birthDate.getFullYear();

            const patientData = {
                ...values,
                endereco: `${values.endereco}, ${values.numero}, ${values.bairro}, ${values.cidade} - ${values.uf}, CEP: ${values.cep}`,
            };

            if (isEditMode) {
                 const updatedPatient: Partial<Paciente> = {
                    ...patientData,
                    idade: `${age}a`,
                    historico: {
                        ...paciente.historico,
                        alteradoEm: new Date().toISOString(),
                        alteradoPor: 'Recepção (Edição)',
                    }
                };
                await updatePaciente(paciente.id, updatedPatient);
                toast({
                    title: "Paciente Atualizado!",
                    description: `Os dados de ${values.nome} foram atualizados.`,
                    className: "bg-green-500 text-white"
                });
            } else {
                 const newPatient: Omit<Paciente, 'id' | 'codigo'> = {
                    ...patientData,
                    idade: `${age}a`,
                    situacao: 'Ativo',
                    historico: {
                        criadoEm: new Date().toISOString(),
                        criadoPor: 'Recepção',
                        alteradoEm: new Date().toISOString(),
                        alteradoPor: 'Recepção',
                    }
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
                description: "Não foi possível salvar os dados. Verifique e tente novamente.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }
  
    const getAddressParts = (fullAddress: string | undefined) => {
        if (!fullAddress) return { endereco: '', numero: '', bairro: '', cidade: '', uf: '', cep: '' };

        const cepRegex = /CEP:\s*([\d-]+)/;
        const ufRegex = /-\s*([A-Z]{2}),/;
        
        const cepMatch = fullAddress.match(cepRegex);
        const ufMatch = fullAddress.match(ufRegex);

        const cep = cepMatch ? cepMatch[1] : '';
        const uf = ufMatch ? ufMatch[1] : '';

        const addressWithoutCep = fullAddress.replace(cepRegex, '').trim().replace(/,$/, '');
        const addressWithoutUf = addressWithoutCep.replace(ufRegex, '').trim();

        const parts = addressWithoutUf.split(',').map(part => part.trim());

        return {
            endereco: parts[0] || '',
            numero: parts[1] || '',
            bairro: parts[2] || '',
            cidade: parts[3] || '',
            uf: uf,
            cep: cep,
        };
    };

    const defaultValues = React.useMemo(() => {
        if (isEditMode && paciente) {
            return {
                ...paciente,
                ...getAddressParts(paciente.endereco),
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
            nacionalidade: '',
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
