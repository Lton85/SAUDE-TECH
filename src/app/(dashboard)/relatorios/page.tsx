
"use client";

import * as React from "react";
import { addDays, format, startOfWeek, endOfWeek, startOfMonth, isToday, endOfMonth, startOfDay, endOfDay, parse, differenceInDays, isEqual, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Search, Printer, Loader2, User, Building, CheckCircle, LogIn, Megaphone, Check, Filter, ShieldQuestion, Fingerprint, Clock, ArrowRight } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { FilaDeEsperaItem } from "@/types/fila";
import { getHistoricoAtendimentosPorPeriodoComFiltros, getAtendimentoById } from "@/services/filaDeEsperaService";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getProfissionais } from "@/services/profissionaisService";
import { getPacientes } from "@/services/pacientesService";
import { getDepartamentos } from "@/services/departamentosService";
import type { Profissional } from "@/types/profissional";
import type { Paciente } from "@/types/paciente";
import type { Departamento } from "@/types/departamento";
import { AtendimentosChart } from "./atendimentos-chart";
import { FiltrosRelatorio } from "./filtros-relatorio";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const ReportItemCard = ({ atendimento, onPrintItem }: { atendimento: FilaDeEsperaItem, onPrintItem: (itemId: string) => void }) => {
    const dataFinalizacao = atendimento.finalizadaEm?.toDate();
    const dataHoraFormatada = dataFinalizacao ? format(dataFinalizacao, "dd/MM/yyyy - HH:mm:ss", { locale: ptBR }) : 'N/A';

    return (
        <div className="w-full border-b last:border-b-0">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center p-3 hover:bg-muted/50 transition-colors text-xs space-x-4">
                {/* Left Side: Patient, Dept, Prof */}
                <div className="flex items-center justify-start gap-3 flex-shrink-0 min-w-0">
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
                 <div className="flex items-center justify-center text-muted-foreground">
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
    const [profissionais, setProfissionais] = React.useState<Profissional[]>([]);
    const [departamentos, setDepartamentos] = React.useState<Departamento[]>([]);
    
    const [selectedPacienteId, setSelectedPacienteId] = React.useState<string>("todos");
    const [selectedProfissionalId, setSelectedProfissionalId] = React.useState<string>("todos");
    const [selectedDepartamentoId, setSelectedDepartamentoId] = React.useState<string>("todos");
    const [selectedClassificacao, setSelectedClassificacao] = React.useState<string>("todos");


    const [allReportData, setAllReportData] = React.useState<FilaDeEsperaItem[]>([]);
    const [filteredReportData, setFilteredReportData] = React.useState<FilaDeEsperaItem[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [isMounted, setIsMounted] = React.useState(false);

    const today = startOfDay(new Date());
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({ from: today, to: today });
    const [dateFromInput, setDateFromInput] = React.useState<string>(format(today, 'dd/MM/yyyy'));
    const [dateToInput, setDateToInput] = React.useState<string>(format(today, 'dd/MM/yyyy'));

    const [viewMode, setViewMode] = React.useState<'diario' | 'semanal' | 'mensal' | 'personalizado'>('diario');
    
    React.useEffect(() => {
        if (dateRange?.from) {
            setDateFromInput(format(dateRange.from, 'dd/MM/yyyy'));
        } else {
            setDateFromInput('');
        }
    }, [dateRange?.from]);

    React.useEffect(() => {
        if (dateRange?.to) {
            setDateToInput(format(dateRange.to, 'dd/MM/yyyy'));
        } else {
            setDateToInput('');
        }
    }, [dateRange?.to]);


    const applyClientSideFilters = React.useCallback((dataToFilter: FilaDeEsperaItem[]) => {
        let filteredData = [...dataToFilter];
        
        if (selectedPacienteId !== 'todos') {
            filteredData = filteredData.filter(item => item.pacienteId === selectedPacienteId);
        }

        if (selectedProfissionalId !== 'todos') {
            const profissional = profissionais.find(m => m.id === selectedProfissionalId);
            if(profissional) filteredData = filteredData.filter(item => item.profissionalNome === `Dr(a). ${profissional.nome}`);
        }

        if (selectedDepartamentoId !== 'todos') {
            filteredData = filteredData.filter(item => item.departamentoId === selectedDepartamentoId);
        }
        
        if (selectedClassificacao !== 'todos') {
            filteredData = filteredData.filter(item => item.classificacao === selectedClassificacao);
        }

        setFilteredReportData(filteredData);
    }, [selectedPacienteId, selectedProfissionalId, selectedDepartamentoId, selectedClassificacao, profissionais]);
    
    const handleSearch = React.useCallback(async () => {
        if (!dateRange?.from || !dateRange?.to) {
            toast({
                title: "Período inválido",
                description: "Por favor, selecione uma data de início e fim para a busca.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        setHasSearched(true);
        try {
            const data = await getHistoricoAtendimentosPorPeriodoComFiltros({ 
                dateFrom: dateRange.from, 
                dateTo: dateRange.to,
                pacienteId: selectedPacienteId === 'todos' ? undefined : selectedPacienteId,
                profissionalId: selectedProfissionalId === 'todos' ? undefined : selectedProfissionalId,
                departamentoId: selectedDepartamentoId === 'todos' ? undefined : selectedDepartamentoId,
                classificacao: selectedClassificacao === 'todos' ? undefined : selectedClassificacao,
            });
            setAllReportData(data);
            setFilteredReportData(data); // No need for client-side filtering anymore
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
    }, [dateRange, toast, selectedPacienteId, selectedProfissionalId, selectedDepartamentoId, selectedClassificacao]);

     React.useEffect(() => {
        if (!isMounted) return;
        // Do not auto-search in personalized mode until a full range is selected
        if (!dateRange?.from || !dateRange?.to) {
            return;
        }
        handleSearch();
    }, [isMounted, dateRange, handleSearch]);
    
    // Initial data load for today
    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // Fetch filter options (pacientes, profissionais, etc.)
    React.useEffect(() => {
        const fetchFiltersData = async () => {
            try {
                const [profissionaisData, pacientesData, departamentosData] = await Promise.all([
                    getProfissionais(), 
                    getPacientes(),
                    getDepartamentos(),
                ]);
                setProfissionais(profissionaisData);
                setPacientes(pacientesData);
                setDepartamentos(departamentosData);
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
    

    // Handle quick date selection (Diário, Semanal, Mensal)
    const handleViewModeChange = (mode: 'diario' | 'semanal' | 'mensal' | 'personalizado') => {
        setViewMode(mode);
        const today = startOfDay(new Date());
        let newFrom, newTo;

        if (mode === 'diario') {
            newFrom = today;
            newTo = today;
        } else if (mode === 'semanal') {
            newFrom = startOfWeek(today, { locale: ptBR });
            newTo = endOfWeek(today, { locale: ptBR });
        } else if (mode === 'mensal') {
            newFrom = startOfMonth(today);
            newTo = endOfMonth(today);
        } else {
            const from = dateRange?.from || startOfMonth(new Date());
            const to = dateRange?.to || endOfMonth(new Date());
            setDateRange({ from, to });
            setFilteredReportData([]);
            setAllReportData([]);
            setHasSearched(false);
            return;
        }
        setDateRange({ from: newFrom, to: newTo });
    };
    
     const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'from' | 'to') => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 2) value = `${value.slice(0, 2)}/${value.slice(2)}`;
        if (value.length > 5) value = `${value.slice(0, 5)}/${value.slice(5, 9)}`;
        
        if (field === 'from') {
            setDateFromInput(value);
        } else {
            setDateToInput(value);
        }
    };
    
    const handleDateInputBlur = (field: 'from' | 'to') => {
        const dateInput = field === 'from' ? dateFromInput : dateToInput;
        const date = parse(dateInput, 'dd/MM/yyyy', new Date());

        if (isValid(date)) {
            if (field === 'from') {
                setDateRange(prev => ({ ...prev, from: date, to: prev?.to && date > prev.to ? date : prev.to }));
            } else {
                setDateRange(prev => ({ ...prev, to: date }));
            }
            setViewMode('personalizado');
        } else if(dateInput === '') {
             if (field === 'from') {
                setDateRange(prev => ({...prev, from: undefined}));
             } else {
                setDateRange(prev => ({...prev, to: undefined}));
             }
        }
    };

    const handleClearFilters = () => {
        setSelectedPacienteId('todos');
        setSelectedProfissionalId('todos');
        setSelectedDepartamentoId('todos');
        setSelectedClassificacao('todos');
        handleViewModeChange('diario');
    };

    const hasActiveSelectFilters = React.useMemo(() => {
        return (
            selectedPacienteId !== 'todos' ||
            selectedProfissionalId !== 'todos' ||
            selectedDepartamentoId !== 'todos' ||
            selectedClassificacao !== 'todos'
        );
    }, [selectedPacienteId, selectedProfissionalId, selectedDepartamentoId, selectedClassificacao]);

    const hasActiveDateFilter = React.useMemo(() => {
        if (!dateRange?.from) return false;
        if (viewMode === 'personalizado') return true;
        
        const today = startOfDay(new Date());
        const fromIsToday = isEqual(startOfDay(dateRange.from), today);
        const toIsToday = dateRange.to ? isEqual(startOfDay(dateRange.to), today) : false;

        if(viewMode === 'diario') return !fromIsToday || !toIsToday;
        
        return true;
    }, [dateRange, viewMode]);

    const hasActiveFilters = hasActiveSelectFilters || hasActiveDateFilter;


     const reportTitle = React.useMemo(() => {
        if (viewMode === 'diario') return "Relatório Diário de Atendimentos";
        if (viewMode === 'semanal') return "Relatório Semanal de Atendimentos";
        if (viewMode === 'mensal') return "Relatório Mensal de Atendimentos";
        
        if (dateRange?.from && dateRange.to) {
            const from = format(dateRange.from, 'dd/MM/yy');
            const to = format(dateRange.to, 'dd/MM/yy');
            return from === to ? `Relatório de Atendimentos de ${from}` : `Relatório de Atendimentos de ${from} a ${to}`;
        }
        
        if (dateRange?.from) {
             return `Relatório de Atendimentos a partir de ${format(dateRange.from, 'dd/MM/yy')}`;
        }

        return "Relatório de Atendimentos";
    }, [viewMode, dateRange]);


    const handlePrint = () => {
         if (!dateRange?.from || !dateRange.to) {
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
        if (selectedProfissionalId !== 'todos') queryParams.set('profissionalId', selectedProfissionalId);
        if (selectedDepartamentoId !== 'todos') queryParams.set('departamentoId', selectedDepartamentoId);
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
                    profissionais={profissionais}
                    departamentos={departamentos}
                    selectedPacienteId={selectedPacienteId}
                    onPacienteChange={setSelectedPacienteId}
                    selectedProfissionalId={selectedProfissionalId}
                    onProfissionalChange={setSelectedProfissionalId}
                    selectedDepartamentoId={selectedDepartamentoId}
                    onDepartamentoChange={setSelectedDepartamentoId}
                    selectedClassificacao={selectedClassificacao}
                    onClassificacaoChange={setSelectedClassificacao}
                    onSearch={handleSearch}
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
                    </div>
                     <Card className="mt-4">
                        <CardContent className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                     <div className="space-y-2 col-span-3">
                                        <Label className="text-xs">Visualização Rápida</Label>
                                        <div className="flex items-center gap-1">
                                            <Button size="sm" variant={viewMode === 'diario' ? 'default' : 'outline'} className="w-full text-xs" onClick={() => handleViewModeChange('diario')} disabled={isLoading}>Diário</Button>
                                            <Button size="sm" variant={viewMode === 'semanal' ? 'default' : 'outline'} className="w-full text-xs" onClick={() => handleViewModeChange('semanal')} disabled={isLoading}>Semanal</Button>
                                            <Button size="sm" variant={viewMode === 'mensal' ? 'default' : 'outline'} className="w-full text-xs" onClick={() => handleViewModeChange('mensal')} disabled={isLoading}>Mensal</Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-4 grid grid-cols-2 gap-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="date-from" className="text-xs">Data de Início</Label>
                                        <div className="relative">
                                            <Input
                                                id="date-from"
                                                value={dateFromInput}
                                                onChange={(e) => handleDateInputChange(e, 'from')}
                                                onBlur={() => handleDateInputBlur('from')}
                                                placeholder="DD/MM/AAAA"
                                                className="h-9 pr-8"
                                                disabled={isLoading}
                                                onClick={() => setViewMode('personalizado')}
                                            />
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-2" disabled={isLoading}>
                                                        <CalendarIcon className="h-4 w-4" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="range"
                                                        selected={dateRange}
                                                        onSelect={setDateRange}
                                                        initialFocus
                                                        numberOfMonths={2}
                                                        pagedNavigation
                                                        captionLayout="dropdown-buttons" fromYear={2015} toYear={2035}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="date-to" className="text-xs">Data de Fim</Label>
                                         <div className="relative">
                                            <Input
                                                id="date-to"
                                                value={dateToInput}
                                                onChange={(e) => handleDateInputChange(e, 'to')}
                                                onBlur={() => handleDateInputBlur('to')}
                                                placeholder="DD/MM/AAAA"
                                                className="h-9 pr-8"
                                                disabled={isLoading || !dateRange?.from}
                                                onClick={() => setViewMode('personalizado')}
                                            />
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-2" disabled={isLoading || !dateRange?.from}>
                                                        <CalendarIcon className="h-4 w-4" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="range"
                                                        selected={dateRange}
                                                        onSelect={setDateRange}
                                                        disabled={{ before: dateRange?.from! }}
                                                        initialFocus
                                                        numberOfMonths={2}
                                                        pagedNavigation
                                                        captionLayout="dropdown-buttons" fromYear={2015} toYear={2035}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-3 flex items-end gap-2">
                                    <Button onClick={handleSearch} className="flex-1" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                                        Buscar
                                    </Button>
                                    <Button variant="outline" onClick={handlePrint} disabled={isLoading || !hasSearched} className="flex-1">
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
                                        Imprimir
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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
                                <ScrollArea className="flex-grow h-96">
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
                                        Selecione um período para gerar o relatório.
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

    