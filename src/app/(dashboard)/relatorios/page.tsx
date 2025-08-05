"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Search, Printer, Loader2, User, Building, Clock, Megaphone, CheckCircle, LogIn, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { FilaDeEsperaItem } from "@/types/fila";
import { getHistoricoAtendimentosPorPeriodo } from "@/services/filaDeEsperaService";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
  const [dateFrom, setDateFrom] = React.useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = React.useState<Date | undefined>(undefined);
  const [reportData, setReportData] = React.useState<FilaDeEsperaItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    // Set initial dates only on the client-side
    const today = new Date();
    setDateFrom(today);
    setDateTo(today);
  }, []);

  const handleSearch = async () => {
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
        const data = await getHistoricoAtendimentosPorPeriodo(dateFrom, dateTo);
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
  };
  
  const handlePrint = () => {
    // Placeholder for print functionality
    toast({
        title: "Funcionalidade em desenvolvimento",
        description: "A impressão de relatórios será implementada em breve.",
    });
  }

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
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
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-lg bg-muted/40">
            <div className="flex-1 w-full sm:w-auto">
                <span className="text-sm font-medium text-muted-foreground">Data Inicial</span>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                        locale={ptBR}
                    />
                    </PopoverContent>
                </Popover>
            </div>
             <div className="flex-1 w-full sm:w-auto">
                <span className="text-sm font-medium text-muted-foreground">Data Final</span>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        initialFocus
                        locale={ptBR}
                    />
                    </PopoverContent>
                </Popover>
            </div>
        </div>

        <div className="space-y-4">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-60">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Carregando relatório...</p>
                </div>
            ) : reportData.length > 0 ? (
                 <div className="space-y-3">
                    {reportData.map((item) => (
                        <ReportItemCard key={item.id} atendimento={item} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-60 rounded-md border border-dashed">
                    <p className="text-muted-foreground">
                        {hasSearched ? "Nenhum resultado encontrado para o período selecionado." : "Selecione um período e clique em 'Consultar' para gerar o relatório."}
                    </p>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
