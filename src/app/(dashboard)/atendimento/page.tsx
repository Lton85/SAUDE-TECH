"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Megaphone, Clock, User, Building, Stethoscope, PlusCircle } from "lucide-react";
import { getFilaDeEspera, chamarPaciente } from "@/services/filaDeEsperaService";
import type { FilaDeEsperaItem } from "@/types/fila";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from "@/components/ui/skeleton";
import { AddToQueueDialog } from "@/components/atendimento/add-to-queue-dialog";
import type { Paciente } from "@/types/paciente";
import type { Departamento } from "@/types/departamento";
import { getPacientes } from "@/services/pacientesService";
import { getDepartamentos } from "@/services/departamentosService";


function FilaDeEsperaCard({ item, onChamar }: { item: FilaDeEsperaItem; onChamar: (item: FilaDeEsperaItem) => Promise<void> }) {
    const [tempoDeEspera, setTempoDeEspera] = useState("");

    useEffect(() => {
        const updateTempo = () => {
             if (item.chegadaEm) {
                const chegada = item.chegadaEm.toDate(); // Convert Firestore Timestamp to JS Date
                setTempoDeEspera(formatDistanceToNow(chegada, { addSuffix: true, locale: ptBR }));
            }
        };

        updateTempo();
        const interval = setInterval(updateTempo, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [item.chegadaEm]);

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" /> {item.pacienteNome}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="font-mono text-base">{item.senha}</Badge>
                        </CardDescription>
                    </div>
                    <Button size="sm" onClick={() => onChamar(item)}>
                        <Megaphone className="mr-2 h-4 w-4" />
                        Chamar
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        <span>{item.departamentoNome}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" />
                        <span>{item.profissionalNome}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                        <Clock className="h-4 w-4" />
                        <span>Aguardando {tempoDeEspera}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


export default function AtendimentoPage() {
    const [fila, setFila] = useState<FilaDeEsperaItem[]>([]);
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    const fetchInitialData = async () => {
        try {
            const [pacientesData, departamentosData] = await Promise.all([
                getPacientes(),
                getDepartamentos()
            ]);
            setPacientes(pacientesData);
            setDepartamentos(departamentosData.filter(d => d.situacao === 'Ativo'));
        } catch (error) {
             toast({
                title: "Erro ao carregar dados",
                description: "Não foi possível carregar a lista de pacientes e departamentos.",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        fetchInitialData();
        const unsubscribe = getFilaDeEspera((data) => {
            setFila(data);
            setIsLoading(false);
        }, (error) => {
            toast({
                title: "Erro ao carregar a fila",
                description: error,
                variant: "destructive",
            });
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);

    const handleChamarPaciente = async (item: FilaDeEsperaItem) => {
        try {
            await chamarPaciente(item);
            toast({
                title: "Paciente Chamado!",
                description: `${item.pacienteNome} foi chamado(a) no painel.`,
                className: "bg-green-500 text-white"
            });
        } catch (error) {
             toast({
                title: "Erro ao chamar paciente",
                description: (error as Error).message,
                variant: "destructive",
            });
        }
    };
    
    return (
        <>
        <div className="flex justify-end mb-6">
            <Button onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Paciente à Fila
            </Button>
        </div>

        {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-48" />
                                    <Skeleton className="h-5 w-20" />
                                </div>
                                <Skeleton className="h-9 w-28 rounded-md" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                             <Skeleton className="h-4 w-full" />
                             <Skeleton className="h-4 w-3/4" />
                             <Skeleton className="h-4 w-2/3" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        ) : fila.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {fila.map((item) => (
                    <FilaDeEsperaCard key={item.id} item={item} onChamar={handleChamarPaciente} />
                ))}
            </div>
        ) : (
            <Card className="col-span-full flex flex-col items-center justify-center p-12 border-dashed">
                    <Megaphone className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h2 className="text-xl font-semibold text-muted-foreground">Fila de Atendimento Vazia</h2>
                <p className="text-muted-foreground mt-2">Nenhum paciente aguardando atendimento no momento.</p>
            </Card>
        )}

        <AddToQueueDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            pacientes={pacientes}
            departamentos={departamentos}
        />
        </>
    );
}
