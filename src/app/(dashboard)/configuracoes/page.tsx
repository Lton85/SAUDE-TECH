
"use client";

import { useState, useEffect } from "react";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Settings, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { resetCounterByName } from "@/services/countersService";
import { clearAllHistoricoAtendimentos } from "@/services/filaDeEsperaService";
import { ResetSenhaDialog } from "@/components/configuracoes/reset-senha-dialog";
import { ResetProntuarioDialog } from "@/components/configuracoes/reset-prontuario-dialog";
import { ResetPacienteDialog } from "@/components/configuracoes/reset-paciente-dialog";
import { getPacientes } from "@/services/pacientesService";
import { getMedicos } from "@/services/medicosService";
import { getEnfermeiros } from "@/services/enfermeirosService";
import { ResetMedicoDialog } from "@/components/configuracoes/reset-medico-dialog";
import { ResetEnfermeiroDialog } from "@/components/configuracoes/reset-enfermeiro-dialog";
import { Separator } from "@/components/ui/separator";


export default function ConfiguracoesPage() {
    const { toast } = useToast();
    const [isNormalResetting, setIsNormalResetting] = useState(false);
    const [isEmergenciaResetting, setIsEmergenciaResetting] = useState(false);
    const [isProntuarioResetting, setIsProntuarioResetting] = useState(false);
    const [isPacienteResetting, setIsPacienteResetting] = useState(false);
    const [isMedicoResetting, setIsMedicoResetting] = useState(false);
    const [isEnfermeiroResetting, setIsEnfermeiroResetting] = useState(false);

    const [senhaDialogOpen, setSenhaDialogOpen] = useState(false);
    const [prontuarioDialogOpen, setProntuarioDialogOpen] = useState(false);
    const [pacienteDialogOpen, setPacienteDialogOpen] = useState(false);
    const [medicoDialogOpen, setMedicoDialogOpen] = useState(false);
    const [enfermeiroDialogOpen, setEnfermeiroDialogOpen] = useState(false);
    
    const [resetType, setResetType] = useState<'Normal' | 'Emergência' | null>(null);
    
    const [pacientesCount, setPacientesCount] = useState<number | null>(null);
    const [medicosCount, setMedicosCount] = useState<number | null>(null);
    const [enfermeirosCount, setEnfermeirosCount] = useState<number | null>(null);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const [pacientes, medicos, enfermeiros] = await Promise.all([
                    getPacientes(),
                    getMedicos(),
                    getEnfermeiros(),
                ]);
                setPacientesCount(pacientes.length);
                setMedicosCount(medicos.length);
                setEnfermeirosCount(enfermeiros.length);
            } catch (error) {
                toast({
                    title: "Erro ao verificar cadastros",
                    description: "Não foi possível verificar a quantidade de registros.",
                    variant: "destructive"
                });
            }
        };
        fetchCounts();
    }, [toast]);

    const handleResetRequest = (type: 'Normal' | 'Emergência') => {
        setResetType(type);
        setSenhaDialogOpen(true);
    };
    
    const handleProntuarioResetRequest = () => {
        setProntuarioDialogOpen(true);
    };

    const handlePacienteResetRequest = () => {
        if (pacientesCount !== null && pacientesCount > 0) {
            toast({
                title: "Ação Bloqueada",
                description: `Existem ${pacientesCount} paciente(s) cadastrado(s). É necessário excluir todos antes de zerar os códigos.`,
                variant: "destructive",
            });
            return;
        }
        setPacienteDialogOpen(true);
    };

    const handleMedicoResetRequest = () => {
        if (medicosCount !== null && medicosCount > 0) {
            toast({
                title: "Ação Bloqueada",
                description: `Existem ${medicosCount} médico(s) cadastrado(s). É necessário excluir todos antes de zerar os códigos.`,
                variant: "destructive",
            });
            return;
        }
        setMedicoDialogOpen(true);
    };

    const handleEnfermeiroResetRequest = () => {
        if (enfermeirosCount !== null && enfermeirosCount > 0) {
            toast({
                title: "Ação Bloqueada",
                description: `Existem ${enfermeirosCount} enfermeiro(s) cadastrado(s). É necessário excluir todos antes de zerar os códigos.`,
                variant: "destructive",
            });
            return;
        }
        setEnfermeiroDialogOpen(true);
    };

    const handleConfirmSenhaReset = async () => {
        if (!resetType) return;

        const isNormal = resetType === 'Normal';
        const setLoading = isNormal ? setIsNormalResetting : setIsEmergenciaResetting;
        const counterName = isNormal ? 'senha_normal' : 'senha_emergencia';
        const ticketExample = isNormal ? 'N-001' : 'E-001';

        setLoading(true);
        setSenhaDialogOpen(false);

        try {
            await resetCounterByName(counterName);
            toast({
                title: `Senhas de Classificação ${resetType} Reiniciadas!`,
                description: `A contagem de senhas foi redefinida para ${ticketExample}.`,
                className: "bg-green-500 text-white",
            });
        } catch (error) {
            toast({
                title: "Erro ao reiniciar senhas",
                description: (error as Error).message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
            setResetType(null);
        }
    };
    
    const handleConfirmProntuarioReset = async () => {
        setIsProntuarioResetting(true);
        setProntuarioDialogOpen(false);

        try {
            const count = await clearAllHistoricoAtendimentos();
            toast({
                title: "Prontuários Zerados!",
                description: `${count} registros de atendimentos finalizados foram excluídos.`,
                className: "bg-green-500 text-white",
            });
        } catch (error) {
             toast({
                title: "Erro ao zerar prontuários",
                description: (error as Error).message,
                variant: "destructive",
            });
        } finally {
            setIsProntuarioResetting(false);
        }
    };

    const handleConfirmPacienteReset = async () => {
        setIsPacienteResetting(true);
        setPacienteDialogOpen(false);

        try {
            await resetCounterByName('pacientes_v2');
            toast({
                title: "Códigos de Paciente Zerados!",
                description: "A contagem de códigos de cadastro de paciente foi reiniciada para 001.",
                className: "bg-green-500 text-white",
            });
        } catch (error) {
            toast({
                title: "Erro ao zerar códigos de paciente",
                description: (error as Error).message,
                variant: "destructive",
            });
        } finally {
            setIsPacienteResetting(false);
        }
    };
    
    const handleConfirmMedicoReset = async () => {
        setIsMedicoResetting(true);
        setMedicoDialogOpen(false);
        try {
            await resetCounterByName('medicos_v2');
            toast({
                title: "Códigos de Médico Zerados!",
                description: "A contagem de códigos de cadastro de médico foi reiniciada para 001.",
                className: "bg-green-500 text-white",
            });
        } catch (error) {
            toast({
                title: "Erro ao zerar códigos de médico",
                description: (error as Error).message,
                variant: "destructive",
            });
        } finally {
            setIsMedicoResetting(false);
        }
    };
    
    const handleConfirmEnfermeiroReset = async () => {
        setIsEnfermeiroResetting(true);
        setEnfermeiroDialogOpen(false);
        try {
            await resetCounterByName('enfermeiros_v1');
            toast({
                title: "Códigos de Enfermeiro Zerados!",
                description: "A contagem de códigos de cadastro de enfermeiro foi reiniciada para 001.",
                className: "bg-green-500 text-white",
            });
        } catch (error) {
            toast({
                title: "Erro ao zerar códigos de enfermeiro",
                description: (error as Error).message,
                variant: "destructive",
            });
        } finally {
            setIsEnfermeiroResetting(false);
        }
    };

    const ActionRow = ({ label, buttonText, onClick, isResetting, disabled, icon: Icon, title }: {
        label: string;
        buttonText: string;
        onClick: () => void;
        isResetting: boolean;
        disabled?: boolean;
        icon: React.ElementType;
        title?: string;
    }) => (
        <div className="flex items-center justify-between border-b py-4">
            <p className="font-medium text-sm text-gray-700">{label}</p>
            <Button 
                onClick={onClick}
                variant="destructive" 
                size="sm"
                className="h-8"
                disabled={isResetting || disabled}
                title={title}
            >
                <Icon className={`mr-2 h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
                {isResetting ? 'Zerando...' : buttonText}
            </Button>
        </div>
    );

  return (
    <>
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
            <Settings className="h-6 w-6" />
            <CardTitle>Configurações do Sistema</CardTitle>
        </div>
        <CardDescription>
          Ajuste as configurações gerais e perigosas do sistema nesta área.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm font-medium text-muted-foreground pb-2">Parâmetro</div>
        <div className="space-y-0">
            <ActionRow
                label="Zerar Senha de Classificação Normal"
                buttonText="Zerar (N-001)"
                onClick={() => handleResetRequest('Normal')}
                isResetting={isNormalResetting}
                icon={RefreshCw}
            />
            <ActionRow
                label="Zerar Senha de Classificação Emergência"
                buttonText="Zerar (E-001)"
                onClick={() => handleResetRequest('Emergência')}
                isResetting={isEmergenciaResetting}
                icon={RefreshCw}
            />
            <ActionRow
                label="Zerar Códigos de Cadastro de Pacientes"
                buttonText="Zerar (001)"
                onClick={handlePacienteResetRequest}
                isResetting={isPacienteResetting}
                disabled={pacientesCount === null}
                title={pacientesCount !== null && pacientesCount > 0 ? `Existem ${pacientesCount} pacientes cadastrados. Exclua-os primeiro.` : ""}
                icon={RefreshCw}
            />
            <ActionRow
                label="Zerar Códigos de Cadastro de Médicos"
                buttonText="Zerar (001)"
                onClick={handleMedicoResetRequest}
                isResetting={isMedicoResetting}
                disabled={medicosCount === null}
                title={medicosCount !== null && medicosCount > 0 ? `Existem ${medicosCount} médicos cadastrados. Exclua-os primeiro.` : ""}
                icon={RefreshCw}
            />
            <ActionRow
                label="Zerar Códigos de Cadastro de Enfermeiros"
                buttonText="Zerar (001)"
                onClick={handleEnfermeiroResetRequest}
                isResetting={isEnfermeiroResetting}
                disabled={enfermeirosCount === null}
                title={enfermeirosCount !== null && enfermeirosCount > 0 ? `Existem ${enfermeirosCount} enfermeiros cadastrados. Exclua-os primeiro.` : ""}
                icon={RefreshCw}
            />
            <ActionRow
                label="Zerar Prontuário de Pacientes"
                buttonText="Zerar Prontuários"
                onClick={handleProntuarioResetRequest}
                isResetting={isProntuarioResetting}
                icon={Trash2}
            />
        </div>
      </CardContent>
    </Card>
     {resetType && (
        <ResetSenhaDialog
            isOpen={senhaDialogOpen}
            onOpenChange={setSenhaDialogOpen}
            onConfirm={handleConfirmSenhaReset}
            tipoSenha={resetType}
        />
     )}
      <ResetProntuarioDialog
            isOpen={prontuarioDialogOpen}
            onOpenChange={setProntuarioDialogOpen}
            onConfirm={handleConfirmProntuarioReset}
        />
       <ResetPacienteDialog
            isOpen={pacienteDialogOpen}
            onOpenChange={setPacienteDialogOpen}
            onConfirm={handleConfirmPacienteReset}
        />
        <ResetMedicoDialog
            isOpen={medicoDialogOpen}
            onOpenChange={setMedicoDialogOpen}
            onConfirm={handleConfirmMedicoReset}
        />
        <ResetEnfermeiroDialog
            isOpen={enfermeiroDialogOpen}
            onOpenChange={setEnfermeiroDialogOpen}
            onConfirm={handleConfirmEnfermeiroReset}
        />
    </>
  );
}
