"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Megaphone, Clock, PlusCircle, MoreHorizontal, Pencil, Trash2, History, Users } from "lucide-react";
import { getFilaDeEspera, deleteFilaItem, chamarPaciente } from "@/services/filaDeEsperaService";
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
import { HistoryQueueItemDialog } from "@/components/atendimento/history-dialog";


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

export default function AtendimentoPage() {
    const [fila, setFila] = useState<FilaDeEsperaItem[]>([]);
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddToQueueDialogOpen, setIsAddToQueueDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<FilaDeEsperaItem | null>(null);
    const [itemToEdit, setItemToEdit] = useState<FilaDeEsperaItem | null>(null);
    const [itemToHistory, setItemToHistory] = useState<FilaDeEsperaItem | null>(null);

    const { toast } = useToast();

    useEffect(() => {
        getDepartamentos()
            .then(data => setDepartamentos(data.filter(d => d.situacao === 'Ativo')))
            .catch(error => {
                toast({
                    title: "Erro ao carregar departamentos",
                    description: "Não foi possível carregar a lista de departamentos.",
                    variant: "destructive",
                });
            });

        const unsubscribePacientes = getPacientesRealtime(
            (data) => setPacientes(data),
            (error) => {
                toast({
                    title: "Erro ao carregar pacientes",
                    description: error,
                    variant: "destructive",
                });
            }
        );

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

        return () => {
            unsubscribePacientes();
            unsubscribeFila();
        };
    }, [toast]);

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
    
    const handleEdit = (item: FilaDeEsperaItem) => {
        setItemToEdit(item);
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
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Fila de Atendimento</CardTitle>
                    <CardDescription>Pacientes aguardando para serem chamados.</CardDescription>
                </div>
                <Button onClick={() => setIsAddToQueueDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Paciente à Fila
                </Button>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[30%] px-2 py-2 text-xs">Nome</TableHead>
                            <TableHead className="px-2 py-2 text-xs">Senha</TableHead>
                            <TableHead className="px-2 py-2 text-xs">Departamento</TableHead>
                            <TableHead className="px-2 py-2 text-xs">Médico</TableHead>
                            <TableHead className="text-right px-2 py-2 text-xs">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(3)].map((_, i) => (
                                <TableRow key={i}>
                                    {[...Array(5)].map((_, j) => (
                                        <TableCell key={j} className="px-2 py-1"><Skeleton className="h-5 w-full" /></TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : fila.length > 0 ? (
                            fila.map((item) => (
                                <TableRow key={item.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium px-2 py-1 text-xs">{item.pacienteNome}</TableCell>
                                    <TableCell className="px-2 py-1 text-xs"><Badge variant="secondary">{item.senha}</Badge></TableCell>
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
                                                        <History className="mr-2 h-4 w-4" />
                                                        <span>Histórico</span>
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
                                <TableCell colSpan={5} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <Users className="h-16 w-16 text-muted-foreground/30" />
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-semibold text-muted-foreground">Fila Vazia</h3>
                                            <p className="text-sm text-muted-foreground">Nenhum paciente aguardando atendimento no momento.</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>


        <AddToQueueDialog
            isOpen={isAddToQueueDialogOpen}
            onOpenChange={setIsAddToQueueDialogOpen}
            pacientes={pacientes}
            departamentos={departamentos}
        />

        {itemToEdit && (
            <EditQueueItemDialog
                isOpen={!!itemToEdit}
                onOpenChange={() => setItemToEdit(null)}
                item={itemToEdit}
            />
        )}
        
        {itemToHistory && (
             <HistoryQueueItemDialog
                isOpen={!!itemToHistory}
                onOpenChange={() => setItemToHistory(null)}
                item={itemToHistory}
            />
        )}

        {itemToDelete && (
            <DeleteQueueItemDialog
                isOpen={!!itemToDelete}
                onOpenChange={() => setItemToDelete(null)}
                onConfirm={handleDeleteConfirm}
                itemName={itemToDelete.pacienteNome}
            />
        )}
        </>
    );
}
