
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { FilaDeEsperaItem } from "@/types/fila";
import { cn } from "@/lib/utils";
import { UserPlus, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";


const TriagemCard = ({ item, onIdentify }: { item: FilaDeEsperaItem, onIdentify: (item: FilaDeEsperaItem) => void }) => {
    const horaChegada = item.chegadaEm ? format(item.chegadaEm.toDate(), "HH:mm:ss", { locale: ptBR }) : 'N/A';
    
    return (
        <Card key={item.id} className={cn(
            "w-full",
            item.classificacao === "Urgência" && "border-red-500/50 bg-red-500/5",
            item.classificacao === "Preferencial" && "border-amber-500/50 bg-amber-500/5",
            item.classificacao === "Normal" && "border-green-500/50 bg-green-500/5",
        )}>
             <CardContent className="p-2 flex items-center justify-between gap-2">
                 <div className="flex items-center gap-2">
                    <span className={cn(
                        "font-bold text-base tracking-tight",
                         item.classificacao === "Urgência" && "text-red-600",
                        item.classificacao === "Preferencial" && "text-amber-600",
                        item.classificacao === "Normal" && "text-green-600",
                    )}>{item.senha}</span>
                     <Badge variant={
                        item.classificacao === 'Urgência' ? 'destructive' :
                        item.classificacao === 'Preferencial' ? 'default' : 'secondary'
                    } className={cn("text-xs",
                        item.classificacao === 'Preferencial' && 'bg-amber-500 hover:bg-amber-600',
                        item.classificacao === 'Normal' && 'bg-green-600 hover:bg-green-700 text-white'
                    )}>
                        {item.classificacao}
                    </Badge>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                    <Clock className="h-3 w-3" />
                    <span>{horaChegada}</span>
                </div>
                
                <Button size="sm" className="h-7 px-2 text-xs" onClick={() => onIdentify(item)}>
                    <UserPlus className="mr-1 h-3 w-3"/>
                    Identificar
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
            <CardContent className="p-2 space-y-2 h-full overflow-y-auto">
                 {isLoading ? (
                    [...Array(5)].map((_, i) => (
                         <Card key={i}><CardContent className="p-2"><Skeleton className="h-8 w-full" /></CardContent></Card>
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


export function EmTriagemList({ emTriagem, isLoading, onIdentify }: { emTriagem: FilaDeEsperaItem[], isLoading: boolean, onIdentify: (item: FilaDeEsperaItem) => void }) {
    
    if (isLoading && emTriagem.length === 0) {
        return (
            <div className="flex gap-4 h-full">
                 <TriagemColumn title="Atendimento de Urgência" items={[]} onIdentify={onIdentify} isLoading={true} colorClass="text-red-600"/>
                 <TriagemColumn title="Atendimento Preferencial" items={[]} onIdentify={onIdentify} isLoading={true} colorClass="text-amber-600"/>
                 <TriagemColumn title="Atendimento Normal" items={[]} onIdentify={onIdentify} isLoading={true} colorClass="text-green-600"/>
            </div>
        )
    }

    const urgenciaItems = emTriagem.filter(item => item.classificacao === 'Urgência');
    const preferencialItems = emTriagem.filter(item => item.classificacao === 'Preferencial');
    const normalItems = emTriagem.filter(item => item.classificacao === 'Normal');

    if (emTriagem.length === 0 && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full rounded-md border border-dashed py-10">
                <p className="text-muted-foreground">Nenhuma senha em triagem.</p>
            </div>
        );
    }
    
    return (
         <div className="flex gap-4 h-full">
            <TriagemColumn title="Atendimento de Urgência" items={urgenciaItems} onIdentify={onIdentify} isLoading={isLoading} colorClass="text-red-600"/>
            <TriagemColumn title="Atendimento Preferencial" items={preferencialItems} onIdentify={onIdentify} isLoading={isLoading} colorClass="text-amber-600"/>
            <TriagemColumn title="Atendimento Normal" items={normalItems} onIdentify={onIdentify} isLoading={isLoading} colorClass="text-green-600"/>
        </div>
    );
}
