
"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Search, Printer } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { FilaDeEsperaItem } from "@/types/fila";

export default function RelatoriosPage() {
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = React.useState<Date | undefined>(new Date());
  const [dateTo, setDateTo] = React.useState<Date | undefined>(new Date());
  const [reportData, setReportData] = React.useState<FilaDeEsperaItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);

  const handleSearch = async () => {
    // Placeholder for search functionality
    toast({
        title: "Funcionalidade em desenvolvimento",
        description: "A busca de relatórios será implementada em breve.",
    });
    setHasSearched(true);
  };
  
  const handlePrint = () => {
    // Placeholder for print functionality
    toast({
        title: "Funcionalidade em desenvolvimento",
        description: "A impressão de relatórios será implementada em breve.",
    });
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
                    <Search className="mr-2 h-4 w-4" />
                    {isLoading ? "Consultando..." : "Consultar"}
                </Button>
                 <Button variant="outline" onClick={handlePrint}>
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

        <div className="border rounded-md">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Data do Atendimento</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">Carregando...</TableCell>
                    </TableRow>
                ) : reportData.length > 0 ? (
                    reportData.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.pacienteNome}</TableCell>
                        <TableCell>{item.finalizadaEm ? format(item.finalizadaEm.toDate(), "dd/MM/yyyy HH:mm") : 'N/A'}</TableCell>
                        <TableCell>{item.departamentoNome}</TableCell>
                        <TableCell>{item.profissionalNome}</TableCell>
                         <TableCell>{item.status}</TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-60 text-center text-muted-foreground">
                            {hasSearched ? "Nenhum resultado encontrado para o período selecionado." : "Selecione um período e clique em 'Consultar' para gerar o relatório."}
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
