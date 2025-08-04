"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, User, Building, Loader2, Info, CheckCircle } from "lucide-react";
import type { Paciente } from "@/types/paciente";
import type { FilaDeEsperaItem } from "@/types/fila";
import { getHistoricoAtendimentos } from "@/services/filaDeEsperaService";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";

interface ProntuarioDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  paciente: Paciente | null;
}

const AtendimentoTimelineItem = ({ atendimento, isLast }: { atendimento: FilaDeEsperaItem, isLast: boolean }) => {
    const dataFinalizacao = atendimento.finalizadaEm?.toDate();
    const dataFormatada = dataFinalizacao ? format(dataFinalizacao, "dd/MM/yy", { locale: ptBR }) : '';
    const horaFormatada = dataFinalizacao ? format(dataFinalizacao, "HH:mm", { locale: ptBR }) : '';

    return (
       <div className="relative flex items-start gap-4">
            <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Calendar className="h-4 w-4" />
                </div>
                {!isLast && <div className="w-px flex-1 bg-border/70 my-2"></div>}
            </div>
            <div className="flex-1 pt-1.5">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">
                        {dataFormatada} <span className="text-xs font-normal text-muted-foreground">às {horaFormatada}h</span>
                    </p>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Finalizado
                    </Badge>
                </div>
                 <div className="mt-2 space-y-2 text-sm rounded-md border bg-muted/20 p-3">
                    <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-primary" />
                        <div>
                            <p className="text-xs text-muted-foreground">Departamento</p>
                            <p className="font-medium">{atendimento.departamentoNome}{atendimento.departamentoNumero ? ` - Sala ${atendimento.departamentoNumero}` : ''}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <div>
                            <p className="text-xs text-muted-foreground">Profissional</p>
                            <p className="font-medium">{atendimento.profissionalNome}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function ProntuarioDialog({ isOpen, onOpenChange, paciente }: ProntuarioDialogProps) {
  const [historico, setHistorico] = useState<FilaDeEsperaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistorico = async () => {
      if (paciente && isOpen) {
        setIsLoading(true);
        try {
          const data = await getHistoricoAtendimentos(paciente.id);
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
  }, [paciente, isOpen]);


  if (!paciente) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Prontuário do Paciente
          </DialogTitle>
           <DialogDescription>
            Histórico de atendimentos finalizados de <span className="font-semibold text-primary">{paciente.nome}</span>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
            <ScrollArea className="h-[450px] pr-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="mt-4 text-muted-foreground">Carregando histórico...</p>
                    </div>
                ) : historico.length > 0 ? (
                    <div className="space-y-1">
                        {historico.map((atendimento, index) => (
                           <AtendimentoTimelineItem key={atendimento.id} atendimento={atendimento} isLast={index === historico.length - 1} />
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
