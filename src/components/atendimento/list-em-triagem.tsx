
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { FilaDeEsperaItem } from "@/types/fila";
import { cn } from "@/lib/utils";
import { UserPlus, Clock, XCircle, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Classificacao } from "@/types/empresa";

const TriagemCard = ({ item, onIdentify, onCancel, onReturnToPending, colorClass, isReadOnly }: { item: FilaDeEsperaItem, onIdentify: (item: FilaDeEsperaItem) => void, onCancel: (item: FilaDeEsperaItem) => void, onReturnToPending: (item: FilaDeEsperaItem) => void, colorClass: string, isReadOnly: boolean }) => {
    const horaChegada = item.chegadaEm ? format(item.chegadaEm.toDate(), "HH:mm:ss", { locale: ptBR }) : 'N/A';
    
    const badgeBgColor = colorClass.replace('text', 'bg').replace('-600', '-600 hover:bg-red-700'); // Adaptação simples

    return (
        <Card key={item.id} className={cn("w-full", colorClass.replace('text', 'border').replace('-600', '-500/50'), colorClass.replace('text', 'bg').replace('-600', '-500/5'))}>
             <CardContent className="p-2 flex items-center justify-between gap-2">
                 <div className="flex items-center gap-2">
                    <span className={cn("font-bold text-base tracking-tight", colorClass)}>{item.senha}</span>
                     <Badge variant={
                        item.classificacao === 'Urgencia' ? 'destructive' :
                        item.classificacao === 'Preferencial' ? 'default' : 
                        item.classificacao === 'Outros' ? 'default' : 'secondary'
                    } className={cn("text-xs",
                        item.classificacao === 'Preferencial' && 'bg-blue-600 hover:bg-blue-700',
                        item.classificacao === 'Normal' && 'bg-green-600 hover:bg-green-700 text-white',
                        item.classificacao === 'Outros' && 'bg-slate-600 hover:bg-slate-700 text-white'
                    )}>
                        {item.classificacao}
                    </Badge>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                    <Clock className="h-3 w-3" />
                    <span>{horaChegada}</span>
                </div>
                
                <div className="flex items-center gap-1">
                    <Button size="sm" className="h-7 px-2 text-xs" onClick={() => onIdentify(item)} disabled={isReadOnly}>
                        <UserPlus className="mr-1 h-3 w-3"/>
                        Identificar
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onReturnToPending(item)} disabled={isReadOnly} title="Retornar para pendentes">
                        <Undo2 className="h-4 w-4" />
                        <span className="sr-only">Retornar para pendentes</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onCancel(item)} disabled={isReadOnly}>
                        <XCircle className="h-4 w-4" />
                        <span className="sr-only">Cancelar</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

const TriagemColumn = ({ title, items, onIdentify, onCancel, onReturnToPending, isLoading, colorClass, isReadOnly }: { title: string, items: FilaDeEsperaItem[], onIdentify: (item: FilaDeEsperaItem) => void, onCancel: (item: FilaDeEsperaItem) => void, onReturnToPending: (item: FilaDeEsperaItem) => void, isLoading: boolean, colorClass: string, isReadOnly: boolean }) => {
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
                    items.map(item => <TriagemCard key={item.id} item={item} onIdentify={onIdentify} onCancel={onCancel} onReturnToPending={onReturnToPending} colorClass={colorClass} isReadOnly={isReadOnly} />)
                ) : (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        Nenhuma senha.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

const getColorClassForClassification = (id: string): string => {
    switch (id) {
        case "Urgencia": return "text-red-600";
        case "Preferencial": return "text-blue-600";
        case "Normal": return "text-green-600";
        default: return "text-slate-600"; // Cor padrão para 'Outros' e customizadas
    }
}

interface EmTriagemListProps {
    emTriagem: FilaDeEsperaItem[];
    isLoading: boolean;
    onIdentify: (item: FilaDeEsperaItem) => void;
    onCancel: (item: FilaDeEsperaItem) => void;
    onReturnToPending: (item: FilaDeEsperaItem) => void;
    classificacoes: Classificacao[];
    isReadOnly?: boolean;
}


export function EmTriagemList({ emTriagem, isLoading, onIdentify, onCancel, onReturnToPending, classificacoes, isReadOnly = false }: EmTriagemListProps) {
    
    if (isLoading && emTriagem.length === 0) {
        return (
            <div className="flex gap-4 h-full">
                 {[...Array(4)].map((_, i) => (
                      <TriagemColumn key={i} title="" items={[]} onIdentify={onIdentify} onCancel={onCancel} onReturnToPending={onReturnToPending} isLoading={true} colorClass="" isReadOnly={isReadOnly}/>
                 ))}
            </div>
        )
    }

    if (emTriagem.length === 0 && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full rounded-md border border-dashed py-10">
                <p className="text-muted-foreground">Nenhuma senha em triagem.</p>
            </div>
        );
    }
    
    return (
         <div className={cn("flex gap-4 h-full", `grid-cols-${classificacoes.length}`)}>
            {classificacoes.map(classificacao => {
                const items = emTriagem.filter(item => item.classificacao === classificacao.id);
                const colorClass = getColorClassForClassification(classificacao.id);
                return (
                     <TriagemColumn 
                        key={classificacao.id}
                        title={classificacao.nome} 
                        items={items} 
                        onIdentify={onIdentify} 
                        onCancel={onCancel} 
                        onReturnToPending={onReturnToPending}
                        isLoading={isLoading} 
                        colorClass={colorClass}
                        isReadOnly={isReadOnly}
                    />
                )
            })}
        </div>
    );
}
