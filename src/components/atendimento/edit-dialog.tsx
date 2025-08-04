import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import type { FilaDeEsperaItem } from "@/types/fila";

interface EditQueueItemDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  item: FilaDeEsperaItem | null;
}

export function EditQueueItemDialog({ isOpen, onOpenChange, item }: EditQueueItemDialogProps) {
  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Editar Item da Fila
          </DialogTitle>
          <DialogDescription>
            Altere as informações para o atendimento de <span className="font-semibold text-primary">{item.pacienteNome}</span>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
            {/* Form to edit queue item will go here */}
            <p className="text-center text-muted-foreground">O formulário de edição será implementado aqui.</p>
        </div>

        <DialogFooter className="sm:justify-end">
           <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button">
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
