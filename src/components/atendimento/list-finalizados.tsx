
"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { FilaDeEsperaItem } from "@/types/fila";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, User, Building, CheckCircle, BadgeInfo, XCircle, Tag, MessageSquareWarning } from "lucide-react";
import { Badge } from "../ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "../ui/label";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog"
import { Button } from "../ui/button";


interface FinalizadosListProps {
    finalizados: FilaDeEsperaItem[];
    isLoading: boolean;
    filter: 'todos' | 'finalizado' | 'cancelado';
    onFilterChange: (value: 'todos' | 'finalizado' | 'cancelado') => void;
}

export function FinalizadosList({ finalizados, isLoading, filter, onFilterChange }: FinalizadosListProps) {
    
    const [motivoVisivel, setMotivoVisivel] = React.useState<string | null>(null);

    const counts = React.useMemo(() => {
        const finalized = finalizados.filter(item => item.status === 'finalizado').length;
        const canceled = finalizados.filter(item => item.status === 'cancelado').length;
        const all = finalizados.length;
        return { finalized, canceled, all };
    }, [finalizados]);
    
    const filteredList = React.useMemo(() => {
        if (filter === 'todos') {
            return finalizados;
        }
        return finalizados.filter(item => item.status === filter);
    }, [finalizados, filter]);

    if (isLoading) {
        return (
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                     <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1 space-y-1">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                        <div className="flex items-center gap-2">
                             <Skeleton className="h-7 w-24" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }
    
    return (
         <div className="space-y-2">
             <div className="flex items-center justify-end p-2 border-b">
                 <RadioGroup
                    value={filter}
                    onValueChange={onFilterChange}
                    className="flex items-center gap-4"
                >
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="finalizado" id="r-finalizado" />
                        <Label htmlFor="r-finalizado" className="cursor-pointer">Finalizados <Badge variant="secondary" className="ml-1">{counts.finalized}</Badge></Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cancelado" id="r-cancelado" />
                        <Label htmlFor="r-cancelado" className="cursor-pointer">Cancelados <Badge variant="destructive" className="ml-1 bg-orange-500 hover:bg-orange-600">{counts.canceled}</Badge></Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="todos" id="r-todos" />
                        <Label htmlFor="r-todos" className="cursor-pointer">Todos <Badge variant="outline" className="ml-1">{counts.all}</Badge></Label>
                    </div>
                </RadioGroup>
             </div>

            {filteredList.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full rounded-md border border-dashed py-10">
                    <p className="text-muted-foreground">
                        Nenhum registro encontrado para este filtro.
                    </p>
                </div>
            ) : (
                <>
                {filteredList.map((item) => {
                    const isCanceled = item.status === 'cancelado';
                    const eventTime = isCanceled ? item.canceladaEm?.toDate() : item.finalizadaEm?.toDate();
                    
                    return (
                        <div key={item.id} className={cn(
                            "flex items-center justify-between p-2 border rounded-lg",
                            isCanceled ? "bg-orange-500/5" : "bg-muted/30"
                        )}>
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                {isCanceled ? (
                                    <div className="flex items-center gap-2">
                                        <Badge variant="destructive" className="text-xs font-semibold bg-orange-500 hover:bg-orange-600">
                                            <XCircle className="h-3 w-3 mr-1.5" />
                                            Cancelado
                                        </Badge>
                                        {item.motivoCancelamento && (
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-orange-600 hover:text-orange-700" onClick={() => setMotivoVisivel(item.motivoCancelamento || null)}>
                                                <MessageSquareWarning className="h-4 w-4 cursor-pointer" />
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 text-xs font-semibold">
                                       <CheckCircle className="h-3 w-3 mr-1.5" />
                                       Finalizado
                                    </Badge>
                                )}
                                <div className="flex-1 min-w-0">
                                    {item.pacienteNome ? (
                                        <>
                                            <p className="font-semibold text-sm text-foreground/80 truncate" title={item.pacienteNome}>{item.pacienteNome}</p>
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
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-3 w-3 text-muted-foreground" />
                                            <p className="font-semibold text-sm text-foreground/80">Senha {item.senha}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 ml-4">
                                <div className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                                    <BadgeInfo className="h-3 w-3" />
                                    <Badge
                                        className={cn(
                                            'text-xs font-semibold',
                                            item.classificacao === 'Urgencia' && 'bg-red-500 text-white hover:bg-red-600',
                                            item.classificacao === 'Preferencial' && 'bg-blue-500 text-white hover:bg-blue-600',
                                            item.classificacao === 'Normal' && 'bg-green-500 text-white hover:bg-green-700'
                                        )}
                                    >
                                        {item.classificacao}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
                                    <Clock className="h-3 w-3" />
                                     {eventTime ? format(eventTime, "HH:mm:ss") : '-'}
                                </p>
                            </div>
                        </div>
                    )
                })}
                </>
            )}

            <AlertDialog open={!!motivoVisivel} onOpenChange={() => setMotivoVisivel(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <MessageSquareWarning />
                            Motivo do Cancelamento
                        </AlertDialogTitle>
                        <AlertDialogDescription className="pt-4 text-base text-foreground">
                           {motivoVisivel}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button onClick={() => setMotivoVisivel(null)}>Fechar</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
