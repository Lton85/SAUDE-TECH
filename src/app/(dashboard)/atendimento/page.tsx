
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, MoreHorizontal, Pencil, Trash2, FileText, CheckCircle, Hourglass, Undo2 } from "lucide-react";
import { getFilaDeEspera, deleteFilaItem, chamarPaciente, getAtendimentosEmAndamento, finalizarAtendimento, retornarPacienteParaFila, updateFilaItem, updateHistoricoItem } from "@/services/filaDeEsperaService";
import type { FilaDeEsperaItem } from "@/types/fila";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getDepartamentos } from "@/services/departamentosService";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ProntuarioDialog } from "@/components/atendimento/prontuario-dialog";
import { getProfissionais } from "@/services/profissionaisService";
import { ReturnToQueueDialog } from "@/components/atendimento/return-to-queue-dialog";
import { cn } from "@/lib/utils";
import { clearPainel, getUltimaChamada } from "@/services/chamadasService";
import type { Departamento } from "@/types/departamento";
import { EditQueueItemDialog } from "@/components/atendimento/edit-dialog";


interface Profissional {
  id: string;
  nome: string;
}

export default function AtendimentoPage() {
    const [emAtendimento, setEmAtendimento] = useState<FilaDeEsperaItem[]>([]);
    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [profissionais, setProfissionais] = useState<Profissional[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [itemToEditFromHistory, setItemToEditFromHistory] = useState<FilaDeEsperaItem | null>(null);
    const [itemToHistory, setItemToHistory] = useState<FilaDeEsperaItem | null>(null);
    const [itemToReturn, setItemToReturn] = useState<FilaDeEsperaItem | null>(null);
    const router = useRouter();

    const { toast } = useToast();
    
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

        const unsubscribeEmAtendimento = getAtendimentosEmAndamento((data) => {
            const sortedData = data.sort((a, b) => {
                if (a.chamadaEm && b.chamadaEm) {
                    return b.chamadaEm.toDate().getTime() - a.chamadaEm.toDate().getTime();
                }
                return 0;
            });
            setEmAtendimento(sortedData);
            setIsLoading(false);
        }, (error) => {
             toast({
                title: "Erro ao carregar atendimentos",
                description: error,
                variant: "destructive",
            });
            setIsLoading(false);
        });

        return () => {
            if (unsubscribeEmAtendimento) unsubscribeEmAtendimento();
        };
    }, [toast]);
    
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

    const handleEditFromHistory = (item: FilaDeEsperaItem) => {
        setItemToHistory(null); // Close history dialog
        setItemToEditFromHistory(item); // Open edit dialog for history item
    };
    
    const handleHistory = (item: FilaDeEsperaItem) => {
        setItemToHistory(item);
    };
    
    return (
        <>
            <div className="space-y-6">
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
                                    [...Array(3)].map((_, i) => (
                                         <TableRow key={i}>
                                            {[...Array(6)].map((_, j) => (
                                                <TableCell key={j} className="px-2 py-1"><Skeleton className="h-5 w-full" /></TableCell>
                                            ))}
                                        </TableRow>
                                    ))
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
        </>
    );
}
