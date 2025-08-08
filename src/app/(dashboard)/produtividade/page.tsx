
"use client";

import * as React from "react";
import { addDays, format, startOfWeek, endOfWeek, startOfMonth, isToday, endOfMonth, startOfDay, endOfDay, parse, differenceInDays, isEqual, isValid, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Search, Printer, Loader2, BarChart, Clock, Timer } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { FilaDeEsperaItem } from "@/types/fila";
import { getHistoricoAtendimentosPorPeriodoComFiltros } from "@/services/filaDeEsperaService";
import { AtendimentosChart } from "../relatorios/atendimentos-chart";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const KpiCard = ({ title, value, icon: Icon, isLoading }: { title: string, value: string, icon: React.ElementType, isLoading: boolean }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-3 pt-0">
            {isLoading ? (
                <div className="h-7 w-20 bg-muted animate-pulse rounded-md" />
            ) : (
                <div className="text-xl font-bold">{value}</div>
            )}
        </CardContent>
    </Card>
);


export default function ProdutividadePage() {
    const { toast } = useToast();
    const [reportData, setReportData] = React.useState<FilaDeEsperaItem[]>([]);
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
            });
            setReportData(data);
        } catch (error) {
            console.error("Erro ao buscar dados: ", error);
            toast({
                title: "Erro ao buscar dados",
                description: (error as Error).message,
                variant: "destructive"
            });
            setReportData([]);
        } finally {
            setIsLoading(false);
        }
    }, [dateRange, toast]);

     React.useEffect(() => {
        if (!isMounted) return;
        if (!dateRange?.from || !dateRange?.to) {
            return;
        }
        handleSearch();
    }, [isMounted, dateRange, handleSearch]);
    
    React.useEffect(() => {
        setIsMounted(true);
    }, []);

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
            setReportData([]);
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
    
    const kpiData = React.useMemo(() => {
        if (isLoading || reportData.length === 0) {
            return { total: 0, avgWait: 0, avgService: 0 };
        }

        const validFinalized = reportData.filter(item => 
            item.status === 'finalizado' && 
            item.chegadaEm && 
            item.chamadaEm &&
            item.finalizadaEm
        );

        const totalWaitMinutes = validFinalized.reduce((sum, item) => {
             const wait = differenceInMinutes(item.chamadaEm!.toDate(), item.chegadaEm!.toDate());
             return sum + wait;
        }, 0);

        const totalServiceMinutes = validFinalized.reduce((sum, item) => {
             const service = differenceInMinutes(item.finalizadaEm!.toDate(), item.chamadaEm!.toDate());
             return sum + service;
        }, 0);
        
        const avgWait = validFinalized.length > 0 ? totalWaitMinutes / validFinalized.length : 0;
        const avgService = validFinalized.length > 0 ? totalServiceMinutes / validFinalized.length : 0;

        return {
            total: reportData.length,
            avgWait: Math.round(avgWait),
            avgService: Math.round(avgService)
        }
    }, [reportData, isLoading]);

    if (!isMounted) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div>
                <h2 className="text-lg font-semibold">Gráficos de Produtividade</h2>
                <p className="text-xs text-muted-foreground">
                    Visualize o desempenho dos atendimentos por período.
                </p>
            </div>
             <Card>
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
                        <div className="md:col-span-3 flex items-end">
                            <Button onClick={handleSearch} className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                                Buscar
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

             <div className="space-y-4">
                {hasSearched && (
                    <div className="grid gap-4 md:grid-cols-3">
                        <KpiCard title="Total de Atendimentos" value={kpiData.total.toString()} icon={BarChart} isLoading={isLoading} />
                        <KpiCard title="Tempo Médio de Espera" value={`${kpiData.avgWait} min`} icon={Clock} isLoading={isLoading} />
                        <KpiCard title="Tempo Médio de Atendimento" value={`${kpiData.avgService} min`} icon={Timer} isLoading={isLoading} />
                    </div>
                )}
                 <div className="grid grid-cols-1 gap-4">
                     {isLoading ? (
                         <Card className="w-full h-96 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </Card>
                     ) : hasSearched && reportData.length === 0 ? (
                         <Card className="w-full h-96 flex items-center justify-center">
                            <p className="text-muted-foreground">Nenhum dado encontrado para o período.</p>
                        </Card>
                     ) : hasSearched && reportData.length > 0 ? (
                         <AtendimentosChart data={reportData} />
                     ) : (
                        <Card className="w-full h-96 flex items-center justify-center">
                            <p className="text-muted-foreground">Selecione um período para ver os gráficos.</p>
                        </Card>
                     )}
                </div>
            </div>
        </div>
    );
}

