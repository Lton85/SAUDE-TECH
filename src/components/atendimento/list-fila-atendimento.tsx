
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { FilaDeEsperaItem } from "@/types/fila";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, User, Building, Pencil, FileText, Trash2, Megaphone, PlusCircle, Eraser } from "lucide-react";
import { Badge } from "../ui/badge";

interface FilaDeAtendimentoListProps {
    fila: FilaDeEsperaItem[];
    isLoading: boolean;
    onCall: (item: FilaDeEsperaItem) => void;
    onEdit: (item: FilaDeEsperaItem) => void;
    onHistory: (item: FilaDeEsperaItem) => void;
    onDelete: (item: FilaDeEsperaItem) => void;
    onAddToQueue: () => void;
    onClearPanel: () => void;
}

export function FilaDeAtendimentoList({ fila, isLoading, onCall, onEdit, onHistory, onDelete, onAddToQueue, onClearPanel }: FilaDeAtendimentoListProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Fila de Atendimento</CardTitle>
                        <CardDescription>Pacientes aguardando para serem chamados.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={onAddToQueue}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar na Fila
                        </Button>
                        <Button variant="destructive" size="icon" onClick={onClearPanel} className="h-9 w-9">
                            <Eraser className="h-4 w-4" />
                            <span className="sr-only">Limpar Painel</span>
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px] px-3 py-2 text-xs">Senha</TableHead>
                            <TableHead className="px-3 py-2 text-xs">Paciente</TableHead>
                            <TableHead className="px-3 py-2 text-xs">Departamento</TableHead>
                            <TableHead className="px-3 py-2 text-xs">Profissional</TableHead>
                            <TableHead className="w-[150px] px-3 py-2 text-xs">Tempo de Espera</TableHead>
                            <TableHead className="w-[150px] text-right px-3 py-2 text-xs">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(3)].map((_, i) => (
                                <TableRow key={i}>
                                    {[...Array(6)].map((_, j) => (
                                        <TableCell key={j} className="px-3 py-2 text-xs">
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : fila.length > 0 ? (
                            fila.map((item) => (
                                <TableRow key={item.id} className={cn(
                                    item.classificacao === 'Urgência' && "bg-red-500/10 hover:bg-red-500/20",
                                    item.classificacao === 'Preferencial' && "bg-amber-500/10 hover:bg-amber-500/20",
                                    item.classificacao === 'Normal' && "bg-green-500/10 hover:bg-green-500/20"
                                )}>
                                    <TableCell className="font-mono px-3 py-2 text-sm font-bold">
                                        <Badge variant={
                                            item.classificacao === 'Urgência' ? 'destructive' : 
                                            item.classificacao === 'Preferencial' ? 'default' : 'secondary'
                                        } className={cn(
                                            item.classificacao === 'Preferencial' && 'bg-amber-500 hover:bg-amber-600',
                                            item.classificacao === 'Normal' && 'bg-green-600 hover:bg-green-700 text-white'
                                        )}>
                                            {item.senha}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium px-3 py-2 text-xs">{item.pacienteNome}</TableCell>
                                    <TableCell className="px-3 py-2 text-xs">{item.departamentoNome}{item.departamentoNumero ? ` - Sala ${item.departamentoNumero}` : ''}</TableCell>
                                    <TableCell className="px-3 py-2 text-xs">{item.profissionalNome}</TableCell>
                                    <TableCell className="px-3 py-2 text-xs">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-3 w-3" />
                                            {formatDistanceToNow(item.chegadaEm.toDate(), { addSuffix: true, locale: ptBR })}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-3 py-2">
                                         <div className="flex items-center justify-end gap-1">
                                             <Button variant="default" size="sm" className="h-7 px-2 text-xs" onClick={() => onCall(item)}>
                                                <Megaphone className="mr-1 h-3 w-3" />
                                                Chamar
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(item)}>
                                                <Pencil className="h-3 w-3" />
                                                <span className="sr-only">Editar</span>
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onHistory(item)}>
                                                <FileText className="h-3 w-3" />
                                                <span className="sr-only">Prontuário</span>
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => onDelete(item)}>
                                                <Trash2 className="h-3 w-3" />
                                                <span className="sr-only">Excluir</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Nenhum paciente aguardando atendimento.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
