
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { FilaDeEsperaItem } from "@/types/fila";
import { cn } from "@/lib/utils";
import { Megaphone, Trash2, Clock } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from "../ui/badge";

interface SenhasPendentesListProps {
    pendentes: FilaDeEsperaItem[];
    isLoading: boolean;
    onCall: (item: FilaDeEsperaItem) => void;
    onDelete: (item: FilaDeEsperaItem) => void;
}

export function SenhasPendentesList({ pendentes, isLoading, onCall, onDelete }: SenhasPendentesListProps) {
    if (isLoading) {
        return (
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-3">
                             <Skeleton className="h-6 w-full" />
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
        <div className="space-y-2">
            {pendentes.map((item) => {
                const chegada = item.chegadaEm ? item.chegadaEm.toDate() : null;
                const formattedTime = chegada ? format(chegada, "HH:mm:ss", { locale: ptBR }) : '-';
                const formattedDate = chegada ? format(chegada, "dd/MM/yy", { locale: ptBR }) : '-';

                return (
                     <Card key={item.id} className={cn(
                        item.classificacao === "Urgência" && "border-red-500/50 bg-red-500/5",
                        item.classificacao === "Preferencial" && "border-amber-500/50 bg-amber-500/5",
                        item.classificacao === "Normal" && "border-green-500/50 bg-green-500/5"
                    )}>
                        <CardContent className="p-2 flex items-center justify-between">
                            <Badge variant={
                                item.classificacao === 'Urgência' ? 'destructive' : 
                                item.classificacao === 'Preferencial' ? 'default' : 'secondary'
                            } className={cn("text-base",
                                item.classificacao === 'Preferencial' && 'bg-amber-500 hover:bg-amber-600',
                                item.classificacao === 'Normal' && 'bg-green-600 hover:bg-green-700 text-white'
                            )}>
                                {item.senha}
                            </Badge>
                            
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                                <Clock className="h-3 w-3" />
                                <span>{formattedDate} - {formattedTime}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
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
                )
            })}
        </div>
    );
}
