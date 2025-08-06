
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { FilaDeEsperaItem } from "@/types/fila";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, User, Building } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface PrintData {
  title: string;
  items: FilaDeEsperaItem[];
}

const IndividualReportItem = ({ atendimento }: { atendimento: FilaDeEsperaItem }) => {
    const toDate = (timestamp: any): Date | null => {
        if (!timestamp) return null;
        if (typeof timestamp.toDate === 'function') {
            return timestamp.toDate();
        }
        if (timestamp instanceof Date) {
            return timestamp;
        }
        return new Date(timestamp);
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
            <div className="flex items-start justify-between">
                <h2 className="text-lg font-bold uppercase">{atendimento.pacienteNome}</h2>
                <div className="flex items-center gap-2">
                    <Badge
                        className={cn(
                            'text-xs text-white',
                            atendimento.classificacao === 'Urgência' && 'bg-red-500',
                            atendimento.classificacao === 'Preferencial' && 'bg-amber-500',
                            atendimento.classificacao === 'Normal' && 'bg-green-500'
                        )}
                    >
                        {atendimento.classificacao}
                    </Badge>
                     <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Finalizado em {dataFormatada}
                    </Badge>
                </div>
            </div>

            <Separator className="my-2 bg-black" />

             <div className="flex justify-between gap-4">
                <div>
                    <span className="font-semibold">Departamento:</span>
                    <span className="ml-1">{atendimento.departamentoNome}{atendimento.departamentoNumero ? ` - Sala ${atendimento.departamentoNumero}` : ''}</span>
                </div>
                <div>
                    <span className="font-semibold">Profissional:</span>
                    <span className="ml-1">{atendimento.profissionalNome}</span>
                </div>
            </div>

             <Separator className="my-2 bg-black" />

             <div className="flex justify-around text-xs text-gray-600">
                <span>Entrada na Fila: <span className="font-mono text-black font-semibold">{horaChegada}</span></span>
                <span>Chamada no Painel: <span className="font-mono text-black font-semibold">{horaChamada}</span></span>
                <span>Finalização: <span className="font-mono text-black font-semibold">{horaFinalizacao}</span></span>
            </div>
        </div>
    );
};


const GeneralReportItem = ({ atendimento }: { atendimento: FilaDeEsperaItem }) => {
    const dataFinalizacao = atendimento.finalizadaEm && typeof (atendimento.finalizadaEm as any).toDate === 'function' 
        ? (atendimento.finalizadaEm as any).toDate() 
        : atendimento.finalizadaEm ? new Date(atendimento.finalizadaEm as any) : null;
        
    const dataFormatada = dataFinalizacao ? format(dataFinalizacao, "dd/MM/yy", { locale: ptBR }) : 'N/A';

     return (
        <div className="w-full border-b text-xs py-2 px-1 break-inside-avoid">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 font-medium truncate w-1/3">
                        <User className="h-3 w-3" />
                        <span className="truncate">{atendimento.pacienteNome}</span>
                    </div>
                     <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-2 text-gray-600 truncate w-1/3">
                        <Building className="h-3 w-3" />
                        <span className="truncate">{atendimento.departamentoNome}</span>
                    </div>
                     <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-2 text-gray-600 truncate w-1/3">
                        <User className="h-3 w-3" />
                        <span className="truncate">{atendimento.profissionalNome}</span>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-2 ml-auto pl-3 flex-shrink-0">
                    <span className="text-gray-600 text-xs">{dataFormatada}</span>
                    <Badge
                        className={cn(
                            'text-xs text-white',
                            atendimento.classificacao === 'Urgência' && 'bg-red-500',
                            atendimento.classificacao === 'Preferencial' && 'bg-amber-500',
                            atendimento.classificacao === 'Normal' && 'bg-green-500'
                        )}
                    >
                        {atendimento.classificacao}
                    </Badge>
                </div>
            </div>
        </div>
    )
}


export default function PrintPage() {
    const [data, setData] = useState<PrintData | null>(null);

    useEffect(() => {
        const storedData = localStorage.getItem('print-data');
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData, (key, value) => {
                    if (key.endsWith('Em') && value && value.seconds) {
                        return new Date(value.seconds * 1000 + value.nanoseconds / 1000000);
                    }
                    if (key.endsWith('Em') && typeof value === 'string') {
                        const date = new Date(value);
                        if (!isNaN(date.getTime())) {
                            return date;
                        }
                    }
                    return value;
                });
                
                setData(parsedData);

                setTimeout(() => {
                    window.print();
                }, 500); 

                window.onafterprint = () => {
                    localStorage.removeItem('print-data');
                    window.close();
                };

            } catch (error) {
                console.error("Error parsing print data from localStorage", error);
                localStorage.removeItem('print-data');
            }
        }
    }, []);

    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                Carregando dados para impressão...
            </div>
        );
    }
    
    const isIndividualReport = data.title === "Relatório Individual do Paciente" && data.items.length === 1;

    return (
        <div className="bg-white text-black font-sans p-8">
            <header className="mb-6 text-center">
                <h1 className="text-2xl font-bold mb-2">{isIndividualReport ? 'Relatório Individual do Paciente' : data.title}</h1>
                <p className="text-sm text-gray-600">
                    Saúde Fácil - Gestão de Atendimento | Emitido em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm:ss")}
                </p>
            </header>
            
            <main>
                <div className="space-y-4">
                     {data.items.map(item => 
                        isIndividualReport 
                            ? <IndividualReportItem key={item.id} atendimento={item} />
                            : <GeneralReportItem key={item.id} atendimento={item} />
                     )}
                </div>
            </main>
        </div>
    );
}
