
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { FilaDeEsperaItem } from "@/types/fila";
import { cn } from "@/lib/utils";
import { Megaphone, Trash2 } from "lucide-react";

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
                        <CardContent className="p-3 flex items-center justify-between">
                            <Skeleton className="h-6 w-20" />
                            <div className="flex gap-1">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {pendentes.map((item) => (
                <Card key={item.id} className={cn(
                    item.classificacao === "Urgência" && "border-red-500/50",
                    item.classificacao === "Preferencial" && "border-amber-500/50"
                )}>
                    <CardContent className="p-3 flex items-center justify-between">
                        <span className={cn(
                           "font-bold text-xl",
                           item.classificacao === "Urgência" && "text-red-600",
                           item.classificacao === "Preferencial" && "text-amber-600"
                        )}>{item.senha}</span>

                        <div className="flex items-center gap-1">
                             <Button variant="default" size="icon" className="h-7 w-7" onClick={() => onCall(item)}>
                                <Megaphone className="h-4 w-4" />
                                <span className="sr-only">Chamar para Triagem</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(item)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Excluir</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
