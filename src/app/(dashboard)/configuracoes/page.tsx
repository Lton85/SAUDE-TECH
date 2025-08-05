"use client";

import { useState } from "react";
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


export default function ConfiguracoesPage() {
    const { toast } = useToast();
    const [isNormalResetting, setIsNormalResetting] = useState(false);
    const [isEmergenciaResetting, setIsEmergenciaResetting] = useState(false);
    const [isProntuarioResetting, setIsProntuarioResetting] = useState(false);
    const [isPacienteResetting, setIsPacienteResetting] = useState(false);
    const [senhaDialogOpen, setSenhaDialogOpen] = useState(false);
    const [prontuarioDialogOpen, setProntuarioDialogOpen] = useState(false);
    const [pacienteDialogOpen, setPacienteDialogOpen] = useState(false);
    const [resetType, setResetType] = useState<'Normal' | 'Emergência' | null>(null);

    const handleResetRequest = (type: 'Normal' | 'Emergência') => {
        setResetType(type);
        setSenhaDialogOpen(true);
    };
    
    const handleProntuarioResetRequest = () => {
        setProntuarioDialogOpen(true);
    };

    const handlePacienteResetRequest = () => {
        setPacienteDialogOpen(true);
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
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
           <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configurações Gerais</CardTitle>
                <CardDescription>Parâmetros principais do sistema.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parâmetro</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                        <TableCell className="font-medium">Zerar Senha de Classificação Normal</TableCell>
                        <TableCell className="text-right">
                           <Button 
                             onClick={() => handleResetRequest('Normal')}
                             variant="destructive" 
                             size="sm"
                             disabled={isNormalResetting}
                           >
                                <RefreshCw className={`mr-2 h-4 w-4 ${isNormalResetting ? 'animate-spin' : ''}`} />
                                {isNormalResetting ? 'Zerando...' : 'Zerar (N-001)'}
                            </Button>
                        </TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell className="font-medium">Zerar Senha de Classificação Emergência</TableCell>
                        <TableCell className="text-right">
                            <Button 
                                onClick={() => handleResetRequest('Emergência')}
                                variant="destructive" 
                                size="sm"
                                disabled={isEmergenciaResetting}
                            >
                                <RefreshCw className={`mr-2 h-4 w-4 ${isEmergenciaResetting ? 'animate-spin' : ''}`} />
                                {isEmergenciaResetting ? 'Zerando...' : 'Zerar (E-001)'}
                            </Button>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">Zerar Códigos de Pacientes</TableCell>
                        <TableCell className="text-right">
                            <Button 
                                onClick={handlePacienteResetRequest}
                                variant="destructive" 
                                size="sm"
                                disabled={isPacienteResetting}
                            >
                                <RefreshCw className={`mr-2 h-4 w-4 ${isPacienteResetting ? 'animate-spin' : ''}`} />
                                {isPacienteResetting ? 'Zerando...' : 'Zerar (001)'}
                            </Button>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">Zerar Prontuário de Pacientes</TableCell>
                        <TableCell className="text-right">
                            <Button 
                                onClick={handleProntuarioResetRequest}
                                variant="destructive" 
                                size="sm"
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
        </div>
        <div className="md:col-span-2 flex items-center justify-center h-full border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">
                Outras configurações serão implementadas aqui.
            </p>
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
    </>
  );
}
