
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, User, Building, Loader2, Info, CheckCircle, LogIn, Megaphone, Check, Pencil } from "lucide-react";
import type { FilaDeEsperaItem } from "@/types/fila";
import { getHistoricoAtendimentos } from "@/services/filaDeEsperaService";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


interface ProntuarioDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  item: FilaDeEsperaItem | null;
  onEdit: (item: FilaDeEsperaItem) => void;
}

const EventoTimeline = ({ icon: Icon, label, time }: { icon: React.ElementType, label: string, time: string }) => (
    <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-primary/80" />
        <div className="flex justify-between w-full">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-mono text-xs font-medium">{time}</span>
        </div>
    </div>
);

const AtendimentoTimelineItem = ({ atendimento, onEdit }: { atendimento: FilaDeEsperaItem; onEdit: (item: FilaDeEsperaItem) => void; }) => {
    const dataFinalizacao = atendimento.finalizadaEm?.toDate();
    const dataFormatada = dataFinalizacao ? format(dataFinalizacao, "dd 'de' MMM 'de' yyyy", { locale: ptBR }) : '';
    
    const horaChegada = atendimento.chegadaEm ? format(atendimento.chegadaEm.toDate(), "HH:mm:ss", { locale: ptBR }) : 'N/A';
    const horaChamada = atendimento.chamadaEm ? format(atendimento.chamadaEm.toDate(), "HH:mm:ss", { locale: ptBR }) : 'N/A';
    const horaFinalizacao = dataFinalizacao ? format(dataFinalizacao, "HH:mm:ss", { locale: ptBR }) : 'N/A';

    return (
       <Accordion type="single" collapsible className="w-full">
            <AccordionItem value={atendimento.id} className="border-b-0">
                 <div className="flex gap-4">
                    <div className="flex flex-col items-center pt-1">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary ring-4 ring-background">
                            <Calendar className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="flex-1 pb-4">
                         <div className="flex justify-between items-start">
                             <AccordionTrigger className="p-0 hover:no-underline flex-1">
                                 <div className="flex-1 text-left">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-foreground">
                                            {dataFormatada}
                                        </p>
                                    </div>
                                    <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                                         <div className="flex items-center gap-2">
                                            <Building className="h-3 w-3" />
                                            <span>{atendimento.departamentoNome}{atendimento.departamentoNumero ? ` - Sala ${atendimento.departamentoNumero}` : ''}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User className="h-3 w-3" />
                                            <span>{atendimento.profissionalNome}</span>
                                        </div>
                                    </div>
                                 </div>
                            </AccordionTrigger>
                            <div className="flex items-center gap-2 pl-2">
                                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Finalizado
                                </Badge>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onEdit(atendimento)}>
                                    <Pencil className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                        <AccordionContent>
                           <div className="mt-4 space-y-3 rounded-md border bg-muted/30 p-3">
                                <EventoTimeline icon={LogIn} label="Entrada na Fila" time={horaChegada} />
                                <EventoTimeline icon={Megaphone} label="Chamada no Painel" time={horaChamada} />
                                <EventoTimeline icon={Check} label="Finalização" time={horaFinalizacao} />
                            </div>
                        </AccordionContent>
                    </div>
                </div>
            </AccordionItem>
       </Accordion>
    )
}


export function ProntuarioDialog({ isOpen, onOpenChange, item, onEdit }: ProntuarioDialogProps) {
  const [historico, setHistorico] = useState<FilaDeEsperaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistorico = async () => {
      if (item && isOpen) {
        setIsLoading(true);
        try {
          const data = await getHistoricoAtendimentos(item.pacienteId);
          setHistorico(data);
        } catch (error) {
          console.error("Erro ao buscar histórico do paciente:", error);
          setHistorico([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchHistorico();
  }, [item, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === ' ') {
        event.preventDefault(); 
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onOpenChange]);

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Prontuário do Paciente
          </DialogTitle>
           <DialogDescription>
            Histórico de atendimentos finalizados de <span className="font-semibold text-primary">{item.pacienteNome}</span>.
          </DialogDescription>
        </DialogHeader>
        
         <div className="py-4 relative">
            {historico.length > 1 && <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border -z-10"></div>}
            <ScrollArea className="h-[450px] pr-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="mt-4 text-muted-foreground">Carregando histórico...</p>
                    </div>
                ) : historico.length > 0 ? (
                    <div className="space-y-0">
                        {historico.map((atendimento) => (
                           <AtendimentoTimelineItem key={atendimento.id} atendimento={atendimento} onEdit={onEdit} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full rounded-md border border-dashed p-8">
                        <Info className="h-10 w-10 text-muted-foreground/50" />
                        <p className="mt-4 text-center text-muted-foreground">
                            Nenhum atendimento finalizado encontrado para este paciente.
                        </p>
                    </div>
                )}
            </ScrollArea>
        </div>

        <DialogFooter className="sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
