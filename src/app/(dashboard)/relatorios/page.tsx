

"use client";

import * as React from "react";
import { addDays, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Search, Printer, Loader2, User, Building, CheckCircle, LogIn, Megaphone, Check, Filter } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
    const cardRef = React.useRef<HTMLDivElement>(null);

    const dataFinalizacao = atendimento.finalizadaEm?.toDate();
    const dataFormatada = dataFinalizacao ? format(dataFinalizacao, "dd/MM/yy", { locale: ptBR }) : 'N/A';

    const horaChegada = atendimento.chegadaEm ? format(atendimento.chegadaEm.toDate(), "HH:mm:ss", { locale: ptBR }) : 'N/A';
    const horaChamada = atendimento.chamadaEm ? format(atendimento.chamadaEm.toDate(), "HH:mm:ss", { locale: ptBR }) : 'N/A';
    const horaFinalizacao = dataFinalizacao ? format(dataFinalizacao, "HH:mm:ss", { locale: ptBR }) : 'N/A';

    const handlePrintItem = () => {
        const cardElement = cardRef.current;
        if (cardElement) {
            document.body.classList.add('printing-single-item');
            cardElement.classList.add('print-this');
            window.print();
            cardElement.classList.remove('print-this');
            document.body.classList.remove('printing-single-item');
        }
    }

    return (
        <div ref={cardRef} className="print-item-card w-full">
             <div className="flex items-center justify-between w-full text-sm p-3 border-b print-hide">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex items-center gap-2 font-medium truncate">
                        <User className="h-4 w-4 text-primary" />
                        <span className="truncate">{atendimento.pacienteNome}</span>
                    </div>
                    <Separator orientation="vertical" className="h-5" />
                    <div className="flex items-center gap-2 text-muted-foreground truncate">
                        <Building className="h-4 w-4" />
                        <span className="truncate">{atendimento.departamentoNome}</span>
                    </div>
                    <Separator orientation="vertical" className="h-5" />
                    <div className="flex items-center gap-2 text-muted-foreground truncate">
                        <User className="h-4 w-4" />
                        <span className="truncate">{atendimento.profissionalNome}</span>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-3 ml-auto pl-4 flex-shrink-0">
                    <span className="text-muted-foreground text-xs">{dataFormatada}</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Finalizado
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handlePrintItem} title="Imprimir Atendimento">
                        <Printer className="h-3 w-3" />
                    </Button>
                </div>
            </div>


            <div className="hidden print:block p-4">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Relatório de Atendimento</h2>
                    <span className="text-sm">{dataFormatada}</span>
                </div>

                <Separator className="mb-4" />
                
                <h3 className="font-semibold mb-2">Paciente: <span className="font-normal">{atendimento.pacienteNome}</span></h3>

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

    const applyClientSideFilters = React.useCallback((dataToFilter: FilaDeEsperaItem[]) => {
        let filteredData = [...dataToFilter];
        
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
    },[selectedPacienteId, selectedEnfermeiroId, selectedMedicoId, allReportData, hasSearched, applyClientSideFilters])


    // Handle quick date selection (Diário, Semanal, Mensal)
    React.useEffect(() => {
        if (!isMounted) return;
        
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
    };

    const hasActiveFilters = React.useMemo(() => {
        return (
            selectedPacienteId !== 'todos' ||
            selectedMedicoId !== 'todos' ||
            selectedEnfermeiroId !== 'todos'
        );
    }, [selectedPacienteId, selectedMedicoId, selectedEnfermeiroId]);


    const handlePrint = () => {
        window.print();
    }
    
    const handleManualDateSearch = (range: { from: Date | undefined; to: Date | undefined }) => {
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
        <div className="flex flex-col lg:flex-row gap-6 h-full print-container">
            <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 print-hide">
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
                    onSearch={() => applyClientSideFilters(allReportData)}
                    isLoading={isLoading}
                    onClearFilters={handleClearFilters}
                    hasActiveFilters={hasActiveFilters}
                />
            </aside>
            <main className="flex-1 min-w-0 flex flex-col gap-4">
                 <div className="print-hide">
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
                                <Button variant="outline" onClick={handlePrint} disabled={filteredReportData.length === 0} size="sm">
                                <Printer className="mr-2 h-4 w-4" />
                                Imprimir Relatório
                            </Button>
                        </div>
                    </div>
                </div>

                {hasSearched && filteredReportData.length > 0 && (
                     <AtendimentosChart data={filteredReportData} />
                )}

                <Card className="flex flex-col flex-1">
                    <CardContent className="p-0 flex-1 flex flex-col">
                        <div className="flex-1 flex flex-col min-h-0">
                            {isLoading ? (
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
                                            <ReportItemCard key={item.id} atendimento={item} />
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
                        <CardFooter className="py-3 px-6 border-t print-hide bg-card rounded-b-lg">
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
