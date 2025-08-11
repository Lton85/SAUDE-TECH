
"use client";

import { useState, useEffect } from "react";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Settings, RefreshCw, Trash2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetCounterByName } from "@/services/countersService";
import { clearAllHistoricoAtendimentos } from "@/services/filaDeEsperaService";
import { ResetSenhaDialog } from "@/components/configuracoes/reset-senha-dialog";
import { ResetProntuarioDialog } from "@/components/configuracoes/reset-prontuario-dialog";
import { ResetPacienteDialog } from "@/components/configuracoes/reset-paciente-dialog";
import { getPacientes } from "@/services/pacientesService";
import { getProfissionais } from "@/services/profissionaisService";
import { ResetProfissionalDialog } from "@/components/configuracoes/reset-profissional-dialog";
import { Separator } from "@/components/ui/separator";
import { NotificationDialog, NotificationType } from "@/components/ui/notification-dialog";


export default function ConfiguracoesPage() {
    const [isNormalResetting, setIsNormalResetting] = useState(false);
    const [isPreferencialResetting, setIsPreferencialResetting] = useState(false);
    const [isUrgenciaResetting, setIsUrgenciaResetting] = useState(false);
    const [isProntuarioResetting, setIsProntuarioResetting] = useState(false);
    const [isPacienteResetting, setIsPacienteResetting] = useState(false);
    const [isProfissionalResetting, setIsProfissionalResetting] = useState(false);

    const [senhaDialogOpen, setSenhaDialogOpen] = useState(false);
    const [prontuarioDialogOpen, setProntuarioDialogOpen] = useState(false);
    const [pacienteDialogOpen, setPacienteDialogOpen] = useState(false);
    const [profissionalDialogOpen, setProfissionalDialogOpen] = useState(false);
    
    const [resetType, setResetType] = useState<'Normal' | 'Preferencial' | 'Urgência' | null>(null);
    
    const [pacientesCount, setPacientesCount] = useState<number | null>(null);
    const [profissionaisCount, setProfissionaisCount] = useState<number | null>(null);
    const [notification, setNotification] = useState<{ type: NotificationType; title: string; message: string; } | null>(null);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const [pacientes, profissionais] = await Promise.all([
                    getPacientes(),
                    getProfissionais(),
                ]);
                setPacientesCount(pacientes.length);
                setProfissionaisCount(profissionais.length);
            } catch (error) {
                setNotification({
                    type: "error",
                    title: "Erro ao verificar cadastros",
                    message: "Não foi possível verificar a quantidade de registros.",
                });
            }
        };
        fetchCounts();
    }, []);

    const handleResetRequest = (type: 'Normal' | 'Preferencial' | 'Urgência') => {
        setResetType(type);
        setSenhaDialogOpen(true);
    };
    
    const handleProntuarioResetRequest = () => {
        setProntuarioDialogOpen(true);
    };

    const handlePacienteResetRequest = () => {
        if (pacientesCount !== null && pacientesCount > 0) {
            setNotification({
                type: "error",
                title: "Ação Bloqueada",
                message: `Existem ${pacientesCount} paciente(s) cadastrado(s). É necessário excluir todos antes de zerar os códigos.`,
            });
            return;
        }
        setPacienteDialogOpen(true);
    };

    const handleProfissionalResetRequest = () => {
        if (profissionaisCount !== null && profissionaisCount > 0) {
            setNotification({
                type: "error",
                title: "Ação Bloqueada",
                message: `Existem ${profissionaisCount} profissional(is) cadastrado(s). É necessário excluir todos antes de zerar os códigos.`,
            });
            return;
        }
        setProfissionalDialogOpen(true);
    };

    const handleConfirmSenhaReset = async () => {
        if (!resetType) return;

        let setLoading: React.Dispatch<React.SetStateAction<boolean>>;
        let counterName: string;
        let ticketExample: string;

        switch (resetType) {
            case 'Normal':
                setLoading = setIsNormalResetting;
                counterName = 'senha_normal';
                ticketExample = 'N-001';
                break;
            case 'Preferencial':
                setLoading = setIsPreferencialResetting;
                counterName = 'senha_preferencial';
                ticketExample = 'P-001';
                break;
            case 'Urgência':
                setLoading = setIsUrgenciaResetting;
                counterName = 'senha_emergencia';
                ticketExample = 'E-001';
                break;
            default:
                return;
        }


        setLoading(true);
        setSenhaDialogOpen(false);

        try {
            await resetCounterByName(counterName);
            setNotification({
                type: "success",
                title: `Senhas de Classificação ${resetType} Reiniciadas!`,
                message: `A contagem de senhas foi redefinida para ${ticketExample}.`,
            });
        } catch (error) {
            setNotification({
                type: "error",
                title: "Erro ao reiniciar senhas",
                message: (error as Error).message,
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
            setNotification({
                type: "success",
                title: "Prontuários Zerados!",
                message: `${count} registros de atendimentos finalizados foram excluídos.`,
            });
        } catch (error) {
             setNotification({
                type: "error",
                title: "Erro ao zerar prontuários",
                message: (error as Error).message,
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
            setNotification({
                type: "success",
                title: "Códigos de Paciente Zerados!",
                message: "A contagem de códigos de cadastro de paciente foi reiniciada para 001.",
            });
        } catch (error) {
            setNotification({
                type: "error",
                title: "Erro ao zerar códigos de paciente",
                message: (error as Error).message,
            });
        } finally {
            setIsPacienteResetting(false);
        }
    };
    
    const handleConfirmProfissionalReset = async () => {
        setIsProfissionalResetting(true);
        setProfissionalDialogOpen(false);
        try {
            await resetCounterByName('profissionais_v2');
            setNotification({
                type: "success",
                title: "Códigos de Profissional Zerados!",
                message: "A contagem de códigos de cadastro de profissional foi reiniciada para 001.",
            });
        } catch (error) {
            setNotification({
                type: "error",
                title: "Erro ao zerar códigos de profissional",
                message: (error as Error).message,
            });
        } finally {
            setIsProfissionalResetting(false);
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
        <div className="flex items-center justify-between border-t p-3 last:border-b-0 -mx-3 -mb-3 first:-mt-3">
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
    <div className="space-y-6 max-w-4xl">
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Settings className="h-6 w-6" />
                    <CardTitle>Zerar Contadores de Senha</CardTitle>
                </div>
                <CardDescription>
                    Reinicia a numeração das senhas para um novo turno ou dia de atendimento. Esta ação afeta apenas a contagem de novas senhas.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <ActionRow
                    label="Zerar Senha de Classificação Normal"
                    buttonText="Zerar (N-001)"
                    onClick={() => handleResetRequest('Normal')}
                    isResetting={isNormalResetting}
                    icon={RefreshCw}
                />
                <ActionRow
                    label="Zerar Senha de Classificação Preferencial"
                    buttonText="Zerar (P-001)"
                    onClick={() => handleResetRequest('Preferencial')}
                    isResetting={isPreferencialResetting}
                    icon={RefreshCw}
                />
                <ActionRow
                    label="Zerar Senha de Classificação Urgência"
                    buttonText="Zerar (U-001)"
                    onClick={() => handleResetRequest('Urgência')}
                    isResetting={isUrgenciaResetting}
                    icon={RefreshCw}
                />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <ShieldAlert className="h-6 w-6 text-destructive" />
                    <CardTitle>Gerenciamento de Dados</CardTitle>
                </div>
                <CardDescription>
                    Ações perigosas que afetam os dados de cadastro e históricos. Use com extrema cautela.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
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
                    label="Zerar Códigos de Cadastro de Profissionais"
                    buttonText="Zerar (001)"
                    onClick={handleProfissionalResetRequest}
                    isResetting={isProfissionalResetting}
                    disabled={profissionaisCount === null}
                    title={profissionaisCount !== null && profissionaisCount > 0 ? `Existem ${profissionaisCount} profissionais cadastrados. Exclua-os primeiro.` : ""}
                    icon={RefreshCw}
                />
                <ActionRow
                    label="Zerar Prontuário de Pacientes"
                    buttonText="Zerar Prontuários"
                    onClick={handleProntuarioResetRequest}
                    isResetting={isProntuarioResetting}
                    icon={Trash2}
                />
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
          <ResetProfissionalDialog
              isOpen={profissionalDialogOpen}
              onOpenChange={setProfissionalDialogOpen}
              onConfirm={handleConfirmProfissionalReset}
          />
           {notification && (
            <NotificationDialog
                type={notification.type}
                title={notification.title}
                message={notification.message}
                onOpenChange={() => setNotification(null)}
            />
        )}
    </div>
  );
}
