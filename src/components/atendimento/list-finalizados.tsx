
"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { FilaDeEsperaItem } from "@/types/fila";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, User, Building, CheckCircle, BadgeInfo, XCircle } from "lucide-react";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

interface FinalizadosListProps {
    finalizados: FilaDeEsperaItem[];
    isLoading: boolean;
    showCanceledOnly: boolean;
    onShowCanceledOnlyChange: (checked: boolean) => void;
}

export function FinalizadosList({ finalizados, isLoading, showCanceledOnly, onShowCanceledOnlyChange }: FinalizadosListProps) {
    const filteredList = React.useMemo(() => {
        return finalizados.filter(item => showCanceledOnly ? item.status === 'cancelado' : item.status === 'finalizado');
    }, [finalizados, showCanceledOnly]);

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
            <div className="flex items-center justify-end space-x-2 pr-2">
              <Label htmlFor="canceled-switch">Finalizados</Label>
              <Switch 
                id="canceled-switch" 
                checked={showCanceledOnly}
                onCheckedChange={onShowCanceledOnlyChange}
              />
              <Label htmlFor="canceled-switch">Cancelados</Label>
            </div>

            {filteredList.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full rounded-md border border-dashed py-10">
                    <p className="text-muted-foreground">
                        {showCanceledOnly ? "Nenhum atendimento cancelado hoje." : "Nenhum atendimento finalizado hoje."}
                    </p>
                </div>
            ) : (
                filteredList.map((item) => {
                    const isCanceled = item.status === 'cancelado';
                    const eventTime = isCanceled ? item.canceladaEm?.toDate() : item.finalizadaEm?.toDate();
                    
                    return (
                        <div key={item.id} className={cn(
                            "flex items-center justify-between p-2 border rounded-lg",
                            isCanceled ? "bg-red-500/5" : "bg-muted/30"
                        )}>
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                {isCanceled ? (
                                    <Badge variant="destructive" className="text-xs font-semibold">
                                       <XCircle className="h-3 w-3 mr-1.5" />
                                       Cancelado
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300 text-xs font-semibold">
                                       <CheckCircle className="h-3 w-3 mr-1.5" />
                                       Finalizado
                                    </Badge>
                                )}
                                <div className="flex-1 min-w-0">
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
                                         <div className="flex items-center gap-1.5 truncate">
                                            <BadgeInfo className="h-3 w-3" />
                                            <span className="truncate" title={item.classificacao}>Classificação: {item.classificacao}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 ml-4">
                                <p className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
                                    <Clock className="h-3 w-3" />
                                     {eventTime ? format(eventTime, "HH:mm:ss") : '-'}
                                </p>
                            </div>
                        </div>
                    )
                })
            )}
        </div>
    );
}
