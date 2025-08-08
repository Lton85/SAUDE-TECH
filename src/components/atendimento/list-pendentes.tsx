"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { FilaDeEsperaItem } from "@/types/fila";
import { cn } from "@/lib/utils";
import { Megaphone, Trash2, Clock } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SenhasPendentesListProps {
    pendentes: FilaDeEsperaItem[];
    isLoading: boolean;
    onCall: (item: FilaDeEsperaItem) => void;
    onDelete: (item: FilaDeEsperaItem) => void;
}

export function SenhasPendentesList({ pendentes, isLoading, onCall, onDelete }: SenhasPendentesListProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-2 space-y-2">
                             <Skeleton className="h-6 w-16" />
                             <Skeleton className="h-4 w-20" />
                            <div className="flex gap-1 justify-end">
                                <Skeleton className="h-7 w-7 rounded-md" />
                                <Skeleton className="h-7 w-7 rounded-md" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (pendentes.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center h-full rounded-md border border-dashed py-10">
                <p className="text-muted-foreground">Nenhuma senha pendente de triagem.</p>
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
            {pendentes.map((item) => {
                const chegada = item.chegadaEm ? item.chegadaEm.toDate() : null;
                const formattedTime = chegada ? format(chegada, "HH:mm:ss") : '-';
                const formattedDate = chegada ? format(chegada, "dd/MM") : '-';

                return (
                    <Card key={item.id} className={cn(
                        "flex flex-col justify-between",
                        item.classificacao === "Urgência" && "border-red-500/50 bg-red-500/5",
                        item.classificacao === "Preferencial" && "border-amber-500/50 bg-amber-500/5"
                    )}>
                        <CardContent className="p-2 flex-grow">
                             <div className="flex justify-between items-start">
                                <span className={cn(
                                   "font-bold text-lg",
                                   item.classificacao === "Urgência" && "text-red-600",
                                   item.classificacao === "Preferencial" && "text-amber-600"
                                )}>{item.senha}</span>
                                <div className="text-right">
                                     <p className="text-xs font-mono text-muted-foreground">{formattedTime}</p>
                                     <p className="text-xs font-mono text-muted-foreground">{formattedDate}</p>
                                </div>
                            </div>
                        </CardContent>
                        <div className="flex items-center justify-end gap-1 p-2 border-t mt-2">
                             <Button variant="default" size="icon" className="h-7 w-7" onClick={() => onCall(item)}>
                                <Megaphone className="h-4 w-4" />
                                <span className="sr-only">Chamar para Triagem</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(item)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Excluir</span>
                            </Button>
                        </div>
                    </Card>
                )
            })}
        </div>
    );
}
