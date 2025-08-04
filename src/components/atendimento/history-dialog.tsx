import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import type { FilaDeEsperaItem } from "@/types/fila";

interface HistoryQueueItemDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  item: FilaDeEsperaItem | null;
}

export function HistoryQueueItemDialog({ isOpen, onOpenChange, item }: HistoryQueueItemDialogProps) {
  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Atendimento
          </DialogTitle>
           <DialogDescription>
            Acompanhe o histórico do paciente <span className="font-semibold text-primary">{item.pacienteNome}</span> na fila.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
            {/* History timeline will go here */}
            <p className="text-center text-muted-foreground">O histórico do atendimento será implementado aqui.</p>
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
