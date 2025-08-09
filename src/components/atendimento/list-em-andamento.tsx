
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { FilaDeEsperaItem } from "@/types/fila";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, User, Building, Undo2, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "../ui/badge";

interface EmAndamentoListProps {
    emAtendimento: FilaDeEsperaItem[];
    isLoading: boolean;
    onReturnToQueue: (item: FilaDeEsperaItem) => void;
    onFinalize: (item: FilaDeEsperaItem) => void;
    onCancel: (item: FilaDeEsperaItem) => void;
}

export function EmAndamentoList({ emAtendimento, isLoading, onReturnToQueue, onFinalize, onCancel }: EmAndamentoListProps) {
    if (isLoading) {
        return (
            <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                     <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1 space-y-1">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                        <div className="flex items-center gap-2">
                             <Skeleton className="h-7 w-20" />
                             <Skeleton className="h-7 w-24" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }
    
    if (emAtendimento.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full rounded-md border border-dashed py-10">
                <p className="text-muted-foreground">Nenhum paciente em atendimento no momento.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-2">
            {emAtendimento.map((item) => (
                <div key={item.id} className={cn(
                    "flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 transition-colors",
                    item.classificacao === "Urgência" && "border-red-500/30 bg-red-500/5",
                    item.classificacao === "Preferencial" && "border-blue-500/30 bg-blue-500/5",
                    item.classificacao === "Normal" && "border-green-500/30 bg-green-500/5"
                )}>
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                         <Badge variant={
                                item.classificacao === 'Urgência' ? 'destructive' : 
                                item.classificacao === 'Preferencial' ? 'default' : 'secondary'
                            } className={cn("text-base",
                                item.classificacao === 'Preferencial' && 'bg-blue-600 hover:bg-blue-700',
                                item.classificacao === 'Normal' && 'bg-green-600 hover:bg-green-700 text-white'
                            )}>
                            {item.senha}
                        </Badge>
                        <div className="flex-1 min-w-0">
                             <p className="font-semibold text-sm text-primary truncate" title={item.pacienteNome}>{item.pacienteNome}</p>
                             <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5 truncate">
                                    <Building className="h-3 w-3" />
                                    <span className="truncate" title={item.departamentoNome}>{item.departamentoNome}{item.departamentoNumero ? ` - Sala ${item.departamentoNumero}` : ''}</span>
                                </div>
                                <div className="flex items-center gap-1.5 truncate">
                                    <User className="h-3 w-3" />
                                    <span className="truncate" title={item.profissionalNome}>{item.profissionalNome}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="flex items-center gap-4 ml-4">
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                             {item.chamadaEm ? `Chamado ${formatDistanceToNow(item.chamadaEm.toDate(), { addSuffix: true, locale: ptBR })}` : 'Aguardando'}
                        </p>
                        <div className="flex gap-1.5">
                            <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => onReturnToQueue(item)}>
                                <Undo2 className="mr-1 h-3 w-3" />
                                Retornar
                            </Button>
                             <Button size="sm" className="h-7 bg-green-600 hover:bg-green-700 text-xs px-2" onClick={() => onFinalize(item)}>
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Finalizar
                            </Button>
                            <Button size="sm" variant="destructive" className="h-7 text-xs px-2" onClick={() => onCancel(item)}>
                                <XCircle className="mr-1 h-3 w-3" />
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
