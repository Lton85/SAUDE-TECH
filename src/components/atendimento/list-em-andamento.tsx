
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { FilaDeEsperaItem } from "@/types/fila";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, User, Building, Undo2, CheckCircle } from "lucide-react";

interface EmAndamentoListProps {
    emAtendimento: FilaDeEsperaItem[];
    isLoading: boolean;
    onReturnToQueue: (item: FilaDeEsperaItem) => void;
    onFinalize: (item: FilaDeEsperaItem) => void;
}

export function EmAndamentoList({ emAtendimento, isLoading, onReturnToQueue, onFinalize }: EmAndamentoListProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4 space-y-3">
                            <Skeleton className="h-6 w-1/4" />
                            <Skeleton className="h-5 w-3/4" />
                            <div className="space-y-2 pt-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-8 w-1/2" />
                            </div>
                        </CardContent>
                    </Card>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {emAtendimento.map((item) => (
                <Card key={item.id} className={cn(
                    "flex flex-col justify-between shadow-sm hover:shadow-lg transition-shadow",
                    item.classificacao === "Urgência" && "border-red-500/50",
                    item.classificacao === "Preferencial" && "border-amber-500/50"
                )}>
                    <CardContent className="p-3 space-y-2">
                        <span className={cn(
                            "font-bold text-lg tracking-tight",
                            item.classificacao === "Urgência" && "text-red-600",
                            item.classificacao === "Preferencial" && "text-amber-600"
                        )}>{item.senha}</span>
                        
                        <p className="font-semibold text-base text-primary truncate" title={item.pacienteNome}>{item.pacienteNome}</p>

                        <div className="space-y-1 text-xs text-muted-foreground pt-1">
                            <div className="flex items-center gap-1.5">
                                <Building className="h-3 w-3" />
                                <span className="truncate" title={item.departamentoNome}>{item.departamentoNome}{item.departamentoNumero ? ` - Sala ${item.departamentoNumero}` : ''}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <User className="h-3 w-3" />
                                <span className="truncate" title={item.profissionalNome}>{item.profissionalNome}</span>
                            </div>
                        </div>
                    </CardContent>
                    <div className="flex flex-col sm:flex-row items-center justify-between p-2 border-t bg-muted/30 rounded-b-lg gap-2">
                         <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                             {item.chamadaEm ? `Chamado ${formatDistanceToNow(item.chamadaEm.toDate(), { addSuffix: true, locale: ptBR })}` : 'Aguardando'}
                        </p>
                        <div className="flex gap-1.5 w-full sm:w-auto">
                            <Button size="sm" variant="outline" className="h-7 flex-1 text-xs px-2" onClick={() => onReturnToQueue(item)}>
                                <Undo2 className="mr-1 h-3 w-3" />
                                Retornar
                            </Button>
                             <Button size="sm" className="h-7 bg-green-600 hover:bg-green-700 flex-1 text-xs px-2" onClick={() => onFinalize(item)}>
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Finalizar
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
