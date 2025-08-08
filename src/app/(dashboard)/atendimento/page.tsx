
"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFilaDeEspera, getAtendimentosPendentes, deleteFilaItem, chamarPaciente, getAtendimentosEmAndamento, finalizarAtendimento, retornarPacienteParaFila, updateFilaItem, updateHistoricoItem, getAtendimentosEmTriagem, getAtendimentosFinalizadosHoje } from "@/services/filaDeEsperaService";
import type { FilaDeEsperaItem } from "@/types/fila";
import { useToast } from "@/hooks/use-toast";
import type { Paciente } from "@/types/paciente";
import type { Departamento } from "@/types/departamento";
import { getPacientesRealtime } from "@/services/pacientesService";
import { getDepartamentos } from "@/services/departamentosService";
import { getProfissionais } from "@/services/profissionaisService";
import { PatientDialog } from "@/components/patients/patient-dialog";
import { AddToQueueDialog } from "@/components/atendimento/add-to-queue-dialog";
import { EditQueueItemDialog } from "@/components/atendimento/edit-dialog";
import { DeleteQueueItemDialog } from "@/components/atendimento/delete-dialog";
import { ProntuarioDialog } from "@/components/atendimento/prontuario-dialog";
import { ReturnToQueueDialog } from "@/components/atendimento/return-to-queue-dialog";
import { SenhasPendentesList } from "@/components/atendimento/list-pendentes";
import { EmTriagemList } from "@/components/atendimento/list-em-triagem";
import { FilaDeAtendimentoList } from "@/components/atendimento/list-fila-atendimento";
import { EmAndamentoList } from "@/components/atendimento/list-em-andamento";
import { FinalizadosList } from "@/components/atendimento/list-finalizados";
import { AlertTriangle, Fingerprint, Hourglass, Tags, User, FileText, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { clearPainel } from "@/services/chamadasService";


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
    
    // UI states
    const [isLoading, setIsLoading] = useState(true);
    const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
    const [isAddToQueueDialogOpen, setIsAddToQueueDialogOpen] = useState(false);
    
    // Dialog item states
    const [itemToDelete, setItemToDelete] = useState<FilaDeEsperaItem | null>(null);
    const [itemToEdit, setItemToEdit] = useState<FilaDeEsperaItem | null>(null);
    const [itemToEditFromHistory, setItemToEditFromHistory] = useState<FilaDeEsperaItem | null>(null);
    const [itemToHistory, setItemToHistory] = useState<FilaDeEsperaItem | null>(null);
    const [itemToReturn, setItemToReturn] = useState<FilaDeEsperaItem | null>(null);
    const [patientToAdd, setPatientToAdd] = useState<Paciente | null>(null);
    const [atendimentoParaCompletar, setAtendimentoParaCompletar] = useState<FilaDeEsperaItem | null>(null);
    
    const { toast } = useToast();

    // Data Fetching and Realtime Subscriptions
    useEffect(() => {
        const fetchSupportData = async () => {
             try {
                const [deptoData, profissionaisData] = await Promise.all([
                    getDepartamentos(),
                    getProfissionais(),
                ]);

                setDepartamentos(deptoData.filter(d => d.situacao === 'Ativo'));
                const profissionaisList = profissionaisData.map(m => ({ id: m.id, nome: `Dr(a). ${m.nome}` }));
                setProfissionais([...profissionaisList].sort((a,b) => a.nome.localeCompare(b.nome)));

             } catch (error) {
                  toast({
                    title: "Erro ao carregar dados de apoio",
                    description: "Não foi possível carregar departamentos ou profissionais.",
                    variant: "destructive",
                });
             }
        }
        fetchSupportData();

        const unsubPacientes = getPacientesRealtime(setPacientes, (error) => toast({ title: "Erro ao carregar pacientes", description: error, variant: "destructive" }));
        
        const unsubPendentes = getAtendimentosPendentes((data) => {
            setPendentes(data.sort((a, b) => (a.chegadaEm?.toDate().getTime() ?? 0) - (b.chegadaEm?.toDate().getTime() ?? 0)));
            setIsLoading(false);
        }, (error) => {
             toast({ title: "Erro ao carregar senhas pendentes", description: error, variant: "destructive" });
             setIsLoading(false);
        });

        const unsubEmTriagem = getAtendimentosEmTriagem((data) => {
            setEmTriagem(data.sort((a, b) => (b.chamadaEm?.toDate().getTime() ?? 0) - (a.chamadaEm?.toDate().getTime() ?? 0)));
        }, (error) => toast({ title: "Erro ao carregar senhas em triagem", description: error, variant: "destructive" }));
        
        const unsubFila = getFilaDeEspera((data) => {
            setFila(data);
            setIsLoading(false);
        }, (error) => {
            toast({ title: "Erro ao carregar a fila", description: error, variant: "destructive" });
            setIsLoading(false);
        });

        const unsubEmAtendimento = getAtendimentosEmAndamento((data) => {
            setEmAtendimento(data.sort((a, b) => (b.chamadaEm?.toDate().getTime() ?? 0) - (a.chamadaEm?.toDate().getTime() ?? 0)));
            setIsLoading(false);
        }, (error) => {
            toast({ title: "Erro ao carregar atendimentos", description: error, variant: "destructive" });
            setIsLoading(false);
        });
        
        const unsubFinalizados = getAtendimentosFinalizadosHoje((data) => {
            setFinalizados(data);
        }, (error) => {
            toast({ title: "Erro ao carregar finalizados", description: error, variant: "destructive" });
        });

        return () => {
            unsubPacientes();
            unsubPendentes();
            unsubEmTriagem();
            unsubFila();
            unsubEmAtendimento();
            unsubFinalizados();
        };
    }, [toast]);
    
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
             toast({ title: "Senha Chamada!", description: `A senha ${item.senha} foi chamada para a triagem.` });
        } catch (error) {
             toast({ title: "Erro ao chamar senha", description: (error as Error).message, variant: "destructive" });
        }
    };

    const handleChamarParaAtendimento = async (item: FilaDeEsperaItem) => {
        try {
            await chamarPaciente(item, 'atendimento');
            toast({ title: "Paciente Chamado!", description: `${item.pacienteNome} foi chamado para atendimento.` });
        } catch (error) {
            toast({ title: "Erro ao chamar paciente", description: (error as Error).message, variant: "destructive" });
        }
    };
    
    const handleFinalizarAtendimento = async (item: FilaDeEsperaItem) => {
        try {
            await finalizarAtendimento(item.id);
            toast({
                title: "Atendimento Finalizado!",
                description: `O atendimento de ${item.pacienteNome} foi finalizado.`,
                className: "bg-green-500 text-white"
            });
        } catch (error) {
            toast({ title: "Erro ao finalizar", description: (error as Error).message, variant: "destructive" });
        }
    };
    
    const handleEditFromHistory = (item: FilaDeEsperaItem) => {
        setItemToHistory(null); // Close history dialog
        setItemToEditFromHistory(item); // Open edit dialog for history item
    };

    const handleClearPanel = async () => {
        try {
            await clearPainel();
            toast({
                title: "Painel Limpo!",
                description: "O painel de senhas foi reiniciado.",
            });
        } catch (error) {
            toast({
                title: "Erro ao limpar painel",
                description: (error as Error).message,
                variant: "destructive",
            });
        }
    };
    
    return (
        <>
            <Tabs defaultValue="pendentes" className="w-full">
                 <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="pendentes">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Senhas Pendentes
                        {pendentes.length > 0 && <Badge variant="destructive" className="ml-2 animate-pulse">{pendentes.length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="em-triagem">
                        <Fingerprint className="mr-2 h-4 w-4" />
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
                
                <TabsContent value="pendentes" className="mt-4">
                    <SenhasPendentesList 
                        pendentes={pendentes} 
                        isLoading={isLoading} 
                        onCall={handleChamarParaTriagem}
                        onDelete={setItemToDelete}
                    />
                </TabsContent>
                
                <TabsContent value="em-triagem" className="mt-4">
                    <EmTriagemList 
                        emTriagem={emTriagem}
                        isLoading={isLoading}
                        onIdentify={handleCompletarCadastro}
                    />
                </TabsContent>

                <TabsContent value="fila-atendimento" className="mt-4">
                    <FilaDeAtendimentoList
                        fila={fila}
                        isLoading={isLoading}
                        onCall={handleChamarParaAtendimento}
                        onEdit={setItemToEdit}
                        onHistory={setItemToHistory}
                        onDelete={setItemToDelete}
                        onAddToQueue={handleAddToQueue}
                        onClearPanel={handleClearPanel}
                    />
                </TabsContent>

                 <TabsContent value="em-andamento" className="mt-4">
                    <EmAndamentoList
                        emAtendimento={emAtendimento}
                        isLoading={isLoading}
                        onReturnToQueue={setItemToReturn}
                        onFinalize={handleFinalizarAtendimento}
                    />
                </TabsContent>

                <TabsContent value="finalizados" className="mt-4">
                    <FinalizadosList
                        finalizados={finalizados}
                        isLoading={isLoading}
                    />
                </TabsContent>
            </Tabs>
            
             {/* Dialogs */}
            <AddToQueueDialog
                isOpen={isAddToQueueDialogOpen}
                onOpenChange={setIsAddToQueueDialogOpen}
                pacientes={pacientes}
                departamentos={departamentos}
                onAddNewPatient={handleOpenNewPatientDialog}
                patientToAdd={patientToAdd}
                atendimentoParaCompletar={atendimentoParaCompletar}
                onSuccess={() => {}}
            />

            <PatientDialog
                isOpen={isPatientDialogOpen}
                onOpenChange={setIsPatientDialogOpen}
                onSuccess={handlePatientDialogSuccess}
                paciente={null}
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

            {itemToDelete && (
                <DeleteQueueItemDialog
                    isOpen={!!itemToDelete}
                    onOpenChange={() => setItemToDelete(null)}
                    onConfirm={async () => {
                        if (itemToDelete) {
                            try {
                                await deleteFilaItem(itemToDelete.id);
                                toast({ title: "Item removido!", description: `O item com a senha ${itemToDelete.senha} foi removido.` });
                            } catch (error) {
                                toast({ title: "Erro ao remover", description: (error as Error).message, variant: "destructive" });
                            } finally {
                                setItemToDelete(null);
                            }
                        }
                    }}
                    itemName={itemToDelete.pacienteNome || `Senha ${itemToDelete.senha}`}
                />
            )}

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
                            toast({ title: "Paciente Retornou para a Fila!", description: `${item.pacienteNome} está de volta na fila.` });
                        } catch (error) {
                            toast({ title: "Erro ao retornar paciente", description: (error as Error).message, variant: "destructive" });
                        } finally {
                            setItemToReturn(null);
                        }
                    }}
                />
            )}
        </>
    );
}
