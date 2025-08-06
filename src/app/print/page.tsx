

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { FilaDeEsperaItem } from "@/types/fila";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAtendimentoById, getHistoricoAtendimentosPorPeriodoComFiltros } from "@/services/filaDeEsperaService";

interface PrintData {
  title: string;
  items: FilaDeEsperaItem[];
}

function PrintPageContent() {
    const searchParams = useSearchParams();
    const [data, setData] = useState<PrintData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [dateRangeString, setDateRangeString] = useState<string | null>(null);

    useEffect(() => {
        const individualReportId = searchParams.get('id');

        const fetchData = async () => {
            try {
                let printData: PrintData | null = null;
                
                if (individualReportId) {
                    const atendimento = await getAtendimentoById(individualReportId);
                    if (atendimento) {
                        printData = {
                            title: `Relatório Individual do Paciente`,
                            items: [atendimento]
                        };
                         if (atendimento.finalizadaEm) {
                            const dataAtendimento = atendimento.finalizadaEm.toDate();
                            setDateRangeString(`Data do Atendimento: ${format(dataAtendimento, "dd/MM/yyyy", { locale: ptBR })}`);
                        }
                    } else {
                        setError("Atendimento não encontrado.");
                    }
                } else {
                    const fromStr = searchParams.get('from');
                    const toStr = searchParams.get('to');
                    const title = searchParams.get('title') || 'Relatório de Atendimentos';

                    if (fromStr && toStr) {
                        const fromDate = parseISO(fromStr);
                        const toDate = parseISO(toStr);
                        
                        if (format(fromDate, 'dd/MM/yyyy') === format(toDate, 'dd/MM/yyyy')) {
                            setDateRangeString(`Referente ao dia ${format(fromDate, "dd/MM/yyyy", { locale: ptBR })}`);
                        } else {
                            setDateRangeString(`Referente a ${format(fromDate, "dd/MM/yyyy", { locale: ptBR })} até ${format(toDate, "dd/MM/yyyy", { locale: ptBR })}`);
                        }
                        
                         const filters = {
                            dateFrom: fromDate,
                            dateTo: toDate,
                            pacienteId: searchParams.get('pacienteId') || undefined,
                            medicoId: searchParams.get('medicoId') || undefined,
                            departamentoId: searchParams.get('departamentoId') || undefined,
                            classificacao: searchParams.get('classificacao') || undefined,
                        };
                        const items = await getHistoricoAtendimentosPorPeriodoComFiltros(filters);
                        printData = { title, items };
                    } else {
                        setError("Parâmetros de data ausentes para o relatório geral.");
                    }
                }
                
                if (printData) {
                    setData(printData);
                    setTimeout(() => {
                        window.print();
                    }, 500); 
                }
            } catch (err) {
                console.error("Erro ao processar dados de impressão:", err);
                setError((err as Error).message || "Ocorreu um erro desconhecido.");
            }
        };

        fetchData();

        const handleAfterPrint = () => {
            window.close();
        };

        window.onafterprint = handleAfterPrint;

        return () => {
            window.onafterprint = null; 
        };

    }, [searchParams]);

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen text-red-500">
                Erro: {error}
            </div>
        );
    }
    
    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4">Carregando dados para impressão...</p>
            </div>
        );
    }

    return (
        <div className="bg-white text-black font-sans p-8 flex flex-col min-h-screen">
            <header className="mb-6 text-center">
                <h1 className="text-2xl font-bold mb-1">{data.title}</h1>
                 {dateRangeString && (
                    <p className="text-md text-gray-700 font-semibold mb-2">
                        {dateRangeString}
                    </p>
                )}
            </header>
            
            <main className="flex-grow">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="px-2 py-2 text-xs border-b border-black text-black">Data</TableHead>
                            <TableHead className="px-2 py-2 text-xs border-b border-black text-black">Paciente</TableHead>
                            <TableHead className="px-2 py-2 text-xs border-b border-black text-black">Departamento</TableHead>
                            <TableHead className="px-2 py-2 text-xs border-b border-black text-black">Profissional</TableHead>
                            <TableHead className="px-2 py-2 text-xs border-b border-black text-black">Classificação</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.items.map(item => {
                            const dataFinalizacao = item.finalizadaEm?.toDate();
                            const dataFormatada = dataFinalizacao ? format(dataFinalizacao, "dd/MM/yy HH:mm", { locale: ptBR }) : 'N/A';
                            
                            return (
                                <TableRow key={item.id} className="text-xs">
                                    <TableCell className="px-2 py-1 border-b border-gray-200">{dataFormatada}</TableCell>
                                    <TableCell className="px-2 py-1 border-b border-gray-200 font-medium">{item.pacienteNome}</TableCell>
                                    <TableCell className="px-2 py-1 border-b border-gray-200">{item.departamentoNome}{item.departamentoNumero ? ` - Sala ${item.departamentoNumero}` : ''}</TableCell>
                                    <TableCell className="px-2 py-1 border-b border-gray-200">{item.profissionalNome}</TableCell>
                                    <TableCell className="px-2 py-1 border-b border-gray-200 font-semibold">
                                        {item.classificacao}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
                 <div className="mt-4 text-right text-sm font-bold">
                    Total de Atendimentos: {data.items.length}
                </div>
            </main>
             <footer className="mt-auto pt-6 text-center">
                <p className="text-xs text-gray-500">
                    Saúde Fácil - Gestão de Atendimento | Emitido em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm:ss")}
                </p>
            </footer>
        </div>
    );
}

export default function PrintPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /> Carregando...</div>}>
            <PrintPageContent />
        </Suspense>
    );
}
