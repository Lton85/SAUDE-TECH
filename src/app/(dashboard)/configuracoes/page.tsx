
"use client";

import { useState, useEffect } from "react";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Settings, RefreshCw, Trash2, ShieldAlert, Printer, Save, Loader2, Pencil, X, UserX, Stethoscope, Building, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetCounterByName } from "@/services/countersService";
import { clearAllRelatorios, clearAllAtendimentos } from "@/services/filaDeEsperaService";
import { clearAllChamadas } from "@/services/chamadasService";
import { ResetSenhaDialog } from "@/components/configuracoes/reset-senha-dialog";
import { LimpezaHistoricoDialog } from "@/components/configuracoes/limpeza-historico-dialog";
import { ResetPacienteDialog } from "@/components/configuracoes/reset-paciente-dialog";
import { getPacientes, clearAllPacientes } from "@/services/pacientesService";
import { getProfissionais, clearAllProfissionais } from "@/services/profissionaisService";
import { getDepartamentos, clearAllDepartamentos } from "@/services/departamentosService";
import { ResetProfissionalDialog } from "@/components/configuracoes/reset-profissional-dialog";
import { NotificationDialog, NotificationType } from "@/components/ui/notification-dialog";
import { Separator } from "@/components/ui/separator";
import { getEmpresa, saveOrUpdateEmpresa } from "@/services/empresaService";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Empresa, Classificacao } from "@/types/empresa";
import { ResetDepartamentoDialog } from "@/components/configuracoes/reset-departamento-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const DeleteAllDialog = ({ isOpen, onOpenChange, onConfirm, itemType }: { isOpen: boolean, onOpenChange: (open: boolean) => void, onConfirm: (password: string) => void, itemType: string }) => {
    const description = `<p><b>O QUE SERÁ APAGADO:</b><br/> - Todos os cadastros de ${itemType}.</p>`;
    
    return (
        <LimpezaHistoricoDialog
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={`Excluir Todos os ${itemType}`}
            description={description}
            confirmText={`Sim, excluir todos`}
            requiresPassword={true}
            onConfirm={onConfirm}
        />
    )
};


export default function ConfiguracoesPage() {
    const [resettingStates, setResettingStates] = useState<{ [key: string]: boolean }>({});
    const [isLimpezaResetting, setIsLimpezaResetting] = useState(false);
    const [isPacienteResetting, setIsPacienteResetting] = useState(false);
    const [isProfissionalResetting, setIsProfissionalResetting] = useState(false);
    const [isDepartamentoResetting, setIsDepartamentoResetting] = useState(false);
    
    const [isDeletingAllPacientes, setIsDeletingAllPacientes] = useState(false);
    const [isDeletingAllProfissionais, setIsDeletingAllProfissionais] = useState(false);
    const [isDeletingAllDepartamentos, setIsDeletingAllDepartamentos] = useState(false);

    const [senhaDialogOpen, setSenhaDialogOpen] = useState(false);
    const [limpezaDialogOpen, setLimpezaDialogOpen] = useState(false);
    const [pacienteDialogOpen, setPacienteDialogOpen] = useState(false);
    const [profissionalDialogOpen, setProfissionalDialogOpen] = useState(false);
    const [departamentoDialogOpen, setDepartamentoDialogOpen] = useState(false);
    
    const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
    const [deleteType, setDeleteType] = useState<"Pacientes" | "Profissionais" | "Departamentos" | null>(null);
    
    const [resetType, setResetType] = useState<Classificacao | null>(null);
    
    const [pacientesCount, setPacientesCount] = useState<number | null>(null);
    const [profissionaisCount, setProfissionaisCount] = useState<number | null>(null);
    const [departamentosCount, setDepartamentosCount] = useState<number | null>(null);
    const [notification, setNotification] = useState<{ type: NotificationType; title: string; message: string; } | null>(null);

    const [nomeImpressora, setNomeImpressora] = useState("");
    const [originalNomeImpressora, setOriginalNomeImpressora] = useState("");
    const [isSavingPrinter, setIsSavingPrinter] = useState(false);
    const [isEditingPrinter, setIsEditingPrinter] = useState(false);
    
    const [tabletInfoSize, setTabletInfoSize] = useState<'pequeno' | 'medio' | 'grande'>('medio');
    const [tabletCardSize, setTabletCardSize] = useState<'pequeno' | 'medio' | 'grande'>('medio');
    const [isSavingResolution, setIsSavingResolution] = useState(false);
    const [classificacoes, setClassificacoes] = useState<Classificacao[]>([]);
    

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const [pacientes, profissionais, departamentos, empresaData] = await Promise.all([
                    getPacientes(),
                    getProfissionais(),
                    getDepartamentos(),
                    getEmpresa(),
                ]);
                setPacientesCount(pacientes.length);
                setProfissionaisCount(profissionais.length);
                setDepartamentosCount(departamentos.length);
                if (empresaData?.classificacoes?.length) {
                    setClassificacoes(empresaData.classificacoes);
                }
                if (empresaData?.nomeImpressora) {
                    setNomeImpressora(empresaData.nomeImpressora);
                    setOriginalNomeImpressora(empresaData.nomeImpressora);
                }
                if (empresaData?.tabletInfoSize) setTabletInfoSize(empresaData.tabletInfoSize);
                if (empresaData?.tabletCardSize) setTabletCardSize(empresaData.tabletCardSize);

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

    const handleResetRequest = (classificacao: Classificacao) => {
        setResetType(classificacao);
        setSenhaDialogOpen(true);
    };
    
    const handleLimpezaRequest = () => {
        setLimpezaDialogOpen(true);
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
    
    const handleDepartamentoResetRequest = () => {
        if (departamentosCount !== null && departamentosCount > 0) {
            setNotification({
                type: "error",
                title: "Ação Bloqueada",
                message: `Existem ${departamentosCount} departamento(s) cadastrado(s). É necessário excluir todos antes de zerar os códigos.`,
            });
            return;
        }
        setDepartamentoDialogOpen(true);
    };

    const handleDeleteAllRequest = (type: "Pacientes" | "Profissionais" | "Departamentos") => {
        setDeleteType(type);
        setDeleteAllDialogOpen(true);
    };


    const handleConfirmSenhaReset = async () => {
        if (!resetType) return;
        
        setResettingStates(prev => ({ ...prev, [resetType.id]: true }));
        setSenhaDialogOpen(false);

        try {
            const counterName = `senha_${resetType.id.toLowerCase()}`;
            await resetCounterByName(counterName);
            const ticketPrefix = resetType.nome.charAt(0).toUpperCase();

            setNotification({ 
                type: "success", 
                title: `Senhas de ${resetType.nome} Reiniciadas!`, 
                message: `A contagem de senhas foi redefinida para ${ticketPrefix}-01.` 
            });
        } catch (error) {
            setNotification({ type: "error", title: "Erro ao reiniciar senhas", message: (error as Error).message });
        } finally {
            setResettingStates(prev => ({ ...prev, [resetType.id]: false }));
            setResetType(null);
        }
    };
    
    const handleConfirmLimpeza = async (password: string) => {
        if (password !== '9512') {
            setNotification({ type: "error", title: "Senha Incorreta", message: "A senha de segurança fornecida está incorreta." });
            return;
        }
        
        setIsLimpezaResetting(true);
        setLimpezaDialogOpen(false);
        try {
            const [chamadasCount, relatoriosCount, atendimentosCount] = await Promise.all([
                clearAllChamadas(),
                clearAllRelatorios(),
                clearAllAtendimentos()
            ]);
            const total = chamadasCount + relatoriosCount + atendimentosCount;
            setNotification({ type: "success", title: "Limpeza Completa!", message: `${total} registros de atendimento foram excluídos.` });
        } catch (error) {
             setNotification({ type: "error", title: "Erro ao zerar dados", message: (error as Error).message });
        } finally {
            setIsLimpezaResetting(false);
        }
    };
    
    const handleConfirmPacienteReset = async () => {
        setIsPacienteResetting(true);
        setPacienteDialogOpen(false);
        try {
            await resetCounterByName('pacientes_v2');
            setNotification({ type: "success", title: "Códigos de Paciente Zerados!", message: "A contagem de códigos de cadastro de paciente foi reiniciada para 01." });
        } catch (error) {
            setNotification({ type: "error", title: "Erro ao zerar códigos de paciente", message: (error as Error).message });
        } finally {
            setIsPacienteResetting(false);
        }
    };
    
    const handleConfirmProfissionalReset = async () => {
        setIsProfissionalResetting(true);
        setProfissionalDialogOpen(false);
        try {
            await resetCounterByName('profissionais_v2');
            setNotification({ type: "success", title: "Códigos de Profissional Zerados!", message: "A contagem de códigos de cadastro de profissional foi reiniciada para 01." });
        } catch (error) {
            setNotification({ type: "error", title: "Erro ao zerar códigos de profissional", message: (error as Error).message });
        } finally {
            setIsProfissionalResetting(false);
        }
    };
    
    const handleConfirmDepartamentoReset = async () => {
        setIsDepartamentoResetting(true);
        setDepartamentoDialogOpen(false);
        try {
            await resetCounterByName('departamentos_v2');
            setNotification({ type: "success", title: "Códigos de Departamento Zerados!", message: "A contagem de códigos de cadastro de departamento foi reiniciada para 01." });
        } catch (error) {
            setNotification({ type: "error", title: "Erro ao zerar códigos de departamento", message: (error as Error).message });
        } finally {
            setIsDepartamentoResetting(false);
        }
    };

    const handleConfirmDeleteAll = async (password: string) => {
        if (password !== '9512') {
            setNotification({ type: "error", title: "Senha Incorreta", message: "A senha de segurança fornecida está incorreta." });
            return;
        }

        if (!deleteType) return;

        let deleteFn: () => Promise<number>;
        let setLoading: React.Dispatch<React.SetStateAction<boolean>>;
        let itemType: string;

        switch(deleteType) {
            case 'Pacientes':
                deleteFn = clearAllPacientes;
                setLoading = setIsDeletingAllPacientes;
                itemType = 'Pacientes';
                break;
            case 'Profissionais':
                deleteFn = clearAllProfissionais;
                setLoading = setIsDeletingAllProfissionais;
                itemType = 'Profissionais';
                break;
            case 'Departamentos':
                deleteFn = clearAllDepartamentos;
                setLoading = setIsDeletingAllDepartamentos;
                itemType = 'Departamentos';
                break;
            default: return;
        }
        
        setLoading(true);
        setDeleteAllDialogOpen(false);
        try {
            const count = await deleteFn();
            setNotification({
                type: 'success',
                title: `${itemType} Excluídos!`,
                message: `${count} registros de ${itemType.toLowerCase()} foram removidos com sucesso.`,
            });
            // Refresh counts
            if (itemType === 'Pacientes') setPacientesCount(0);
            if (itemType === 'Profissionais') setProfissionaisCount(0);
            if (itemType === 'Departamentos') setDepartamentosCount(0);
        } catch (error) {
            setNotification({
                type: 'error',
                title: `Erro ao excluir ${itemType}`,
                message: (error as Error).message,
            });
        } finally {
            setLoading(false);
            setDeleteType(null);
        }

    }

    const handleSavePrinter = async () => {
        setIsSavingPrinter(true);
        try {
            await saveOrUpdateEmpresa({ nomeImpressora } as Empresa);
             setOriginalNomeImpressora(nomeImpressora);
            setIsEditingPrinter(false);
            setNotification({
                type: 'success',
                title: 'Impressora Salva!',
                message: 'O nome da impressora foi salvo com sucesso.',
            });
        } catch (error) {
             setNotification({
                type: 'error',
                title: `Erro ao salvar impressora`,
                message: (error as Error).message,
            });
        } finally {
            setIsSavingPrinter(false);
        }
    };

    const handleSaveResolution = async () => {
        setIsSavingResolution(true);
        try {
            await saveOrUpdateEmpresa({ tabletInfoSize, tabletCardSize } as Empresa);
            setNotification({
                type: 'success',
                title: 'Resolução Salva!',
                message: 'As configurações de resolução do tablet foram salvas.',
            });
        } catch (error) {
             setNotification({
                type: 'error',
                title: `Erro ao salvar resolução`,
                message: (error as Error).message,
            });
        } finally {
            setIsSavingResolution(false);
        }
    };
    
    const handleCancelPrinterEdit = () => {
        setNomeImpressora(originalNomeImpressora);
        setIsEditingPrinter(false);
    };


    const ActionRow = ({ label, buttonText, onClick, isResetting, disabled, icon: Icon, title, variant = "destructive" }: { label: string; buttonText: string; onClick: () => void; isResetting: boolean; disabled?: boolean; icon: React.ElementType; title?: string; variant?: "destructive" | "outline" | "default" | "secondary" | "ghost" | "link" | null | undefined }) => (
        <div className="flex items-center justify-between px-3 py-2 first:pt-0 last:pb-0">
            <p className="font-medium text-sm text-gray-700">{label}</p>
            <Button onClick={onClick} variant={variant} size="sm" className="h-8 text-xs" disabled={isResetting || disabled} title={title}>
                {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Icon className="mr-2 h-3 w-3" />}
                {isResetting ? 'Processando...' : buttonText}
            </Button>
        </div>
    );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Coluna 1 e 2: Configurações Gerais */}
        <div className="lg:col-span-2 space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Settings className="h-5 w-5" />
                        <CardTitle className="text-lg">Contadores de Senha</CardTitle>
                    </div>
                    <CardDescription className="text-sm">
                        Reinicia a numeração das senhas para um novo turno ou dia de atendimento.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {classificacoes.map((classificacao) => (
                        <ActionRow
                            key={classificacao.id}
                            label={`Zerar Senha ${classificacao.nome}`}
                            buttonText={`Zerar (${classificacao.nome.charAt(0)}-01)`}
                            onClick={() => handleResetRequest(classificacao)}
                            isResetting={resettingStates[classificacao.id]}
                            icon={RefreshCw}
                            variant="destructive"
                        />
                    ))}
                </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Printer className="h-5 w-5" />
                            <CardTitle className="text-lg">Impressão</CardTitle>
                        </div>
                        <CardDescription className="text-sm">
                            Nome da impressora de comprovantes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-2">
                            <div className="flex-1 space-y-1.5">
                                <Label htmlFor="nomeImpressora" className="sr-only">Nome da Impressora</Label>
                                <Input 
                                    id="nomeImpressora" 
                                    value={nomeImpressora} 
                                    onChange={(e) => setNomeImpressora(e.target.value)} 
                                    placeholder="Ex: EPSON L3250"
                                    disabled={!isEditingPrinter}
                                    className="h-9"
                                />
                            </div>
                             {!isEditingPrinter ? (
                                <Button onClick={() => setIsEditingPrinter(true)} disabled={isSavingPrinter} size="sm" className="h-9">
                                    <Pencil className="mr-2 h-3 w-3" />
                                    Editar
                                </Button>
                            ) : (
                                <>
                                    <Button variant="outline" onClick={handleCancelPrinterEdit} disabled={isSavingPrinter} size="sm" className="h-9">
                                        <X className="mr-2 h-3 w-3" />
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleSavePrinter} disabled={isSavingPrinter} size="sm" className="h-9">
                                        {isSavingPrinter ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-3 w-3" />}
                                        Salvar
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                     <CardHeader>
                        <div className="flex items-center gap-3">
                            <Tablet className="h-5 w-5" />
                            <CardTitle className="text-lg">Resolução Tablet</CardTitle>
                        </div>
                        <CardDescription className="text-sm">
                           Ajuste os tamanhos para a tela de senhas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="font-semibold text-sm">Informações</Label>
                            <RadioGroup value={tabletInfoSize} onValueChange={(v) => setTabletInfoSize(v as any)} className="flex items-center gap-2">
                                <RadioGroupItem value="pequeno" id="info-p"/>
                                <Label htmlFor="info-p" className="cursor-pointer text-xs px-1">P</Label>
                                <RadioGroupItem value="medio" id="info-m"/>
                                <Label htmlFor="info-m" className="cursor-pointer text-xs px-1">M</Label>
                                <RadioGroupItem value="grande" id="info-g"/>
                                <Label htmlFor="info-g" className="cursor-pointer text-xs px-1">G</Label>
                            </RadioGroup>
                        </div>
                         <div className="flex items-center justify-between">
                            <Label className="font-semibold text-sm">Card</Label>
                             <RadioGroup value={tabletCardSize} onValueChange={(v) => setTabletCardSize(v as any)} className="flex items-center gap-2">
                                <RadioGroupItem value="pequeno" id="card-p"/>
                                <Label htmlFor="card-p" className="cursor-pointer text-xs px-1">P</Label>
                                <RadioGroupItem value="medio" id="card-m"/>
                                <Label htmlFor="card-m" className="cursor-pointer text-xs px-1">M</Label>
                                <RadioGroupItem value="grande" id="card-g"/>
                                <Label htmlFor="card-g" className="cursor-pointer text-xs px-1">G</Label>
                            </RadioGroup>
                        </div>
                        <Button className="w-full mt-2 h-9" size="sm" onClick={handleSaveResolution} disabled={isSavingResolution}>
                            {isSavingResolution ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-3 w-3" />}
                            Salvar Resolução
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>

        {/* Coluna 3: Ações de Risco */}
        <div className="space-y-4">
            <Card className="border-destructive/50">
                <CardHeader>
                    <div className="flex items-center gap-3 text-destructive">
                        <ShieldAlert className="h-5 w-5" />
                        <CardTitle className="text-lg">Gerenciamento de Cadastros</CardTitle>
                    </div>
                    <CardDescription>
                        Ações que afetam os códigos e registros. Use com extrema cautela.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                    <ActionRow label="Zerar Códigos de Pacientes" buttonText="Zerar (01)" onClick={handlePacienteResetRequest} isResetting={isPacienteResetting} disabled={pacientesCount === null || pacientesCount > 0} title={pacientesCount !== null && pacientesCount > 0 ? `Existem ${pacientesCount} pacientes cadastrados. Exclua-os primeiro.` : ""} icon={RefreshCw} />
                    <ActionRow label="Zerar Códigos de Profissionais" buttonText="Zerar (01)" onClick={handleProfissionalResetRequest} isResetting={isProfissionalResetting} disabled={profissionaisCount === null || profissionaisCount > 0} title={profissionaisCount !== null && profissionaisCount > 0 ? `Existem ${profissionaisCount} profissionais cadastrados. Exclua-os primeiro.` : ""} icon={RefreshCw} />
                    <ActionRow label="Zerar Códigos de Departamentos" buttonText="Zerar (01)" onClick={handleDepartamentoResetRequest} isResetting={isDepartamentoResetting} disabled={departamentosCount === null || departamentosCount > 0} title={departamentosCount !== null && departamentosCount > 0 ? `Existem ${departamentosCount} departamentos cadastrados. Exclua-os primeiro.` : ""} icon={RefreshCw} />
                    <Separator className="my-2 bg-destructive/20" />
                    <ActionRow label="Excluir Todos os Pacientes" buttonText="Excluir" onClick={() => handleDeleteAllRequest("Pacientes")} isResetting={isDeletingAllPacientes} icon={UserX} />
                    <ActionRow label="Excluir Todos os Profissionais" buttonText="Excluir" onClick={() => handleDeleteAllRequest("Profissionais")} isResetting={isDeletingAllProfissionais} icon={Stethoscope} />
                    <ActionRow label="Excluir Todos os Departamentos" buttonText="Excluir" onClick={() => handleDeleteAllRequest("Departamentos")} isResetting={isDeletingAllDepartamentos} icon={Building} />
                </CardContent>
            </Card>
            
            <Card className="border-destructive/50">
                <CardHeader>
                    <div className="flex items-center gap-3 text-destructive">
                        <Trash2 className="h-5 w-5" />
                        <CardTitle className="text-lg">Limpeza Definitiva</CardTitle>
                    </div>
                    <CardDescription>
                        Exclui permanentemente todos os registros de chamadas e relatórios.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                     <ActionRow
                        label="Zerar Histórico de Dados"
                        buttonText="Limpeza Completa"
                        onClick={handleLimpezaRequest}
                        isResetting={isLimpezaResetting}
                        icon={Trash2}
                        variant="destructive"
                    />
                </CardContent>
            </Card>
        </div>
        
        {resetType && (<ResetSenhaDialog isOpen={senhaDialogOpen} onOpenChange={setSenhaDialogOpen} onConfirm={handleConfirmSenhaReset} tipoSenha={resetType}/>)}
        
        <LimpezaHistoricoDialog
            isOpen={limpezaDialogOpen}
            onOpenChange={setLimpezaDialogOpen}
            title="Ação Irreversível de Limpeza"
            description="&lt;p&gt;&lt;b&gt;O QUE SERÁ APAGADO:&lt;/b&gt;&lt;br/&gt; - &lt;b&gt;TODOS&lt;/b&gt; os atendimentos (pendentes, em triagem, em andamento, finalizados e cancelados).&lt;br/&gt;- Todas as chamadas de senha do painel.&lt;/p&gt;&lt;p&gt;&lt;b class='text-green-600'&gt;O QUE SERÁ MANTIDO:&lt;/b&gt;&lt;br/&gt; - Todas as configurações.&lt;br/&gt; - Todos os cadastros (pacientes, profissionais e departamentos).&lt;/p&gt;"
            onConfirm={handleConfirmLimpeza}
            isSubmitting={isLimpezaResetting}
        />

        <ResetPacienteDialog isOpen={pacienteDialogOpen} onOpenChange={setPacienteDialogOpen} onConfirm={handleConfirmPacienteReset} />
        <ResetProfissionalDialog isOpen={profissionalDialogOpen} onOpenChange={setProfissionalDialogOpen} onConfirm={handleConfirmProfissionalReset} />
        <ResetDepartamentoDialog isOpen={departamentoDialogOpen} onOpenChange={setDepartamentoDialogOpen} onConfirm={handleConfirmDepartamentoReset} />

        {deleteType && (<DeleteAllDialog isOpen={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen} onConfirm={handleConfirmDeleteAll} itemType={deleteType} />)}
        {notification && (<NotificationDialog type={notification.type} title={notification.title} message={notification.message} onOpenChange={() => setNotification(null)} />)}
    </div>
  );
}
