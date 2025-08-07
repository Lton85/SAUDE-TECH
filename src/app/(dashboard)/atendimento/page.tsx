
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Megaphone, Clock, PlusCircle, MoreHorizontal, Pencil, Trash2, FileText, CheckCircle, Hourglass, Undo2, Eraser } from "lucide-react";
import { getFilaDeEspera, deleteFilaItem, chamarPaciente, getAtendimentosEmAndamento, finalizarAtendimento, retornarPacienteParaFila, updateFilaItem, updateHistoricoItem } from "@/services/filaDeEsperaService";
import type { FilaDeEsperaItem } from "@/types/fila";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from "@/components/ui/skeleton";
import { AddToQueueDialog } from "@/components/atendimento/add-to-queue-dialog";
import type { Paciente } from "@/types/paciente";
import type { Departamento } from "@/types/departamento";
import { getPacientesRealtime } from "@/services/pacientesService";
import { getDepartamentos } from "@/services/departamentosService";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { DeleteQueueItemDialog } from "@/components/atendimento/delete-dialog";
import { EditQueueItemDialog } from "@/components/atendimento/edit-dialog";
import { ProntuarioDialog } from "@/components/atendimento/prontuario-dialog";
import { getProfissionais } from "@/services/profissionaisService";
import { ReturnToQueueDialog } from "@/components/atendimento/return-to-queue-dialog";
import { PatientDialog } from "@/components/patients/patient-dialog";
import { cn } from "@/lib/utils";
import { clearPainel, getUltimaChamada } from "@/services/chamadasService";


function TempoDeEspera({ chegadaEm }: { chegadaEm: FilaDeEsperaItem['chegadaEm'] }) {
    const [tempoDeEspera, setTempoDeEspera] = useState("");

    useEffect(() => {
        const updateTempo = () => {
             if (chegadaEm) {
                const chegada = chegadaEm.toDate(); // Convert Firestore Timestamp to JS Date
                setTempoDeEspera(formatDistanceToNow(chegada, { addSuffix: true, locale: ptBR }));
            }
        };

        updateTempo();
        const interval = setInterval(updateTempo, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [chegadaEm]);

    return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{tempoDeEspera}</span>
        </div>
    );
}

interface Profissional {
  id: string;
  nome: string;
}

export default function AtendimentoPage() {
    const [fila, setFila] = useState<FilaDeEsperaItem[]>([]);
    const [emAtendimento, setEmAtendimento] = useState<FilaDeEsperaItem[]>([]);
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [profissionais, setProfissionais] = useState<Profissional[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddToQueueDialogOpen, setIsAddToQueueDialogOpen] = useState(false);
    const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<FilaDeEsperaItem | null>(null);
    const [itemToEdit, setItemToEdit] = useState<FilaDeEsperaItem | null>(null);
    const [itemToEditFromHistory, setItemToEditFromHistory] = useState<FilaDeEsperaItem | null>(null);
    const [itemToHistory, setItemToHistory] = useState<FilaDeEsperaItem | null>(null);
    const [itemToReturn, setItemToReturn] = useState<FilaDeEsperaItem | null>(null);
    const [patientToAdd, setPatientToAdd] = useState<Paciente | null>(null);
    const router = useRouter();

    const { toast } = useToast();
    
    const fetchPacientes = () => {
       return getPacientesRealtime(
            (data) => setPacientes(data),
            (error) => {
                toast({
                    title: "Erro ao carregar pacientes",
                    description: error,
                    variant: "destructive",
                });
            }
        );
    }

    useEffect(() => {
        const fetchData = async () => {
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

        fetchData();

        const unsubscribePacientes = fetchPacientes();

        const unsubscribeFila = getFilaDeEspera((data) => {
            setFila(data);
            setIsLoading(false);
        }, (error) => {
            toast({
                title: "Erro ao carregar a fila",
                description: error,
                variant: "destructive",
            });
            setIsLoading(false);
        });
        
        const unsubscribeEmAtendimento = getAtendimentosEmAndamento((data) => {
            const sortedData = data.sort((a, b) => {
                if (a.chamadaEm && b.chamadaEm) {
                    return b.chamadaEm.toDate().getTime() - a.chamadaEm.toDate().getTime();
                }
                return 0;
            });
            setEmAtendimento(sortedData);
        }, (error) => {
             toast({
                title: "Erro ao carregar atendimentos",
                description: error,
                variant: "destructive",
            });
        });

        return () => {
            unsubscribePacientes();
            unsubscribeFila();
            if (unsubscribeEmAtendimento) unsubscribeEmAtendimento();
        };
    }, [toast]);
    
    const handleOpenNewPatientDialog = () => {
        setIsAddToQueueDialogOpen(false);
        setIsPatientDialogOpen(true);
    };

    const handlePatientDialogSuccess = (newPatient: Paciente) => {
        setIsPatientDialogOpen(false);
        setPatientToAdd(newPatient); // Store the new patient
        setTimeout(() => setIsAddToQueueDialogOpen(true), 100);
    };
    
    const handleChamarPaciente = async (item: FilaDeEsperaItem) => {
        try {
            await chamarPaciente(item);
            toast({
                title: "Paciente Chamado!",
                description: `${item.pacienteNome} foi chamado(a) no painel.`,
                className: "bg-green-500 text-white"
            });
        } catch (error) {
             toast({
                title: "Erro ao chamar paciente",
                description: (error as Error).message,
                variant: "destructive",
            });
        }
    };
    
    const handleClearPainel = async () => {
        try {
            await clearPainel();
             toast({
                title: "Painel Limpo!",
                description: `O painel de senhas foi redefinido.`,
            });
        } catch (error) {
             toast({
                title: "Erro ao limpar o painel",
                description: (error as Error).message,
                variant: "destructive",
            });
        }
    };

    const handleFinalizarAtendimento = async (item: FilaDeEsperaItem) => {
        try {
            await finalizarAtendimento(item.id);
             toast({
                title: "Atendimento Finalizado!",
                description: `O atendimento de ${item.pacienteNome} foi concluído.`,
            });
        } catch (error) {
             toast({
                title: "Erro ao finalizar",
                description: (error as Error).message,
                variant: "destructive",
            });
        }
    };
    
    const handleReturnToQueue = (item: FilaDeEsperaItem) => {
        setItemToReturn(item);
    };

    const handleReturnToQueueConfirm = async (item: FilaDeEsperaItem, updates: Partial<FilaDeEsperaItem>) => {
        try {
            // First, update the item with any changes
            await updateFilaItem(item.id, updates);

            // Then, return the patient to the queue
            await retornarPacienteParaFila(item.id);
            
            // Check if the returned patient is the one on the panel
            const ultimaChamada = await getUltimaChamada();
            if (ultimaChamada?.atendimentoId === item.id) {
                await clearPainel();
            }

            toast({
                title: "Paciente Retornou para a Fila!",
                description: `${item.pacienteNome} foi retornado para a fila de espera.`,
                variant: "default"
            });
        } catch (error) {
            toast({
                title: "Erro ao retornar paciente",
                description: (error as Error).message,
                variant: "destructive",
            });
        } finally {
            setItemToReturn(null);
        }
    };

    
    const handleEdit = (item: FilaDeEsperaItem) => {
        setItemToEdit(item);
    };

    const handleEditFromHistory = (item: FilaDeEsperaItem) => {
        setItemToHistory(null); // Close history dialog
        setItemToEditFromHistory(item); // Open edit dialog for history item
    };
    
    const handleDelete = (item: FilaDeEsperaItem) => {
        setItemToDelete(item);
    };
    
    const handleHistory = (item: FilaDeEsperaItem) => {
        setItemToHistory(item);
    };

    const handleDeleteConfirm = async () => {
        if (itemToDelete) {
            try {
                await deleteFilaItem(itemToDelete.id);
                toast({
                    title: "Item removido da fila!",
                    description: `${itemToDelete.pacienteNome} foi removido(a) da fila de atendimento.`,
                });
            } catch (error) {
                toast({
                    title: "Erro ao remover da fila",
                    description: (error as Error).message,
                    variant: "destructive",
                });
            } finally {
                setItemToDelete(null);
            }
        }
    };
    
    return (
        <>
            <div className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Fila de Atendimento</CardTitle>
                            <CardDescription>Pacientes aguardando para serem chamados.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button onClick={() => { setPatientToAdd(null); setIsAddToQueueDialogOpen(true); }}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Adicionar Paciente à Fila
                            </Button>
                            <Button onClick={handleClearPainel} variant="destructive" size="icon" className="h-9 w-9">
                                <Eraser className="h-4 w-4" />
                                <span className="sr-only">Limpar Painel</span>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="px-2 py-2 text-xs">Nome</TableHead>
                                    <TableHead className="px-2 py-2 text-xs">Senha</TableHead>
                                    <TableHead className="px-2 py-2 text-xs">Classificação</TableHead>
                                    <TableHead className="px-2 py-2 text-xs">Departamento</TableHead>
                                    <TableHead className="px-2 py-2 text-xs">Profissional</TableHead>
                                    <TableHead className="text-right px-2 py-2 text-xs">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    [...Array(3)].map((_, i) => (
                                        <TableRow key={i}>
                                            {[...Array(6)].map((_, j) => (
                                                <TableCell key={j} className="px-2 py-1"><Skeleton className="h-5 w-full" /></TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : fila.length > 0 ? (
                                    fila.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-muted/50">
                                            <TableCell className="font-medium px-2 py-1 text-xs">{item.pacienteNome}</TableCell>
                                            <TableCell className="px-2 py-1 text-xs"><Badge variant="secondary">{item.senha}</Badge></TableCell>
                                            <TableCell className="px-2 py-1 text-xs">
                                                <Badge
                                                    className={cn(
                                                        'text-xs',
                                                        item.classificacao === 'Urgência' && 'bg-red-500 text-white hover:bg-red-600',
                                                        item.classificacao === 'Preferencial' && 'bg-amber-500 text-white hover:bg-amber-600',
                                                        item.classificacao === 'Normal' && 'bg-green-500 text-white hover:bg-green-600'
                                                    )}
                                                >
                                                    {item.classificacao}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-2 py-1 text-xs">{item.departamentoNome}{item.departamentoNumero ? ` - Sala ${item.departamentoNumero}` : ''}</TableCell>
                                            <TableCell className="px-2 py-1 text-xs">{item.profissionalNome}</TableCell>
                                            <TableCell className="text-right px-2 py-1 text-xs">
                                                <div className="flex items-center justify-end gap-2">
                                                    <TempoDeEspera chegadaEm={item.chegadaEm}/>
                                                    <Button size="sm" onClick={() => handleChamarPaciente(item)} className="h-7 px-2 text-xs">
                                                        <Megaphone className="mr-2 h-3 w-3" />
                                                        Chamar
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-7 w-7 p-0">
                                                                <span className="sr-only">Abrir menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Outras Ações</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                <span>Editar</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleHistory(item)}>
                                                                <FileText className="mr-2 h-4 w-4" />
                                                                <span>Prontuário</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(item)}>
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span>Excluir da Fila</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center">
                                            Nenhum paciente aguardando atendimento.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="py-3 px-6 border-t">
                        <div className="text-xs text-muted-foreground">
                            Exibindo <strong>{fila.length}</strong> {fila.length === 1 ? 'registro' : 'registros'}
                        </div>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Hourglass className="h-5 w-5 text-primary" />
                            Atendimentos em Andamento
                        </CardTitle>
                        <CardDescription>Pacientes que já foram chamados e estão sendo atendidos.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="px-2 py-2 text-xs">Nome</TableHead>
                                    <TableHead className="px-2 py-2 text-xs">Classificação</TableHead>
                                    <TableHead className="px-2 py-2 text-xs">Departamento</TableHead>
                                    <TableHead className="px-2 py-2 text-xs">Profissional</TableHead>
                                    <TableHead className="px-2 py-2 text-xs">Horário da Chamada</TableHead>
                                    <TableHead className="text-right px-2 py-2 text-xs">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="px-2 py-1"><Skeleton className="h-5 w-full" /></TableCell>
                                    </TableRow>
                                ) : emAtendimento.length > 0 ? (
                                    emAtendimento.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-muted/50">
                                            <TableCell className="font-medium px-2 py-1 text-xs">{item.pacienteNome}</TableCell>
                                            <TableCell className="px-2 py-1 text-xs">
                                                <Badge
                                                    className={cn(
                                                        'text-xs',
                                                        item.classificacao === 'Urgência' && 'bg-red-500 text-white hover:bg-red-600',
                                                        item.classificacao === 'Preferencial' && 'bg-amber-500 text-white hover:bg-amber-600',
                                                        item.classificacao === 'Normal' && 'bg-green-500 text-white hover:bg-green-600'
                                                    )}
                                                >
                                                    {item.classificacao}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-2 py-1 text-xs">{item.departamentoNome}{item.departamentoNumero ? ` - Sala ${item.departamentoNumero}` : ''}</TableCell>
                                            <TableCell className="px-2 py-1 text-xs">{item.profissionalNome}</TableCell>
                                            <TableCell className="px-2 py-1 text-xs">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {item.chamadaEm ? new Date(item.chamadaEm.seconds * 1000).toLocaleTimeString('pt-BR') : 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right px-2 py-1 text-xs">
                                            <div className="flex items-center justify-end gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => handleReturnToQueue(item)} className="h-7 px-2 text-xs border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700">
                                                        <Undo2 className="mr-2 h-3 w-3" />
                                                        Retornar à Fila
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={() => handleFinalizarAtendimento(item)} className="h-7 px-2 text-xs border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700">
                                                        <CheckCircle className="mr-2 h-3 w-3" />
                                                        Finalizar Atendimento
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            Nenhum paciente em atendimento no momento.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="py-3 px-6 border-t">
                        <div className="text-xs text-muted-foreground">
                            Exibindo <strong>{emAtendimento.length}</strong> {emAtendimento.length === 1 ? 'registro' : 'registros'}
                        </div>
                    </CardFooter>
                </Card>
            </div>


            <AddToQueueDialog
                isOpen={isAddToQueueDialogOpen}
                onOpenChange={setIsAddToQueueDialogOpen}
                pacientes={pacientes}
                departamentos={departamentos}
                onAddNewPatient={handleOpenNewPatientDialog}
                patientToAdd={patientToAdd}
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
            
            {itemToReturn && (
                <ReturnToQueueDialog
                    isOpen={!!itemToReturn}
                    onOpenChange={() => setItemToReturn(null)}
                    item={itemToReturn}
                    departamentos={departamentos}
                    profissionais={profissionais}
                    onConfirm={handleReturnToQueueConfirm}
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
                    onConfirm={handleDeleteConfirm}
                    itemName={itemToDelete.pacienteNome || ''}
                />
            )}
        </>
    );
}
