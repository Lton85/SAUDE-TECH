
"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFilaDeEspera, getAtendimentosPendentes, chamarPaciente, getAtendimentosEmAndamento, finalizarAtendimento, retornarPacienteParaFila, updateFilaItem, updateHistoricoItem, getAtendimentosEmTriagem, getAtendimentosFinalizadosHoje, cancelarAtendimento } from "@/services/filaDeEsperaService";
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
import { AlertTriangle, HeartPulse, Hourglass, Tags, User, FileText, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { clearPainel, clearHistoryChamadas } from "@/services/chamadasService";
import { NotificationDialog, NotificationType } from "@/components/ui/notification-dialog";
import { CancellationConfirmationDialog } from "@/components/atendimento/cancellation-confirmation-dialog";
import { getEmpresa } from "@/services/empresaService";

interface Profissional {
  id: string;
  nome: string;
}

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
    const [activeClassificacoes, setActiveClassificacoes] = useState<string[]>([]);
    
    // UI states
    const [isLoading, setIsLoading] = useState(true);
    const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
    const [isAddToQueueDialogOpen, setIsAddToQueueDialogOpen] = useState(false);
    const [notification, setNotification] = useState<{ type: NotificationType; title: string; message: string; } | null>(null);
    const [finalizadosFilter, setFinalizadosFilter] = useState<'todos' | 'finalizado' | 'cancelado'>('todos');
    const [cancellationConfirmation, setCancellationConfirmation] = useState<{ isOpen: boolean; itemName: string; }>({ isOpen: false, itemName: "" });
    
    // Dialog item states
    const [itemToCancel, setItemToCancel] = useState<FilaDeEsperaItem | null>(null);
    const [itemToEdit, setItemToEdit] = useState<FilaDeEsperaItem | null>(null);
    const [itemToEditFromHistory, setItemToEditFromHistory] = useState<FilaDeEsperaItem | null>(null);
    const [itemToHistory, setItemToHistory] = useState<FilaDeEsperaItem | null>(null);
    const [itemToReturn, setItemToReturn] = useState<FilaDeEsperaItem | null>(null);
    const [patientToAdd, setPatientToAdd] = useState<Paciente | null>(null);
    const [atendimentoParaCompletar, setAtendimentoParaCompletar] = useState<FilaDeEsperaItem | null>(null);
    
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
                if (empresaData?.classificacoesAtendimento?.length) {
                    setActiveClassificacoes(empresaData.classificacoesAtendimento);
                } else {
                    setActiveClassificacoes(["Normal", "Preferencial", "Urgência", "Outros"]);
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
        
        const unsubFinalizados = getAtendimentosFinalizadosHoje((data) => {
            setFinalizados(data);
        }, (error) => {
            setNotification({ type: 'error', title: "Erro ao carregar finalizados", message: error });
        });

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
        try {
            await clearPainel();
            setNotification({ type: 'success', title: "Painel Limpo!", message: "O painel de senhas foi reiniciado." });
        } catch (error) {
            const err = error as Error;
            setNotification({ type: 'error', title: "Erro ao limpar painel", message: err.message });
        }
    };

    const handleClearHistory = async () => {
        try {
            await clearHistoryChamadas();
            setNotification({ type: 'success', title: "Histórico Limpo!", message: "O histórico de últimas senhas do painel foi limpo." });
        } catch (error) {
            const err = error as Error;
            setNotification({ type: 'error', title: "Erro ao limpar histórico", message: err.message });
        }
    };
    
    return (
        <div className="flex flex-col h-full">
            <Tabs defaultValue="pendentes" className="flex flex-col flex-1">
                 <TabsList className="grid w-full grid-cols-5 sticky top-0 z-10 bg-card">
                    <TabsTrigger value="pendentes">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Senhas Pendentes
                        {pendentes.length > 0 && <Badge variant="destructive" className="ml-2 animate-pulse">{pendentes.length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="em-triagem">
                        <HeartPulse className="mr-2 h-4 w-4" />
                        Em Triagem
                        {emTriagem.length > 0 && <Badge className="ml-2">{emTriagem.length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="fila-atendimento">
                        <Tags className="mr-2 h-4 w-4" />
                        Fila de Atendimento
                        {fila.length > 0 && <Badge className="ml-2">{fila.length}</Badge>}
                    </TabsTrigger>
                     <TabsTrigger value="em-andamento">
                        <Hourglass className="mr-2 h-4 w-4" />
                        Em Andamento
                        {emAtendimento.length > 0 && <Badge className="ml-2">{emAtendimento.length}</Badge>}
                    </TabsTrigger>
                     <TabsTrigger value="finalizados">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Finalizados
                        {finalizados.length > 0 && <Badge variant="secondary" className="ml-2">{finalizados.length}</Badge>}
                    </TabsTrigger>
                </TabsList>
                
                <div className="flex-1 overflow-y-auto mt-4">
                    <TabsContent value="pendentes">
                        <SenhasPendentesList 
                            pendentes={pendentes} 
                            isLoading={isLoading} 
                            onCall={handleChamarParaTriagem}
                            onCancel={setItemToCancel}
                        />
                    </TabsContent>
                    
                    <TabsContent value="em-triagem">
                        <EmTriagemList 
                            emTriagem={emTriagem}
                            isLoading={isLoading}
                            onIdentify={handleCompletarCadastro}
                            onCancel={setItemToCancel}
                        />
                    </TabsContent>

                    <TabsContent value="fila-atendimento">
                        <FilaDeAtendimentoList
                            fila={fila}
                            isLoading={isLoading}
                            onCall={handleChamarParaAtendimento}
                            onEdit={setItemToEdit}
                            onHistory={setItemToHistory}
                            onCancel={setItemToCancel}
                            onAddToQueue={handleAddToQueue}
                            onClearPanel={handleClearPanel}
                            onClearHistory={handleClearHistory}
                        />
                    </TabsContent>

                     <TabsContent value="em-andamento">
                        <EmAndamentoList
                            emAtendimento={emAtendimento}
                            isLoading={isLoading}
                            onReturnToQueue={setItemToReturn}
                            onFinalize={handleFinalizarAtendimento}
                            onCancel={setItemToCancel}
                        />
                    </TabsContent>

                    <TabsContent value="finalizados">
                        <FinalizadosList
                            finalizados={finalizados}
                            isLoading={isLoading}
                            filter={finalizadosFilter}
                            onFilterChange={setFinalizadosFilter}
                        />
                    </TabsContent>
                </div>
            </Tabs>
            
             {/* Dialogs */}
            <AddToQueueDialog
                isOpen={isAddToQueueDialogOpen}
                onOpenChange={setIsAddToQueueDialogOpen}
                pacientes={pacientes}
                departamentos={departamentos}
                classificacoes={activeClassificacoes}
                onAddNewPatient={handleOpenNewPatientDialog}
                patientToAdd={patientToAdd}
                atendimentoParaCompletar={atendimentoParaCompletar}
                onSuccess={(message, description) => setNotification({ type: 'success', title: message, message: description})}
            />

            <PatientDialog
                isOpen={isPatientDialogOpen}
                onOpenChange={setIsPatientDialogOpen}
                onSuccess={handlePatientDialogSuccess}
                paciente={null}
                onNotification={setNotification}
            />

            {itemToEdit && (
                <EditQueueItemDialog
                    isOpen={!!itemToEdit}
                    onOpenChange={() => setItemToEdit(null)}
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
                    onOpenChange={() => setItemToEditFromHistory(null)}
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
                    onOpenChange={() => setItemToHistory(null)}
                    item={itemToHistory}
                    onEdit={handleEditFromHistory}
                />
            )}

            {itemToCancel && (
                <CancelAtendimentoDialog
                    isOpen={!!itemToCancel}
                    onOpenChange={() => setItemToCancel(null)}
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

            {itemToReturn && (
                <ReturnToQueueDialog
                    isOpen={!!itemToReturn}
                    onOpenChange={() => setItemToReturn(null)}
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

    

    
