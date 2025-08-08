
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const TriagemCard = ({ item, onIdentify }: { item: FilaDeEsperaItem, onIdentify: (item: FilaDeEsperaItem) => void }) => {
    return (
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
    )
}

const TriagemColumn = ({ title, items, onIdentify, isLoading, colorClass }: { title: string, items: FilaDeEsperaItem[], onIdentify: (item: FilaDeEsperaItem) => void, isLoading: boolean, colorClass: string }) => {
    return (
        <Card className="flex-1 flex flex-col">
            <CardHeader className="p-3 border-b">
                <CardTitle className={cn("text-base flex items-center justify-center gap-2", colorClass)}>
                    {title}
                    <Badge variant="secondary">{items.length}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3 h-full overflow-y-auto">
                 {isLoading ? (
                    [...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4 flex flex-col items-center justify-center gap-4">
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-8 w-full" />
                            </CardContent>
                        </Card>
                    ))
                ) : items.length > 0 ? (
                    items.map(item => <TriagemCard key={item.id} item={item} onIdentify={onIdentify} />)
                ) : (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        Nenhuma senha.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}


export function EmTriagemList({ emTriagem, isLoading, onIdentify }: EmTriagemListProps) {
    
    if (isLoading) {
        return (
            <div className="flex gap-4 h-[calc(100vh-250px)]">
                 <TriagemColumn title="Atendimento de Urgência" items={[]} onIdentify={onIdentify} isLoading={true} colorClass="text-red-600"/>
                 <TriagemColumn title="Atendimento Preferencial" items={[]} onIdentify={onIdentify} isLoading={true} colorClass="text-amber-600"/>
                 <TriagemColumn title="Atendimento Normal" items={[]} onIdentify={onIdentify} isLoading={true} colorClass="text-green-600"/>
            </div>
        )
    }

    const urgenciaItems = emTriagem.filter(item => item.classificacao === 'Urgência');
    const preferencialItems = emTriagem.filter(item => item.classificacao === 'Preferencial');
    const normalItems = emTriagem.filter(item => item.classificacao === 'Normal');

    if (emTriagem.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full rounded-md border border-dashed py-10">
                <p className="text-muted-foreground">Nenhuma senha em triagem.</p>
            </div>
        );
    }
    
    return (
         <div className="flex gap-4 h-[calc(100vh-250px)]">
            <TriagemColumn title="Atendimento de Urgência" items={urgenciaItems} onIdentify={onIdentify} isLoading={isLoading} colorClass="text-red-600"/>
            <TriagemColumn title="Atendimento Preferencial" items={preferencialItems} onIdentify={onIdentify} isLoading={isLoading} colorClass="text-amber-600"/>
            <TriagemColumn title="Atendimento Normal" items={normalItems} onIdentify={onIdentify} isLoading={isLoading} colorClass="text-green-600"/>
        </div>
    );
}
