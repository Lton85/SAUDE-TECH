"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, User, Building, Loader2, Info } from "lucide-react";
import type { FilaDeEsperaItem } from "@/types/fila";
import { getHistoricoAtendimentos } from "@/services/filaDeEsperaService";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from "../ui/scroll-area";
import type { Paciente } from "@/types/paciente";

interface ProntuarioDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  item: FilaDeEsperaItem | null;
}

const AtendimentoCard = ({ atendimento }: { atendimento: FilaDeEsperaItem }) => {
    const dataFinalizacao = atendimento.finalizadaEm?.toDate();
    const dataFormatada = dataFinalizacao ? format(dataFinalizacao, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Data não disponível';
    const horaFormatada = dataFinalizacao ? format(dataFinalizacao, "HH:mm'h'", { locale: ptBR }) : '';

    return (
        <div className="flex flex-col gap-3 rounded-lg border p-4 bg-muted/30 shadow-sm transition-all hover:shadow-md">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{dataFormatada} às {horaFormatada}</span>
                </div>
                 <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800">Finalizado</span>
            </div>
            <div className="space-y-2 pl-6">
                <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-primary" />
                    <div>
                        <p className="text-xs text-muted-foreground">Departamento</p>
                        <p className="font-semibold">{atendimento.departamentoNome}{atendimento.departamentoNumero ? ` - Sala ${atendimento.departamentoNumero}` : ''}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <div>
                        <p className="text-xs text-muted-foreground">Profissional</p>
                        <p className="font-semibold">{atendimento.profissionalNome}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}


export function ProntuarioDialog({ isOpen, onOpenChange, item }: ProntuarioDialogProps) {
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

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Prontuário do Paciente
          </DialogTitle>
           <DialogDescription>
            Histórico de atendimentos finalizados de <span className="font-semibold text-primary">{item.pacienteNome}</span>.
          </DialogDescription>
        </DialogHeader>
        
         <div className="py-4">
            <ScrollArea className="h-[400px] pr-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="mt-4 text-muted-foreground">Carregando histórico...</p>
                    </div>
                ) : historico.length > 0 ? (
                    <div className="space-y-4">
                        {historico.map((atendimento) => (
                           <AtendimentoCard key={atendimento.id} atendimento={atendimento} />
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
