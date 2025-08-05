
"use client";

import * as React from "react";
import { addDays, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Search, Printer, Loader2, User, Building, CheckCircle, LogIn, Megaphone, Check, Filter } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { FilaDeEsperaItem } from "@/types/fila";
import { getHistoricoAtendimentosPorPeriodo } from "@/services/filaDeEsperaService";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getMedicos } from "@/services/medicosService";
import { getEnfermeiros } from "@/services/enfermeirosService";
import type { Medico } from "@/types/medico";
import type { Enfermeiro } from "@/types/enfermeiro";
import { AtendimentosChart } from "./atendimentos-chart";
import { FiltrosRelatorio } from "./filtros-relatorio";
import { ScrollArea } from "@/components/ui/scroll-area";

const EventoTimeline = ({ icon: Icon, label, time }: { icon: React.ElementType, label: string, time: string }) => (
    <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-primary/80" />
        <div className="flex justify-between w-full">
            <span className="text-muted-foreground text-sm">{label}</span>
            <span className="font-mono text-sm font-medium">{time}</span>
        </div>
    </div>
);


const ReportItemCard = ({ atendimento }: { atendimento: FilaDeEsperaItem }) => {
    const dataFinalizacao = atendimento.finalizadaEm?.toDate();
    const dataFormatada = dataFinalizacao ? format(dataFinalizacao, "dd 'de' MMM 'de' yyyy", { locale: ptBR }) : 'N/A';

    const horaChegada = atendimento.chegadaEm ? format(atendimento.chegadaEm.toDate(), "HH:mm:ss", { locale: ptBR }) : 'N/A';
    const horaChamada = atendimento.chamadaEm ? format(atendimento.chamadaEm.toDate(), "HH:mm:ss", { locale: ptBR }) : 'N/A';
    const horaFinalizacao = dataFinalizacao ? format(dataFinalizacao, "HH:mm:ss", { locale: ptBR }) : 'N/A';

    return (
      <Card className="hover:border-primary/20 transition-colors">
        <CardHeader className="p-4">
            <div className="flex justify-between items-start">
                <div>
                     <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        {atendimento.pacienteNome}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                        Atendimento em <span className="font-medium">{dataFormatada}</span>
                    </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Finalizado
                </Badge>
            </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
             <Separator className="mb-4" />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-3">
                     <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Departamento:</span>
                        <span className="font-semibold text-sm">{atendimento.departamentoNome}{atendimento.departamentoNumero ? ` - Sala ${atendimento.departamentoNumero}` : ''}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Profissional:</span>
                        <span className="font-semibold text-sm">{atendimento.profissionalNome}</span>
                    </div>
                </div>
                 <div className="space-y-2 rounded-md border bg-muted/40 p-3">
                    <EventoTimeline icon={LogIn} label="Entrada na Fila" time={horaChegada} />
                    <EventoTimeline icon={Megaphone} label="Chamada no Painel" time={horaChamada} />
                    <EventoTimeline icon={Check} label="Finalização" time={horaFinalizacao} />
                </div>
             </div>
        </CardContent>
      </Card>
    )
}

type Profissional = (Medico | Enfermeiro) & { tipo: 'medico' | 'enfermeiro' };


export default function RelatoriosPage() {
    const { toast } = useToast();
    const [dateFrom, setDateFrom] = React.useState<Date | undefined>(new Date());
    const [dateTo, setDateTo] = React.useState<Date | undefined>(new Date());
    const [viewMode, setViewMode] = React.useState<'diario' | 'semanal' | 'mensal'>('diario');
    
    const [profissionais, setProfissionais] = React.useState<Profissional[]>([]);
    const [selectedProfissionalId, setSelectedProfissionalId] = React.useState<string>("todos");

    const [reportData, setReportData] = React.useState<FilaDeEsperaItem[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
        handleSearch(); // Load initial data for today
    }, []);

    React.useEffect(() => {
        const fetchProfissionais = async () => {
            try {
                const [medicosData, enfermeirosData] = await Promise.all([getMedicos(), getEnfermeiros()]);
                const medicosList = medicosData.map(m => ({ ...m, nome: `Dr(a). ${m.nome}`, tipo: 'medico' as const }));
                const enfermeirosList = enfermeirosData.map(e => ({ ...e, nome: `Enf. ${e.nome}`, tipo: 'enfermeiro' as const }));
                setProfissionais([...medicosList, ...enfermeirosList].sort((a,b) => a.nome.localeCompare(b.nome)));
            } catch (error) {
                toast({
                    title: "Erro ao carregar profissionais",
                    description: "Não foi possível carregar a lista de profissionais.",
                    variant: "destructive"
                });
            }
        };
        fetchProfissionais();
    }, [toast]);

    React.useEffect(() => {
        const today = new Date();
        if (viewMode === 'diario') {
            setDateFrom(today);
            setDateTo(today);
        } else if (viewMode === 'semanal') {
            setDateFrom(startOfWeek(today));
            setDateTo(endOfWeek(today));
        } else if (viewMode === 'mensal') {
            setDateFrom(startOfMonth(today));
            setDateTo(endOfMonth(today));
        }
    }, [viewMode]);

    const handleSearch = React.useCallback(async () => {
        if (!dateFrom || !dateTo) {
            toast({
                title: "Período inválido",
                description: "Por favor, selecione as datas de início e fim.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        setHasSearched(true);
        try {
            const data = await getHistoricoAtendimentosPorPeriodo(dateFrom, dateTo, selectedProfissionalId !== "todos" ? selectedProfissionalId : undefined);
            setReportData(data);
        } catch (error) {
            console.error("Erro ao buscar relatório: ", error);
            toast({
                title: "Erro ao buscar relatório",
                description: (error as Error).message,
                variant: "destructive"
            });
            setReportData([]);
        } finally {
            setIsLoading(false);
        }
    }, [dateFrom, dateTo, selectedProfissionalId, toast]);

    const handlePrint = () => {
        toast({
            title: "Funcionalidade em desenvolvimento",
            description: "A impressão de relatórios será implementada em breve.",
        });
    }

    if (!isMounted) {
        return null; // or a loading skeleton
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
            <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0">
                <FiltrosRelatorio
                    profissionais={profissionais}
                    selectedProfissionalId={selectedProfissionalId}
                    onProfissionalChange={setSelectedProfissionalId}
                    onSearch={handleSearch}
                    isLoading={isLoading}
                />
            </aside>
            <main className="flex-1 min-w-0">
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div>
                                <CardTitle>Relatórios de Atendimento</CardTitle>
                                <CardDescription>
                                    Gere consultas precisas e seguras sobre os atendimentos realizados.
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button onClick={handleSearch} disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                                    {isLoading ? "Consultando..." : "Consultar"}
                                </Button>
                                <Button variant="outline" onClick={handlePrint} disabled={reportData.length === 0}>
                                    <Printer className="mr-2 h-4 w-4" />
                                    Imprimir
                                </Button>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-lg bg-muted/40">
                             <div className="flex items-center gap-2">
                                <Button variant={viewMode === 'diario' ? 'default' : 'outline'} onClick={() => setViewMode('diario')}>Diário</Button>
                                <Button variant={viewMode === 'semanal' ? 'default' : 'outline'} onClick={() => setViewMode('semanal')}>Semanal</Button>
                                <Button variant={viewMode === 'mensal' ? 'default' : 'outline'} onClick={() => setViewMode('mensal')}>Mensal</Button>
                            </div>
                             <Separator orientation="vertical" className="h-6 hidden sm:block" />
                            <div className="flex items-center gap-2">
                                 <Popover>
                                    <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={"outline"}
                                        className={cn(
                                        "w-[260px] justify-start text-left font-normal",
                                        !dateFrom && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateFrom && dateTo ? (
                                             `${format(dateFrom, "LLL dd, y")} - ${format(dateTo, "LLL dd, y")}`
                                        ) : <span>Escolha um período</span>
                                        }
                                    </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateFrom}
                                        selected={{ from: dateFrom, to: dateTo }}
                                        onSelect={(range) => {
                                            setDateFrom(range?.from)
                                            setDateTo(range?.to)
                                        }}
                                        numberOfMonths={2}
                                        locale={ptBR}
                                    />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col min-h-0">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="mt-4 text-muted-foreground">Carregando relatório...</p>
                            </div>
                        ) : hasSearched && reportData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full rounded-md border border-dashed">
                                <p className="text-muted-foreground">
                                    Nenhum resultado encontrado para os filtros selecionados.
                                </p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col gap-4 min-h-0">
                                <AtendimentosChart data={reportData} />
                                 <p className="text-sm text-muted-foreground">Total de Atendimentos no período: <span className="font-bold text-foreground">{reportData.length}</span></p>
                                <ScrollArea className="flex-1">
                                    <div className="space-y-3 pr-4">
                                        {reportData.map((item) => (
                                            <ReportItemCard key={item.id} atendimento={item} />
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
