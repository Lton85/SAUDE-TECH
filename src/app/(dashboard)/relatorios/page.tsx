

"use client";

import * as React from "react";
import { addDays, format, startOfWeek, endOfWeek, startOfMonth, isToday, endOfMonth, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Search, Printer, Loader2, User, Building, CheckCircle, LogIn, Megaphone, Check, Filter, ShieldQuestion, Fingerprint, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { FilaDeEsperaItem } from "@/types/fila";
import { getHistoricoAtendimentosPorPeriodoComFiltros } from "@/services/filaDeEsperaService";
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

const ReportItemCard = ({ atendimento, onPrintItem }: { atendimento: FilaDeEsperaItem, onPrintItem: (itemId: string) => void }) => {
    const dataFinalizacao = atendimento.finalizadaEm?.toDate();
    const dataHoraFormatada = dataFinalizacao ? format(dataFinalizacao, "dd/MM/yyyy - HH:mm:ss", { locale: ptBR }) : 'N/A';

    return (
        <div className="w-full border-b last:border-b-0">
            <div className="flex items-center p-3 hover:bg-muted/50 transition-colors text-xs space-x-4">
                {/* Left Side: Patient, Dept, Prof */}
                <div className="flex items-center gap-3 flex-shrink-0 min-w-0">
                    <div className="flex items-center gap-2 font-medium text-primary">
                        <User className="h-4 w-4" />
                        <span className="truncate">{atendimento.pacienteNome}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Building className="h-3 w-3" />
                        <span className="truncate">{atendimento.departamentoNome}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span className="truncate">{atendimento.profissionalNome}</span>
                    </div>
                </div>

                {/* Center: Timestamp */}
                <div className="flex-grow flex items-center justify-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>{dataHoraFormatada}</span>
                    </div>
                </div>

                {/* Right Side: Badges and Actions */}
                <div className="flex items-center justify-end gap-3 flex-shrink-0">
                    <Badge
                        className={cn(
                            'text-xs font-semibold',
                            atendimento.classificacao === 'Urgência' && 'bg-red-500 text-white hover:bg-red-600',
                            atendimento.classificacao === 'Preferencial' && 'bg-amber-500 text-white hover:bg-amber-600',
                            atendimento.classificacao === 'Normal' && 'bg-green-500 text-white hover:bg-green-600'
                        )}
                    >
                        {atendimento.classificacao}
                    </Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Finalizado
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onPrintItem(atendimento.id)} title="Imprimir Atendimento">
                        <Printer className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        </div>
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
    const [selectedClassificacao, setSelectedClassificacao] = React.useState<string>("todos");


    const [allReportData, setAllReportData] = React.useState<FilaDeEsperaItem[]>([]);
    const [filteredReportData, setFilteredReportData] = React.useState<FilaDeEsperaItem[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [isMounted, setIsMounted] = React.useState(false);

    const [dateRange, setDateRange] = React.useState<{ from: Date | undefined; to: Date | undefined }>({
      from: new Date(),
      to: new Date(),
    });
    const [viewMode, setViewMode] = React.useState<'diario' | 'semanal' | 'mensal' | 'personalizado'>('diario');


    const applyClientSideFilters = React.useCallback((dataToFilter: FilaDeEsperaItem[]) => {
        let filteredData = [...dataToFilter];
        
        if (selectedPacienteId !== 'todos') {
            filteredData = filteredData.filter(item => item.pacienteId === selectedPacienteId);
        }

        if (selectedMedicoId !== 'todos') {
            const medico = medicos.find(m => m.id === selectedMedicoId);
            if(medico) filteredData = filteredData.filter(item => item.profissionalNome === `Dr(a). ${medico.nome}`);
        }
        
        if (selectedEnfermeiroId !== 'todos') {
             const enfermeiro = enfermeiros.find(e => e.id === selectedEnfermeiroId);
            if(enfermeiro) filteredData = filteredData.filter(item => item.profissionalNome === `Enf. ${enfermeiro.nome}`);
        }
        
        if (selectedClassificacao !== 'todos') {
            filteredData = filteredData.filter(item => item.classificacao === selectedClassificacao);
        }

        setFilteredReportData(filteredData);
    }, [selectedPacienteId, selectedMedicoId, selectedEnfermeiroId, selectedClassificacao, medicos, enfermeiros]);
    
    const handleSearch = React.useCallback(async () => {
        if (!dateRange.from || !dateRange.to) {
            return;
        }

        setIsLoading(true);
        setHasSearched(true);
        try {
            const data = await getHistoricoAtendimentosPorPeriodoComFiltros({ dateFrom: dateRange.from, dateTo: dateRange.to });
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
    }, [dateRange, applyClientSideFilters, toast]);

     React.useEffect(() => {
        if (!isMounted) return;
        handleSearch();
    }, [isMounted, dateRange, handleSearch]);
    
    // Initial data load for today
    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // Fetch filter options (pacientes, medicos, etc.)
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
    
    // re-apply client filters when they change
    React.useEffect(() => {
        if(hasSearched){
            applyClientSideFilters(allReportData);
        }
    },[selectedPacienteId, selectedEnfermeiroId, selectedMedicoId, selectedClassificacao, allReportData, hasSearched, applyClientSideFilters])


    // Handle quick date selection (Diário, Semanal, Mensal)
    React.useEffect(() => {
        if (!isMounted) return;
        if (viewMode === 'personalizado') return;

        const today = new Date();
        let newFrom, newTo;

        if (viewMode === 'diario') {
            newFrom = today;
            newTo = today;
        } else if (viewMode === 'semanal') {
            newFrom = startOfWeek(today, { locale: ptBR });
            newTo = endOfWeek(today, { locale: ptBR });
        } else if (viewMode === 'mensal') {
            newFrom = startOfMonth(today);
            newTo = endOfMonth(today);
        }
        
        setDateRange({ from: newFrom, to: newTo });

    }, [viewMode, isMounted]);

    const handleClearFilters = () => {
        setSelectedPacienteId('todos');
        setSelectedMedicoId('todos');
        setSelectedEnfermeiroId('todos');
        setSelectedClassificacao('todos');
    };

    const hasActiveFilters = React.useMemo(() => {
        return (
            selectedPacienteId !== 'todos' ||
            selectedMedicoId !== 'todos' ||
            selectedEnfermeiroId !== 'todos' ||
            selectedClassificacao !== 'todos'
        );
    }, [selectedPacienteId, selectedMedicoId, selectedEnfermeiroId, selectedClassificacao]);


     const reportTitle = React.useMemo(() => {
        if (viewMode === 'diario') return "Relatório Diário de Atendimentos";
        if (viewMode === 'semanal') return "Relatório Semanal de Atendimentos";
        if (viewMode === 'mensal') return "Relatório Mensal de Atendimentos";
        
        if (dateRange.from && dateRange.to) {
            const from = format(dateRange.from, 'dd/MM/yy');
            const to = format(dateRange.to, 'dd/MM/yy');
            return from === to ? `Relatório de Atendimentos de ${from}` : `Relatório de Atendimentos de ${from} a ${to}`;
        }

        return "Relatório de Atendimentos";
    }, [viewMode, dateRange]);


    const handlePrint = () => {
         if (!dateRange.from || !dateRange.to) {
            toast({
                title: "Período não selecionado",
                description: "Por favor, selecione um período antes de imprimir.",
                variant: "destructive"
            });
            return;
        }
        if (filteredReportData.length === 0) {
            toast({
                title: "Nenhum dado para imprimir",
                description: "Não há atendimentos na lista para gerar um relatório.",
                variant: "destructive"
            });
            return;
        }

        const queryParams = new URLSearchParams({
            title: reportTitle,
            from: dateRange.from.toISOString(),
            to: dateRange.to.toISOString(),
        });
        
        if (selectedPacienteId !== 'todos') queryParams.set('pacienteId', selectedPacienteId);
        if (selectedMedicoId !== 'todos') queryParams.set('medicoId', selectedMedicoId);
        if (selectedEnfermeiroId !== 'todos') queryParams.set('enfermeiroId', selectedEnfermeiroId);
        if (selectedClassificacao !== 'todos') queryParams.set('classificacao', selectedClassificacao);

        window.open(`/print?${queryParams.toString()}`, '_blank');
    }
    
    const handlePrintItem = (itemId: string) => {
         try {
            window.open(`/print?id=${itemId}`, '_blank');
        } catch (error) {
            console.error("Erro ao preparar impressão:", error);
            toast({
                title: "Erro ao imprimir",
                description: "Não foi possível gerar o relatório. Tente novamente.",
                variant: "destructive"
            });
        }
    };
    
    const handleManualDateSearch = (range: { from: Date | undefined; to: Date | undefined }) => {
        setViewMode('personalizado');
        setDateRange(range || { from: undefined, to: undefined });
    }

    if (!isMounted) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
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
                    selectedClassificacao={selectedClassificacao}
                    onClassificacaoChange={setSelectedClassificacao}
                    onSearch={() => applyClientSideFilters(allReportData)}
                    isLoading={isLoading}
                    onClearFilters={handleClearFilters}
                    hasActiveFilters={hasActiveFilters}
                />
            </aside>
            <main className="flex-1 min-w-0 flex flex-col gap-4">
                 <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold">Relatórios de Atendimento</h2>
                            <p className="text-xs text-muted-foreground">
                                Use os filtros para gerar consultas precisas e seguras sobre os atendimentos.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant={viewMode === 'diario' ? 'default' : 'outline'} onClick={() => setViewMode('diario')} disabled={isLoading}>Diário</Button>
                            <Button size="sm" variant={viewMode === 'semanal' ? 'default' : 'outline'} onClick={() => setViewMode('semanal')} disabled={isLoading}>Semanal</Button>
                            <Button size="sm" variant={viewMode === 'mensal' ? 'default' : 'outline'} onClick={() => setViewMode('mensal')} disabled={isLoading}>Mensal</Button>
                        
                                <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    size="sm"
                                    className={cn(
                                    "w-[240px] justify-start text-left font-normal",
                                    !dateRange.from && "text-muted-foreground"
                                    )}
                                    disabled={isLoading}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange.from && dateRange.to ? (
                                            `${format(dateRange.from, "dd/MM/yy", { locale: ptBR })} - ${format(dateRange.to, "dd/MM/yy", { locale: ptBR })}`
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
                                    onSelect={handleManualDateSearch}
                                    numberOfMonths={2}
                                    locale={ptBR}
                                    captionLayout="dropdown-buttons"
                                    fromYear={new Date().getFullYear() - 10}
                                    toYear={new Date().getFullYear() + 10}
                                />
                                </PopoverContent>
                            </Popover>
                                <Button variant="outline" onClick={handlePrint} disabled={isLoading} size="sm">
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
                                Imprimir Relatório
                            </Button>
                        </div>
                    </div>
                </div>

                {hasSearched && filteredReportData.length > 0 && (
                     <Card>
                        <AtendimentosChart data={filteredReportData} />
                    </Card>
                )}

                 <Card className="flex flex-col flex-1 min-h-0">
                    <CardContent className="p-0 flex-1 flex flex-col">
                        <div className="flex-1 flex flex-col min-h-0">
                            {isLoading && !hasSearched ? (
                                <div className="flex flex-col items-center justify-center h-full py-10">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p className="mt-4 text-muted-foreground">Carregando relatório...</p>
                                </div>
                            ) : hasSearched && filteredReportData.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full rounded-md border border-dashed py-10 m-4">
                                    <p className="text-muted-foreground">
                                        Nenhum resultado encontrado para os filtros selecionados.
                                    </p>
                                </div>
                            ) : hasSearched && filteredReportData.length > 0 ? (
                                <ScrollArea className="flex-grow">
                                    <div className="space-y-0">
                                        {filteredReportData.map((item) => (
                                            <ReportItemCard key={item.id} atendimento={item} onPrintItem={handlePrintItem} />
                                        ))}
                                    </div>
                                </ScrollArea>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full rounded-md border border-dashed py-10 m-4">
                                    <Filter className="h-10 w-10 text-muted-foreground/50" />
                                    <p className="mt-4 text-center text-muted-foreground">
                                        Use os filtros para gerar o relatório.
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>

                    {hasSearched && filteredReportData.length > 0 && (
                        <CardFooter className="py-3 px-6 border-t bg-card rounded-b-lg">
                            <div className="text-sm text-muted-foreground">
                                Total de Atendimentos no período: <span className="font-bold text-foreground">{filteredReportData.length}</span>
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </main>
        </div>
    );
}
