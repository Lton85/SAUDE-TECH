
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
import { getHistoricoAtendimentosPorPeriodoComFiltros } from "@/services/filaDeEsperaService";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getMedicos } from "@/services/medicosService";
import { getEnfermeiros } from "@/services/enfermeirosService";
import { getPacientes } from "@/services/pacientesService";
import { getDepartamentos } from "@/services/departamentosService";
import type { Medico } from "@/types/medico";
import type { Enfermeiro } from "@/types/enfermeiro";
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
    const [medicos, setMedicos] = React.useState<Medico[]>([]);
    const [enfermeiros, setEnfermeiros] = React.useState<Enfermeiro[]>([]);
    const [departamentos, setDepartamentos] = React.useState<Departamento[]>([]);
    
    const [selectedPacienteId, setSelectedPacienteId] = React.useState<string>("todos");
    const [selectedMedicoId, setSelectedMedicoId] = React.useState<string>("todos");
    const [selectedEnfermeiroId, setSelectedEnfermeiroId] = React.useState<string>("todos");
    const [selectedDepartamentoId, setSelectedDepartamentoId] = React.useState<string>("todos");
    const [selectedClassificacao, setSelectedClassificacao] = React.useState<string>("todos");


    const [allReportData, setAllReportData] = React.useState<FilaDeEsperaItem[]>([]);
    const [filteredReportData, setFilteredReportData] = React.useState<FilaDeEsperaItem[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [isMounted, setIsMounted] = React.useState(false);

    const today = startOfDay(new Date());
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({ from: today, to: today });
    const [viewMode, setViewMode] = React.useState<'diario' | 'semanal' | 'mensal' | 'personalizado'>('diario');
    
    const [inputValueFrom, setInputValueFrom] = React.useState<string>(format(today, "dd/MM/yyyy"));
    const [inputValueTo, setInputValueTo] = React.useState<string>(format(today, "dd/MM/yyyy"));


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

        if (selectedDepartamentoId !== 'todos') {
            filteredData = filteredData.filter(item => item.departamentoId === selectedDepartamentoId);
        }
        
        if (selectedClassificacao !== 'todos') {
            filteredData = filteredData.filter(item => item.classificacao === selectedClassificacao);
        }

        setFilteredReportData(filteredData);
    }, [selectedPacienteId, selectedMedicoId, selectedEnfermeiroId, selectedDepartamentoId, selectedClassificacao, medicos, enfermeiros]);
    
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

    // Fetch filter options (pacientes, medicos, etc.)
    React.useEffect(() => {
        const fetchFiltersData = async () => {
            try {
                const [medicosData, enfermeirosData, pacientesData, departamentosData] = await Promise.all([
                    getMedicos(), 
                    getEnfermeiros(),
                    getPacientes(),
                    getDepartamentos(),
                ]);
                setMedicos(medicosData);
                setEnfermeiros(enfermeirosData);
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
    
    // re-apply client filters when they change
    React.useEffect(() => {
        if(hasSearched){
            applyClientSideFilters(allReportData);
        }
    },[selectedPacienteId, selectedEnfermeiroId, selectedMedicoId, selectedDepartamentoId, selectedClassificacao, allReportData, hasSearched, applyClientSideFilters])


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
             const from = startOfMonth(new Date());
             const to = endOfMonth(new Date());
             setDateRange({ from: from, to: to });
             setInputValueFrom(format(from, "dd/MM/yyyy"));
             setInputValueTo(format(to, "dd/MM/yyyy"));
             setFilteredReportData([]);
             setAllReportData([]);
             setHasSearched(false);
             return;
        }
        setDateRange({ from: newFrom, to: newTo });
        setInputValueFrom(format(newFrom, "dd/MM/yyyy"));
        setInputValueTo(format(newTo, "dd/MM/yyyy"));
    }


    const handleClearFilters = () => {
        setSelectedPacienteId('todos');
        setSelectedMedicoId('todos');
        setSelectedEnfermeiroId('todos');
        setSelectedDepartamentoId('todos');
        setSelectedClassificacao('todos');
        handleViewModeChange('diario');
    };

    const hasActiveSelectFilters = React.useMemo(() => {
        return (
            selectedPacienteId !== 'todos' ||
            selectedMedicoId !== 'todos' ||
            selectedEnfermeiroId !== 'todos' ||
            selectedDepartamentoId !== 'todos' ||
            selectedClassificacao !== 'todos'
        );
    }, [selectedPacienteId, selectedMedicoId, selectedEnfermeiroId, selectedDepartamentoId, selectedClassificacao]);

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
        if (selectedMedicoId !== 'todos') queryParams.set('medicoId', selectedMedicoId);
        if (selectedEnfermeiroId !== 'todos') queryParams.set('enfermeiroId', selectedEnfermeiroId);
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
    
    const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'from' | 'to') => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 2) value = `${value.slice(0, 2)}/${value.slice(2)}`;
        if (value.length > 5) value = `${value.slice(0, 5)}/${value.slice(5, 9)}`;
        
        if (field === 'from') setInputValueFrom(value);
        else setInputValueTo(value);
    };

    const handleDateInputBlur = (e: React.FocusEvent<HTMLInputElement>, field: 'from' | 'to') => {
        const date = parse(e.target.value, 'dd/MM/yyyy', new Date());
        if (isValid(date)) {
            if (field === 'from') {
                setDateRange(prev => ({ ...prev, from: date }));
            } else {
                setDateRange(prev => ({ ...prev, to: date }));
            }
        } else {
             if (field === 'from') setInputValueFrom(dateRange?.from ? format(dateRange.from, 'dd/MM/yyyy') : '');
             else setInputValueTo(dateRange?.to ? format(dateRange.to, 'dd/MM/yyyy') : '');
        }
    };
    
    const handleDateSelect = (day: Date | undefined, field: 'from' | 'to') => {
        if (!day) return;
        if (field === 'from') {
            setDateRange(prev => ({ ...prev, from: day, to: prev?.to && day > prev.to ? day : prev.to }));
            setInputValueFrom(format(day, 'dd/MM/yyyy'));
            if (dateRange?.to && day > dateRange.to) {
                setInputValueTo(format(day, 'dd/MM/yyyy'));
            }
        } else {
             setDateRange(prev => ({ ...prev, to: day }));
             setInputValueTo(format(day, 'dd/MM/yyyy'));
        }
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
                    departamentos={departamentos}
                    selectedPacienteId={selectedPacienteId}
                    onPacienteChange={setSelectedPacienteId}
                    selectedMedicoId={selectedMedicoId}
                    onMedicoChange={setSelectedMedicoId}
                    selectedEnfermeiroId={selectedEnfermeiroId}
                    onEnfermeiroChange={setSelectedEnfermeiroId}
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
                         <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={handlePrint} disabled={isLoading || !hasSearched} size="sm">
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
                                Imprimir Relatório
                            </Button>
                        </div>
                    </div>
                     <Card className="mt-4">
                        <CardContent className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                     <div className="space-y-2">
                                        <Label className="text-xs">Visualização Rápida</Label>
                                        <div className="flex items-center gap-1">
                                            <Button size="sm" variant={viewMode === 'diario' ? 'default' : 'outline'} className="w-full text-xs" onClick={() => handleViewModeChange('diario')} disabled={isLoading}>Diário</Button>
                                            <Button size="sm" variant={viewMode === 'semanal' ? 'default' : 'outline'} className="w-full text-xs" onClick={()={() => handleViewModeChange('semanal')} disabled={isLoading}>Semanal</Button>
                                            <Button size="sm" variant={viewMode === 'mensal' ? 'default' : 'outline'} className="w-full text-xs" onClick={() => handleViewModeChange('mensal')} disabled={isLoading}>Mensal</Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="date-from" className="text-xs">Data de Início</Label>
                                        <div className="relative">
                                            <Input
                                                id="date-from"
                                                className="h-9 pr-8"
                                                value={inputValueFrom}
                                                onChange={(e) => handleDateInputChange(e, 'from')}
                                                onBlur={(e) => handleDateInputBlur(e, 'from')}
                                                onClick={() => setViewMode('personalizado')}
                                                placeholder="DD/MM/AAAA"
                                                disabled={isLoading}
                                            />
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-2" disabled={isLoading}>
                                                        <CalendarIcon className="h-4 w-4" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={dateRange?.from}
                                                        onSelect={(day) => handleDateSelect(day, 'from')}
                                                        initialFocus
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
                                                className="h-9 pr-8"
                                                value={inputValueTo}
                                                onChange={(e) => handleDateInputChange(e, 'to')}
                                                onBlur={(e) => handleDateInputBlur(e, 'to')}
                                                onClick={() => setViewMode('personalizado')}
                                                placeholder="DD/MM/AAAA"
                                                disabled={isLoading || !dateRange?.from}
                                            />
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-2" disabled={isLoading || !dateRange?.from}>
                                                        <CalendarIcon className="h-4 w-4" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={dateRange?.to}
                                                        onSelect={(day) => handleDateSelect(day, 'to')}
                                                        disabled={{ before: dateRange?.from! }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                </div>
                                <Button onClick={handleSearch} className="w-full" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                                    Buscar
                                </Button>
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
