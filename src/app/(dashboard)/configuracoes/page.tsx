
"use client";

import { useState, useEffect } from "react";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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


  return (
    <>
    <Card>
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
           <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configurações Gerais</CardTitle>
                <CardDescription>Parâmetros principais do sistema.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="py-2">Parâmetro</TableHead>
                      <TableHead className="text-right py-2">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                        <TableCell className="font-medium py-2">Zerar Senha de Classificação Normal</TableCell>
                        <TableCell className="text-right py-2">
                           <Button 
                             onClick={() => handleResetRequest('Normal')}
                             variant="destructive" 
                             size="sm"
                             className="h-8"
                             disabled={isNormalResetting}
                           >
                                <RefreshCw className={`mr-2 h-4 w-4 ${isNormalResetting ? 'animate-spin' : ''}`} />
                                {isNormalResetting ? 'Zerando...' : 'Zerar (N-001)'}
                            </Button>
                        </TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell className="font-medium py-2">Zerar Senha de Classificação Emergência</TableCell>
                        <TableCell className="text-right py-2">
                            <Button 
                                onClick={() => handleResetRequest('Emergência')}
                                variant="destructive" 
                                size="sm"
                                className="h-8"
                                disabled={isEmergenciaResetting}
                            >
                                <RefreshCw className={`mr-2 h-4 w-4 ${isEmergenciaResetting ? 'animate-spin' : ''}`} />
                                {isEmergenciaResetting ? 'Zerando...' : 'Zerar (E-001)'}
                            </Button>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium py-2">Zerar Códigos de Cadastro de Pacientes</TableCell>
                        <TableCell className="text-right py-2">
                            <Button 
                                onClick={handlePacienteResetRequest}
                                variant="destructive" 
                                size="sm"
                                className="h-8"
                                disabled={isPacienteResetting || pacientesCount === null}
                                title={pacientesCount !== null && pacientesCount > 0 ? `Existem ${pacientesCount} pacientes cadastrados. Exclua-os primeiro.` : ""}
                            >
                                <RefreshCw className={`mr-2 h-4 w-4 ${isPacienteResetting ? 'animate-spin' : ''}`} />
                                {isPacienteResetting ? 'Zerando...' : 'Zerar (001)'}
                            </Button>
                        </TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell className="font-medium py-2">Zerar Códigos de Cadastro de Médicos</TableCell>
                        <TableCell className="text-right py-2">
                            <Button 
                                onClick={handleMedicoResetRequest}
                                variant="destructive" 
                                size="sm"
                                className="h-8"
                                disabled={isMedicoResetting || medicosCount === null}
                                title={medicosCount !== null && medicosCount > 0 ? `Existem ${medicosCount} médicos cadastrados. Exclua-os primeiro.` : ""}
                            >
                                <RefreshCw className={`mr-2 h-4 w-4 ${isMedicoResetting ? 'animate-spin' : ''}`} />
                                {isMedicoResetting ? 'Zerando...' : 'Zerar (001)'}
                            </Button>
                        </TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell className="font-medium py-2">Zerar Códigos de Cadastro de Enfermeiros</TableCell>
                        <TableCell className="text-right py-2">
                            <Button 
                                onClick={handleEnfermeiroResetRequest}
                                variant="destructive" 
                                size="sm"
                                className="h-8"
                                disabled={isEnfermeiroResetting || enfermeirosCount === null}
                                title={enfermeirosCount !== null && enfermeirosCount > 0 ? `Existem ${enfermeirosCount} enfermeiros cadastrados. Exclua-os primeiro.` : ""}
                            >
                                <RefreshCw className={`mr-2 h-4 w-4 ${isEnfermeiroResetting ? 'animate-spin' : ''}`} />
                                {isEnfermeiroResetting ? 'Zerando...' : 'Zerar (001)'}
                            </Button>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium py-2">Zerar Prontuário de Pacientes</TableCell>
                        <TableCell className="text-right py-2">
                            <Button 
                                onClick={handleProntuarioResetRequest}
                                variant="destructive" 
                                size="sm"
                                className="h-8"
                                disabled={isProntuarioResetting}
                            >
                                <Trash2 className={`mr-2 h-4 w-4 ${isProntuarioResetting ? 'animate-spin' : ''}`} />
                                {isProntuarioResetting ? 'Zerando...' : 'Zerar Prontuários'}
                            </Button>
                        </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
           </Card>
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

    