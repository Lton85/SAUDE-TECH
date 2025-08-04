import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import type { FilaDeEsperaItem } from "@/types/fila";

interface ProntuarioDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  item: FilaDeEsperaItem | null;
}

export function ProntuarioDialog({ isOpen, onOpenChange, item }: ProntuarioDialogProps) {
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
            Visualizando prontuário de <span className="font-semibold text-primary">{item.pacienteNome}</span>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
            <p className="text-center text-muted-foreground">O prontuário do paciente será implementado aqui.</p>
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
