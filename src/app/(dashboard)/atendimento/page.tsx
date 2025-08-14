
"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFilaDeEspera, getAtendimentosPendentes, chamarPaciente, getAtendimentosEmAndamento, finalizarAtendimento, retornarPacienteParaFila, updateFilaItem, updateHistoricoItem, getAtendimentosEmTriagem, getAtendimentosFinalizadosHoje, cancelarAtendimento, retornarParaPendente, retornarPacienteParaTriagem } from "@/services/filaDeEsperaService";
import type { FilaDeEsperaItem } from "@/types/fila";
import type { Paciente } from "@/types/paciente";
import type { Departamento } from "@/types/departamento";
import { getPacientesRealtime } from "@/services/pacientesService";
import { getDepartamentos } from "@/services/departamentosService";
import { getProfissionais } from "@/services/profissionaisService";
import { PatientDialog } from "@/components/patients/patient-dialog";
import { AddToQueueDialog } from "@/components/atendimento/add-to-queue-dialog";
import { EditQueueItemDialog } from "@/components/atendimento/edit-dialog";
import { CancelAtendimentoDialog } from "@/components/atendimento/cancel-dialog";
import { ProntuarioDialog } from "@/components/atendimento/prontuario-dialog";
import { ReturnToQueueDialog } from "@/components/atendimento/return-to-queue-dialog";
import { SenhasPendentesList } from "@/components/atendimento/list-pendentes";
import { EmTriagemList } from "@/components/atendimento/list-em-triagem";
import { FilaDeAtendimentoList } from "@/components/atendimento/list-fila-atendimento";
import { EmAndamentoList } from "@/components/atendimento/list-em-andamento";
import { FinalizadosList } from "@/components/atendimento/list-finalizados";
import { AlertTriangle, HeartPulse, Hourglass, Tags, User, FileText, CheckCircle, Eraser, ListX, Lock, Tv2, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { clearPainel, clearHistoryChamadas } from "@/services/chamadasService";
import { NotificationDialog, NotificationType } from "@/components/ui/notification-dialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { CancellationConfirmationDialog } from "@/components/atendimento/cancellation-confirmation-dialog";
import { getEmpresa, Empresa } from "@/services/empresaService";
import type { Classificacao } from "@/types/empresa";
import { CurrentPanelDialog } from "@/components/atendimento/current-panel-dialog";
import { getCurrentUser } from "@/services/authService";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Profissional {
  id: string;
  nome: string;
}

interface TabInfo {
    id: string;
    label: string;
    icon: React.ElementType;
}

const allTabs: TabInfo[] = [
    { id: 'pendentes', label: 'Senhas Pendentes', icon: AlertTriangle },
    { id: 'em-triagem', label: 'Em Triagem', icon: HeartPulse },
    { id: 'fila-atendimento', label: 'Fila de Atendimento', icon: Tags },
    { id: 'em-andamento', label: 'Em Andamento', icon: Hourglass },
    { id: 'finalizados', label: 'Finalizados', icon: CheckCircle },
];


export default function AtendimentosPage() {
    // Data states
    const [pendentes, setPendentes] = useState<FilaDeEsperaItem[]>([]);
    const [emTriagem, setEmTriagem] = useState<FilaDeEsperaItem[]>([]);
    const [fila, setFila] = useState<FilaDeEsperaItem[]>([]);
    const [emAtendimento, setEmAtendimento] = useState<FilaDeEsperaItem[]>([]);
    const [finalizados, setFinalizados] = useState<FilaDeEsperaItem[]>([]);
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [profissionais, setProfissionais] = useState<Profissional[]>([]);
    const [activeClassificacoes, setActiveClassificacoes] = useState<Classificacao[]>([]);
    
    // UI states
    const [isLoading, setIsLoading] = useState(true);
    const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
    const [isAddToQueueDialogOpen, setIsAddToQueueDialogOpen] = useState(false);
    const [isPanelPreviewOpen, setIsPanelPreviewOpen] = useState(false);
    const [notification, setNotification] = useState<{ type: NotificationType; title: string; message: string; } | null>(null);
    const [finalizadosFilter, setFinalizadosFilter] = useState<'todos' | 'finalizado' | 'cancelado'>('todos');
    const [cancellationConfirmation, setCancellationConfirmation] = useState<{ isOpen: boolean; itemName: string; }>({ isOpen: false, itemName: "" });
    const [isClearPanelDialogOpen, setIsClearPanelDialogOpen] = useState(false);
    const [isClearHistoryDialogOpen, setIsClearHistoryDialogOpen] = useState(false);
    const [isReturnToTriageDialogOpen, setIsReturnToTriageDialogOpen] = useState(false);
    const [isReturnToPendingDialogOpen, setIsReturnToPendingDialogOpen] = useState(false);

    
    // Dialog item states
    const [itemToCancel, setItemToCancel] = useState<FilaDeEsperaItem | null>(null);
    const [itemToEdit, setItemToEdit] = useState<FilaDeEsperaItem | null>(null);
    const [itemToEditFromHistory, setItemToEditFromHistory] = useState<FilaDeEsperaItem | null>(null);
    const [itemToHistory, setItemToHistory] = useState<FilaDeEsperaItem | null>(null);
    const [itemToReturn, setItemToReturn] = useState<FilaDeEsperaItem | null>(null);
    const [itemToReturnToTriage, setItemToReturnToTriage] = useState<FilaDeEsperaItem | null>(null);
    const [itemToReturnToPending, setItemToReturnToPending] = useState<FilaDeEsperaItem | null>(null);
    const [patientToAdd, setPatientToAdd] = useState<Paciente | null>(null);
    const [atendimentoParaCompletar, setAtendimentoParaCompletar] = useState<FilaDeEsperaItem | null>(null);
    
    // Permissions
    const [permissions, setPermissions] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<string | null>(null);
    
    useEffect(() => {
        const user = getCurrentUser();
        if (!user) return;

        const userPermissions = user.permissoes || [];
        if (user.usuario === 'master') {
            const allPermissions = allTabs.map(t => `/atendimento/${t.id}`);
            setPermissions(allPermissions);
            setActiveTab(allTabs[0]?.id);
        } else {
            setPermissions(userPermissions);
            // Set the first allowed tab as active
            const firstAllowedTab = allTabs.find(tab => userPermissions.includes(`/atendimento/${tab.id}`));
            setActiveTab(firstAllowedTab ? firstAllowedTab.id : null);
        }
    }, []);

    // Data Fetching and Realtime Subscriptions
    useEffect(() => {
        const fetchSupportData = async () => {
             try {
                const [deptoData, profissionaisData, empresaData] = await Promise.all([
                    getDepartamentos(),
                    getProfissionais(),
                    getEmpresa(),
                ]);

                setDepartamentos(deptoData.filter(d => d.situacao === 'Ativo'));
                const profissionaisList = profissionaisData.map(m => ({ id: m.id, nome: `Dr(a). ${m.nome}` }));
                setProfissionais([...profissionaisList].sort((a,b) => a.nome.localeCompare(b.nome)));
                
                 if (empresaData?.classificacoes?.length) {
                    setActiveClassificacoes(empresaData.classificacoes);
                }
                
             } catch (error) {
                 setNotification({ type: "error", title: "Erro ao carregar dados de apoio", message: "Não foi possível carregar departamentos ou profissionais." });
             }
        }
        fetchSupportData();

        const unsubPacientes = getPacientesRealtime(setPacientes, (error) => setNotification({ type: 'error', title: "Erro ao carregar pacientes", message: error }));
        
        const unsubPendentes = getAtendimentosPendentes((data) => {
             const sortedData = [...data].sort((a, b) => {
                if (a.prioridade !== b.prioridade) {
                    return a.prioridade - b.prioridade;
                }
                return (a.chegadaEm?.toMillis() ?? 0) - (b.chegadaEm?.toMillis() ?? 0);
            });
            setPendentes(sortedData);
            setIsLoading(false);
        }, (error) => {
             setNotification({ type: 'error', title: "Erro ao carregar senhas pendentes", message: error });
             setIsLoading(false);
        });

        const unsubEmTriagem = getAtendimentosEmTriagem((data) => {
            setEmTriagem(data.sort((a, b) => (b.chamadaEm?.toDate().getTime() ?? 0) - (a.chamadaEm?.toDate().getTime() ?? 0)));
        }, (error) => setNotification({ type: 'error', title: "Erro ao carregar senhas em triagem", message: error }));
        
        const unsubFila = getFilaDeEspera((data) => {
            setFila(data);
            setIsLoading(false);
        }, (error) => {
            setNotification({ type: 'error', title: "Erro ao carregar a fila", message: error });
            setIsLoading(false);
        });

        const unsubEmAtendimento = getAtendimentosEmAndamento((data) => {
            setEmAtendimento(data.sort((a, b) => (b.chamadaEm?.toDate().getTime() ?? 0) - (a.chamadaEm?.toDate().getTime() ?? 0)));
            setIsLoading(false);
        }, (error) => {
            setNotification({ type: 'error', title: "Erro ao carregar atendimentos", message: error });
            setIsLoading(false);
        });
        
         const unsubFinalizados = getAtendimentosFinalizadosHoje(
            (data) => setFinalizados(data),
            (error) => setNotification({ type: 'error', title: "Erro ao carregar finalizados", message: error })
        );

        return () => {
            unsubPacientes();
            unsubPendentes();
            unsubEmTriagem();
            unsubFila();
            unsubEmAtendimento();
            unsubFinalizados();
        };
    }, []);
    
    // Handlers for dialogs and actions
    const handleOpenNewPatientDialog = () => {
        setIsAddToQueueDialogOpen(false);
        setIsPatientDialogOpen(true);
    };

    const handlePatientDialogSuccess = (newPatient: Paciente) => {
        setIsPatientDialogOpen(false);
        setPatientToAdd(newPatient);
        setTimeout(() => setIsAddToQueueDialogOpen(true), 100);
    };

    const handleCompletarCadastro = (item: FilaDeEsperaItem) => {
        setAtendimentoParaCompletar(item);
        setPatientToAdd(null);
        setIsAddToQueueDialogOpen(true);
    };
    
    const handleAddToQueue = () => {
        setAtendimentoParaCompletar(null); 
        setPatientToAdd(null);
        setIsAddToQueueDialogOpen(true);
    }
    
    const handleChamarParaTriagem = async (item: FilaDeEsperaItem) => {
        try {
            await chamarPaciente(item, 'triagem');
            setNotification({ type: 'success', title: "Senha Chamada!", message: `A senha ${item.senha} foi chamada para a Recepção.` });
        } catch (error) {
            const err = error as Error;
            setNotification({ type: 'error', title: "Erro ao chamar senha", message: err.message });
        }
    };
    
    const handleReturnToPendingRequest = (item: FilaDeEsperaItem) => {
        setItemToReturnToPending(item);
        setIsReturnToPendingDialogOpen(true);
    };

    const handleConfirmReturnToPending = async () => {
        if (!itemToReturnToPending) return;
        try {
            await retornarParaPendente(itemToReturnToPending.id);
            setNotification({ type: 'success', title: "Retorno Confirmado!", message: `A senha ${itemToReturnToPending.senha} voltou para a fila de senhas pendentes.` });
        } catch (error) {
            const err = error as Error;
            setNotification({ type: 'error', title: "Erro ao retornar senha", message: err.message });
        } finally {
            setIsReturnToPendingDialogOpen(false);
            setItemToReturnToPending(null);
        }
    };

    const handleReturnToTriageRequest = (item: FilaDeEsperaItem) => {
        setItemToReturnToTriage(item);
        setIsReturnToTriageDialogOpen(true);
    };

    const handleConfirmReturnToTriage = async () => {
        if (!itemToReturnToTriage) return;
        try {
            await retornarPacienteParaTriagem(itemToReturnToTriage.id);
            setNotification({ type: 'success', title: "Retornado para Triagem!", message: `O paciente ${itemToReturnToTriage.pacienteNome} retornou para a triagem inicial.` });
        } catch (error) {
            const err = error as Error;
            setNotification({ type: 'error', title: "Erro ao retornar paciente", message: err.message });
        } finally {
            setIsReturnToTriageDialogOpen(false);
            setItemToReturnToTriage(null);
        }
    };

    const handleChamarParaAtendimento = async (item: FilaDeEsperaItem) => {
        try {
            await chamarPaciente(item, 'atendimento');
            setNotification({ type: 'success', title: "Paciente Chamado!", message: `${item.pacienteNome} foi chamado para atendimento.` });
        } catch (error) {
            const err = error as Error;
            setNotification({ type: 'error', title: "Erro ao chamar paciente", message: err.message });
        }
    };
    
    const handleFinalizarAtendimento = async (item: FilaDeEsperaItem) => {
        try {
            await finalizarAtendimento(item.id);
            setNotification({ type: 'success', title: "Atendimento Finalizado!", message: `O atendimento de ${item.pacienteNome} foi finalizado.` });
        } catch (error) {
            const err = error as Error;
            setNotification({ type: 'error', title: "Erro ao finalizar", message: err.message });
        }
    };
    
    const handleEditFromHistory = (item: FilaDeEsperaItem) => {
        setItemToHistory(null); // Close history dialog
        setItemToEditFromHistory(item); // Open edit dialog for history item
    };

    const handleClearPanel = async () => {
        setIsClearPanelDialogOpen(false);
        try {
            await clearPainel();
            setNotification({ type: 'success', title: "Painel Limpo!", message: "O painel de senhas foi reiniciado." });
        } catch (error) {
            const err = error as Error;
            setNotification({ type: 'error', title: "Erro ao limpar painel", message: err.message });
        }
    };

    const handleClearHistory = async () => {
        setIsClearHistoryDialogOpen(false);
        try {
            await clearHistoryChamadas();
            setNotification({ type: 'success', title: "Histórico Limpo!", message: "O histórico de últimas senhas do painel foi limpo." });
        } catch (error) {
            const err = error as Error;
            setNotification({ type: 'error', title: "Erro ao limpar histórico", message: err.message });
        }
    };
    
    if (activeTab === null) {
        return (
            <div className="flex flex-col items-center justify-center h-full rounded-md border border-dashed py-10">
                <Lock className="h-10 w-10 text-muted-foreground/50" />
                <p className="mt-4 text-center text-muted-foreground">
                    Você não tem permissão para acessar esta seção.
                </p>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-full">
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1">
                 <div className="flex gap-2">
                    {allTabs.map(tab => {
                         const hasPermission = permissions.includes(`/atendimento/${tab.id}`);
                         if (!hasPermission) return null; // Don't render the button if no permission
                         const Icon = tab.icon;
                         let count = 0;
                         if (tab.id === 'pendentes') count = pendentes.length;
                         else if (tab.id === 'em-triagem') count = emTriagem.length;
                         else if (tab.id === 'fila-atendimento') count = fila.length;
                         else if (tab.id === 'em-andamento') count = emAtendimento.length;
                         else if (tab.id === 'finalizados') count = finalizados.length;

                        return (
                             <Button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                disabled={!hasPermission}
                                className={cn(
                                    "text-sm font-medium flex-1",
                                    activeTab === tab.id
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-card text-card-foreground border hover:bg-muted"
                                )}
                            >
                                {!hasPermission && <Lock className="mr-2 h-3 w-3" />}
                                <Icon className="mr-2 h-4 w-4" />
                                {tab.label}
                                {count > 0 && (
                                    <Badge variant={activeTab === tab.id ? 'secondary' : (tab.id === 'pendentes' ? 'destructive' : tab.id === 'finalizados' ? 'secondary' : 'default')} className="ml-2">
                                        {count}
                                    </Badge>
                                )}
                            </Button>
                        );
                    })}
                </div>
                
                <div className="flex-1 overflow-y-auto mt-4">
                    {allTabs.map(tab => {
                         const hasPermission = permissions.includes(`/atendimento/${tab.id}`);
                        return (
                            <div key={tab.id} className={cn("h-full", activeTab !== tab.id && "hidden")}>
                                {hasPermission && tab.id === 'pendentes' && <SenhasPendentesList pendentes={pendentes} isLoading={isLoading} onCall={handleChamarParaTriagem} onCancel={setItemToCancel} classificacoes={activeClassificacoes} isReadOnly={!hasPermission} />}
                                {hasPermission && tab.id === 'em-triagem' && <EmTriagemList emTriagem={emTriagem} isLoading={isLoading} onIdentify={handleCompletarCadastro} onCancel={setItemToCancel} onReturnToPending={handleReturnToPendingRequest} classificacoes={activeClassificacoes} isReadOnly={!hasPermission} />}
                                {hasPermission && tab.id === 'fila-atendimento' && <FilaDeAtendimentoList fila={fila} isLoading={isLoading} onCall={handleChamarParaAtendimento} onEdit={setItemToEdit} onHistory={setItemToHistory} onCancel={setItemToCancel} onAddToQueue={handleAddToQueue} onClearPanel={() => setIsClearPanelDialogOpen(true)} onClearHistory={() => setIsClearHistoryDialogOpen(true)} onPreviewPanel={() => setIsPanelPreviewOpen(true)} onReturnToTriage={handleReturnToTriageRequest} isReadOnly={!hasPermission} />}
                                {hasPermission && tab.id === 'em-andamento' && <EmAndamentoList emAtendimento={emAtendimento} isLoading={isLoading} onReturnToQueue={setItemToReturn} onFinalize={handleFinalizarAtendimento} onCancel={setItemToCancel} isReadOnly={!hasPermission} />}
                                {hasPermission && tab.id === 'finalizados' && <FinalizadosList finalizados={finalizados} isLoading={isLoading} filter={finalizadosFilter} onFilterChange={setFinalizadosFilter} classificacoes={activeClassificacoes} />}
                            </div>
                        )
                    })}
                </div>
            </Tabs>
            
             {/* Dialogs */}
             <CurrentPanelDialog 
                isOpen={isPanelPreviewOpen}
                onOpenChange={setIsPanelPreviewOpen}
             />

            <AddToQueueDialog
                isOpen={isAddToQueueDialogOpen}
                onOpenChange={(open) => { if (!open) setIsAddToQueueDialogOpen(false); }}
                pacientes={pacientes}
                departamentos={departamentos}
                classificacoes={activeClassificacoes.filter(c => c.ativa)}
                onAddNewPatient={handleOpenNewPatientDialog}
                patientToAdd={patientToAdd}
                atendimentoParaCompletar={atendimentoParaCompletar}
                onSuccess={(message, description) => setNotification({ type: 'success', title: message, message: description})}
            />

            <PatientDialog
                isOpen={isPatientDialogOpen}
                onOpenChange={(open) => { if (!open) setIsPatientDialogOpen(false); }}
                onSuccess={handlePatientDialogSuccess}
                paciente={null}
                onNotification={setNotification}
            />

            {itemToEdit && (
                <EditQueueItemDialog
                    isOpen={!!itemToEdit}
                    onOpenChange={(open) => { if (!open) setItemToEdit(null); }}
                    item={itemToEdit}
                    departamentos={departamentos}
                    profissionais={profissionais}
                    onSave={updateFilaItem}
                    isHistory={false}
                    onNotification={setNotification}
                />
            )}
            
            {itemToEditFromHistory && (
                 <EditQueueItemDialog
                    isOpen={!!itemToEditFromHistory}
                    onOpenChange={(open) => { if (!open) setItemToEditFromHistory(null); }}
                    item={itemToEditFromHistory}
                    departamentos={departamentos}
                    profissionais={profissionais}
                    onSave={updateHistoricoItem}
                    isHistory={true}
                    onNotification={setNotification}
                />
            )}

            {itemToHistory && (
                <ProntuarioDialog
                    isOpen={!!itemToHistory}
                    onOpenChange={(open) => { if (!open) setItemToHistory(null); }}
                    item={itemToHistory}
                    onEdit={handleEditFromHistory}
                />
            )}

            {itemToCancel && (
                <CancelAtendimentoDialog
                    isOpen={!!itemToCancel}
                    onOpenChange={(open) => { if (!open) setItemToCancel(null); }}
                    onConfirm={async (motivo) => {
                        if (itemToCancel) {
                            try {
                                await cancelarAtendimento(itemToCancel, motivo);
                                const itemName = itemToCancel.pacienteNome || `Senha ${itemToCancel.senha}`;
                                setCancellationConfirmation({ isOpen: true, itemName: itemName });
                            } catch (error) {
                                const err = error as Error;
                                setNotification({ type: 'error', title: "Erro ao cancelar", message: err.message });
                            } finally {
                                setItemToCancel(null);
                            }
                        }
                    }}
                    item={itemToCancel}
                />
            )}
            
             <CancellationConfirmationDialog
                isOpen={cancellationConfirmation.isOpen}
                onOpenChange={(isOpen) => setCancellationConfirmation({ isOpen, itemName: "" })}
                itemName={cancellationConfirmation.itemName}
            />
            
            <ConfirmationDialog
                isOpen={isClearPanelDialogOpen}
                onOpenChange={setIsClearPanelDialogOpen}
                onConfirm={handleClearPanel}
                title="Limpar Painel Principal?"
                description="Esta ação removerá a senha atual do painel de TV, deixando-o em modo de espera. Deseja continuar?"
                confirmText="Sim, Limpar Painel"
                icon={Eraser}
            />
            
            <ConfirmationDialog
                isOpen={isClearHistoryDialogOpen}
                onOpenChange={setIsClearHistoryDialogOpen}
                onConfirm={handleClearHistory}
                title="Limpar Histórico do Painel?"
                description="Esta ação removerá a lista de 'Últimas Senhas' do painel de TV. A senha atual não será afetada. Deseja continuar?"
                confirmText="Sim, Limpar Histórico"
                icon={ListX}
            />

            {itemToReturnToTriage && (
                <ConfirmationDialog
                    isOpen={isReturnToTriageDialogOpen}
                    onOpenChange={setIsReturnToTriageDialogOpen}
                    onConfirm={handleConfirmReturnToTriage}
                    title="Retornar Paciente para a Triagem?"
                    description={`Tem certeza que deseja retornar o paciente ${itemToReturnToTriage.pacienteNome} para a triagem inicial? Ele sairá da fila de atendimento.`}
                    confirmText="Sim, Retornar"
                    icon={Undo2}
                />
            )}

            {itemToReturnToPending && (
                <ConfirmationDialog
                    isOpen={isReturnToPendingDialogOpen}
                    onOpenChange={setIsReturnToPendingDialogOpen}
                    onConfirm={handleConfirmReturnToPending}
                    title="Retornar para Senhas Pendentes?"
                    description={`Tem certeza que deseja retornar a senha ${itemToReturnToPending.senha} para a lista de senhas pendentes?`}
                    confirmText="Sim, Retornar"
                    icon={Undo2}
                />
            )}

            {itemToReturn && (
                <ReturnToQueueDialog
                    isOpen={!!itemToReturn}
                    onOpenChange={(open) => { if (!open) setItemToReturn(null); }}
                    item={itemToReturn}
                    departamentos={departamentos}
                    profissionais={profissionais}
                    onConfirm={async (item, updates) => {
                         try {
                            await updateFilaItem(item.id, updates);
                            await retornarPacienteParaFila(item.id);
                             setNotification({ type: 'success', title: "Paciente Retornou para a Fila!", message: `${item.pacienteNome} está de volta na fila.` });
                        } catch (error) {
                            const err = error as Error;
                            setNotification({ type: 'error', title: "Erro ao retornar paciente", message: err.message });
                        } finally {
                            setItemToReturn(null);
                        }
                    }}
                    onNotification={setNotification}
                />
            )}

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
