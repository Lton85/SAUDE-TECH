
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { FilaDeEsperaItem } from "@/types/fila";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, UserPlus } from "lucide-react";

interface EmTriagemListProps {
    emTriagem: FilaDeEsperaItem[];
    isLoading: boolean;
    onIdentify: (item: FilaDeEsperaItem) => void;
}

export function EmTriagemList({ emTriagem, isLoading, onIdentify }: EmTriagemListProps) {
    
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4 flex flex-col items-center justify-center gap-4">
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-8 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (emTriagem.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full rounded-md border border-dashed py-10">
                <p className="text-muted-foreground">Nenhuma senha em triagem.</p>
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {emTriagem.map((item) => (
                <Card key={item.id} className={cn(
                    item.classificacao === "Urgência" && "border-red-500/50",
                    item.classificacao === "Preferencial" && "border-amber-500/50"
                )}>
                    <CardContent className="p-4 flex flex-col items-center justify-center gap-3">
                         <span className={cn(
                            "font-bold text-3xl tracking-tight",
                             item.classificacao === "Urgência" && "text-red-600",
                             item.classificacao === "Preferencial" && "text-amber-600"
                         )}>{item.senha}</span>

                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                             Chamado {formatDistanceToNow(item.chamadaEm!.toDate(), { addSuffix: true, locale: ptBR })}
                        </p>
                        
                        <Button size="sm" className="w-full mt-2 h-9" onClick={() => onIdentify(item)}>
                            <UserPlus className="mr-2 h-4 w-4"/>
                            Identificar Paciente
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
