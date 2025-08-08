
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { FilaDeEsperaItem } from "@/types/fila";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, User, Building, CheckCircle, BadgeInfo } from "lucide-react";
import { Badge } from "../ui/badge";

interface FinalizadosListProps {
    finalizados: FilaDeEsperaItem[];
    isLoading: boolean;
}

export function FinalizadosList({ finalizados, isLoading }: FinalizadosListProps) {
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
                             <Skeleton className="h-7 w-24" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }
    
    if (finalizados.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full rounded-md border border-dashed py-10">
                <p className="text-muted-foreground">Nenhum atendimento finalizado hoje.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-2">
            {finalizados.map((item) => (
                <div key={item.id} className={cn(
                    "flex items-center justify-between p-2 border rounded-lg bg-muted/30"
                )}>
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300 text-xs font-semibold">
                           <CheckCircle className="h-3 w-3 mr-1.5" />
                           Finalizado
                        </Badge>
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
                             {item.finalizadaEm ? format(item.finalizadaEm.toDate(), "HH:mm:ss") : '-'}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
