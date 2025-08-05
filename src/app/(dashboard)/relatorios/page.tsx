
"use client";

import * as React from "react";
import { addDays, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isToday } from "date-fns";
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
import { getPacientes } from "@/services/pacientesService";
import type { Medico } from "@/types/medico";
import type { Enfermeiro } from "@/types/enfermeiro";
import type { Paciente } from "@/types/paciente";
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

export default function RelatoriosPage() {
    const { toast } = useToast();
    const [pacientes, setPacientes] = React.useState<Paciente[]>([]);
    const [medicos, setMedicos] = React.useState<Medico[]>([]);
    const [enfermeiros, setEnfermeiros] = React.useState<Enfermeiro[]>([]);
    
    const [selectedPacienteId, setSelectedPacienteId] = React.useState<string>("todos");
    const [selectedMedicoId, setSelectedMedicoId] = React.useState<string>("todos");
    const [selectedEnfermeiroId, setSelectedEnfermeiroId] = React.useState<string>("todos");

    const [allReportData, setAllReportData] = React.useState<FilaDeEsperaItem[]>([]);
    const [filteredReportData, setFilteredReportData] = React.useState<FilaDeEsperaItem[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [isMounted, setIsMounted] = React.useState(false);

    const [dateRange, setDateRange] = React.useState<{ from: Date | undefined; to: Date | undefined }>({
      from: new Date(),
      to: new Date(),
    });
    const [viewMode, setViewMode] = React.useState<'diario' | 'semanal' | 'mensal'>('diario');

    React.useEffect(() => {
        setIsMounted(true);
        handleSearch(); // Load initial data for today
    }, []);

    React.useEffect(() => {
        const fetchFiltersData = async () => {
            try {
                const [medicosData, enfermeirosData, pacientesData] = await Promise.all([
                    getMedicos(), 
                    getEnfermeiros(),
                    getPacientes()
                ]);
                setMedicos(medicosData);
                setEnfermeiros(enfermeirosData);
                setPacientes(pacientesData);
            } catch (error) {
                toast({
                    title: "Erro ao carregar dados dos filtros",
                    description: "Não foi possível carregar as listas de pacientes e profissionais.",
                    variant: "destructive"
                });
            }
        };
        fetchFiltersData();
    }, [toast]);

    React.useEffect(() => {
        const today = new Date();
        if (viewMode === 'diario') {
            setDateRange({ from: today, to: today });
        } else if (viewMode === 'semanal') {
            setDateRange({ from: startOfWeek(today), to: endOfWeek(today) });
        } else if (viewMode === 'mensal') {
            setDateRange({ from: startOfMonth(today), to: endOfMonth(today) });
        }
    }, [viewMode]);

    const applyClientSideFilters = React.useCallback((data: FilaDeEsperaItem[]) => {
        let filteredData = [...data];

        if (selectedPacienteId !== 'todos') {
            filteredData = filteredData.filter(item => item.pacienteId === selectedPacienteId);
        }

        if (selectedMedicoId !== 'todos') {
             filteredData = filteredData.filter(item => item.profissionalId === selectedMedicoId);
        }
        
        if (selectedEnfermeiroId !== 'todos') {
             filteredData = filteredData.filter(item => item.profissionalId === selectedEnfermeiroId);
        }
        
        setFilteredReportData(filteredData);
    }, [selectedPacienteId, selectedMedicoId, selectedEnfermeiroId]);

    const handleSearch = React.useCallback(async () => {
        if (!dateRange.from || !dateRange.to) {
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
            const data = await getHistoricoAtendimentosPorPeriodo({ dateFrom: dateRange.from, dateTo: dateRange.to });
            setAllReportData(data);
            applyClientSideFilters(data);
        } catch (error) {
            console.error("Erro ao buscar relatório: ", error);
            toast({
                title: "Erro ao buscar relatório",
                description: (error as Error).message,
                variant: "destructive"
            });
            setAllReportData([]);
            setFilteredReportData([]);
        } finally {
            setIsLoading(false);
        }
    }, [dateRange, toast, applyClientSideFilters]);
    
     React.useEffect(() => {
        // Re-apply filters whenever they change
        if (hasSearched) {
            applyClientSideFilters(allReportData);
        }
    }, [selectedPacienteId, selectedMedicoId, selectedEnfermeiroId, allReportData, hasSearched, applyClientSideFilters]);


    React.useEffect(() => {
        if (selectedMedicoId !== 'todos' && selectedEnfermeiroId !== 'todos') {
            // If user selects a specific doctor, clear the nurse selection and vice versa,
            // as one attendance can't have both. But allow one to be selected while the other is "all".
            toast({
                title: "Filtro de Profissional",
                description: "Selecione um médico ou um enfermeiro, mas não ambos.",
                variant: "default",
            });
             if (selectedMedicoId !== 'todos') {
                 setSelectedEnfermeiroId('todos');
             }
        }
    }, [selectedMedicoId, selectedEnfermeiroId, toast]);


    const handleClearFilters = () => {
        setSelectedPacienteId('todos');
        setSelectedMedicoId('todos');
        setSelectedEnfermeiroId('todos');
        setViewMode('diario');
        setDateRange({ from: new Date(), to: new Date() });
    };

    const hasActiveFilters = React.useMemo(() => {
        const isDefaultDateRange = dateRange.from && dateRange.to && isToday(dateRange.from) && isToday(dateRange.to);
        return (
            selectedPacienteId !== 'todos' ||
            selectedMedicoId !== 'todos' ||
            selectedEnfermeiroId !== 'todos' ||
            !isDefaultDateRange
        );
    }, [selectedPacienteId, selectedMedicoId, selectedEnfermeiroId, dateRange]);


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
                    pacientes={pacientes}
                    medicos={medicos}
                    enfermeiros={enfermeiros}
                    selectedPacienteId={selectedPacienteId}
                    onPacienteChange={setSelectedPacienteId}
                    selectedMedicoId={selectedMedicoId}
                    onMedicoChange={setSelectedMedicoId}
                    selectedEnfermeiroId={selectedEnfermeiroId}
                    onEnfermeiroChange={setSelectedEnfermeiroId}
                    onSearch={handleSearch}
                    isLoading={isLoading}
                    onClearFilters={handleClearFilters}
                    hasActiveFilters={hasActiveFilters}
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
                                <Button variant="outline" onClick={handlePrint} disabled={filteredReportData.length === 0}>
                                    <Printer className="mr-2 h-4 w-4" />
                                    Imprimir
                                </Button>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-lg bg-muted/40">
                             <div className="flex items-center gap-2">
                                <Button variant={viewMode === 'diario' ? 'default' : 'outline'} onClick={() => setViewMode('diario')} disabled={isLoading}>Diário</Button>
                                <Button variant={viewMode === 'semanal' ? 'default' : 'outline'} onClick={() => setViewMode('semanal')} disabled={isLoading}>Semanal</Button>
                                <Button variant={viewMode === 'mensal' ? 'default' : 'outline'} onClick={() => setViewMode('mensal')} disabled={isLoading}>Mensal</Button>
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
                                        !dateRange.from && "text-muted-foreground"
                                        )}
                                        disabled={isLoading}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange.from && dateRange.to ? (
                                             `${format(dateRange.from, "dd 'de' MMM, y", { locale: ptBR })} - ${format(dateRange.to, "dd 'de' MMM, y", { locale: ptBR })}`
                                        ) : <span>Escolha um período</span>
                                        }
                                    </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange.from}
                                        selected={dateRange}
                                        onSelect={(range) => {
                                            setDateRange(range || {from: undefined, to: undefined});
                                            if (range?.from && range.to && format(range.from, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd') && format(range.from, 'yyyy-MM-dd') !== format(startOfWeek(new Date()), 'yyyy-MM-dd')) {
                                                setViewMode('diario'); // Reset view mode if a custom range is selected
                                            }
                                        }}
                                        numberOfMonths={2}
                                        locale={ptBR}
                                        captionLayout="dropdown-buttons"
                                        fromYear={new Date().getFullYear() - 10}
                                        toYear={new Date().getFullYear() + 10}
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
                        ) : hasSearched && filteredReportData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full rounded-md border border-dashed">
                                <p className="text-muted-foreground">
                                    Nenhum resultado encontrado para os filtros selecionados.
                                </p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col gap-4 min-h-0">
                                <AtendimentosChart data={filteredReportData} />
                                 <p className="text-sm text-muted-foreground">Total de Atendimentos no período: <span className="font-bold text-foreground">{filteredReportData.length}</span></p>
                                <ScrollArea className="flex-1">
                                    <div className="space-y-3 pr-4">
                                        {filteredReportData.map((item) => (
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

    