

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { FilaDeEsperaItem } from "@/types/fila";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { getAtendimentoById, getHistoricoAtendimentosPorPeriodoComFiltros } from "@/services/filaDeEsperaService";

interface PrintData {
  title: string;
  items: FilaDeEsperaItem[];
}

const ReportItem = ({ atendimento }: { atendimento: FilaDeEsperaItem }) => {
    const toDate = (timestamp: any): Date | null => {
        if (!timestamp) return null;
        if (typeof timestamp.toDate === 'function') return timestamp.toDate();
        if (typeof timestamp === 'string') {
            const date = new Date(timestamp);
            if (!isNaN(date.getTime())) return date;
        }
        if (timestamp instanceof Date) return timestamp;
        return null;
    };

    const chegadaDate = toDate(atendimento.chegadaEm);
    const chamadaDate = toDate(atendimento.chamadaEm);
    const finalizacaoDate = toDate(atendimento.finalizadaEm);

    const horaChegada = chegadaDate ? format(chegadaDate, "HH:mm:ss", { locale: ptBR }) : 'N/A';
    const horaChamada = chamadaDate ? format(chamadaDate, "HH:mm:ss", { locale: ptBR }) : 'N/A';
    const horaFinalizacao = finalizacaoDate ? format(finalizacaoDate, "HH:mm:ss", { locale: ptBR }) : 'N/A';
    const dataFormatada = finalizacaoDate ? format(finalizacaoDate, "dd/MM/yyyy", { locale: ptBR }) : 'N/A';

    return (
        <div className="p-4 border border-black break-inside-avoid text-sm">
            <div className="flex items-center justify-between text-xs">
                <div>
                     <div className="font-bold text-base uppercase">{atendimento.pacienteNome}</div>
                     <div className="text-muted-foreground">{atendimento.departamentoNome}{atendimento.departamentoNumero ? ` - Sala ${atendimento.departamentoNumero}` : ''}</div>
                     <div className="text-muted-foreground">{atendimento.profissionalNome}</div>
                </div>
                 <div className="flex flex-col items-end gap-1">
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
                     <div className="flex items-center text-black">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        <span>Finalizado em {dataFormatada}</span>
                    </div>
                 </div>
            </div>

            <Separator className="my-2 bg-black/20"/>
            
             <div className="flex justify-around text-xs mt-2">
                <div className="text-center">
                    <div className="font-semibold">Entrada na Fila</div>
                    <div className="font-mono text-black font-semibold">{horaChegada}</div>
                </div>
                <div className="text-center">
                    <div className="font-semibold">Chamada no Painel</div>
                    <div className="font-mono text-black font-semibold">{horaChamada}</div>
                </div>
                <div className="text-center">
                    <div className="font-semibold">Finalização</div>
                    <div className="font-mono text-black font-semibold">{horaFinalizacao}</div>
                </div>
            </div>
        </div>
    );
};


function PrintPageContent() {
    const searchParams = useSearchParams();
    const [data, setData] = useState<PrintData | null>(null);
    const [error, setError] = useState<string | null>(null);

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
                    } else {
                        setError("Atendimento não encontrado.");
                    }
                } else {
                    const fromStr = searchParams.get('from');
                    const toStr = searchParams.get('to');
                    const title = searchParams.get('title') || 'Relatório de Atendimentos';

                    if (fromStr && toStr) {
                         const filters = {
                            dateFrom: parseISO(fromStr),
                            dateTo: parseISO(toStr),
                            pacienteId: searchParams.get('pacienteId') || undefined,
                            medicoId: searchParams.get('medicoId') || undefined,
                            enfermeiroId: searchParams.get('enfermeiroId') || undefined,
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
        <div className="bg-white text-black font-sans p-8">
            <header className="mb-6 text-center">
                <h1 className="text-2xl font-bold mb-2">{data.title}</h1>
                <p className="text-sm text-gray-600">
                    Saúde Fácil - Gestão de Atendimento | Emitido em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm:ss")}
                </p>
            </header>
            
            <main>
                <div className="space-y-4">
                     {data.items.map(item => (
                        <ReportItem key={item.id} atendimento={item} />
                     ))}
                </div>
            </main>
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
