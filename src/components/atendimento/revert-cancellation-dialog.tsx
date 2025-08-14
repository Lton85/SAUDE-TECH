
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Undo2, Loader2 } from "lucide-react";
import type { FilaDeEsperaItem } from "@/types/fila";

interface RevertCancellationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (targetStatus: FilaDeEsperaItem['status']) => void;
  item: FilaDeEsperaItem | null;
}

export function RevertCancellationDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  item
}: RevertCancellationDialogProps) {
  const [targetStatus, setTargetStatus] = useState<FilaDeEsperaItem['status']>("pendente");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = () => {
    setIsSubmitting(true);
    onConfirm(targetStatus);
  };

  // Reset state when dialog is closed or item changes
  React.useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
      // Reset to default when dialog is closed
      setTargetStatus("pendente");
    } else if (item) {
        // Set initial state based on whether patient is identified
        setTargetStatus(item.pacienteId ? "aguardando" : "pendente");
    }
  }, [isOpen, item]);

  if (!item) return null;
  const itemName = item.pacienteNome || `Senha ${item.senha}`;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Undo2 className="h-5 w-5 text-primary" />
            Reverter Cancelamento
          </DialogTitle>
          <DialogDescription>
            Para qual fila você deseja retornar o atendimento de <span className="font-bold text-primary">{itemName}</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <RadioGroup 
            value={targetStatus} 
            onValueChange={(value: FilaDeEsperaItem['status']) => setTargetStatus(value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pendente" id="r-pendente" />
              <Label htmlFor="r-pendente" className="cursor-pointer">
                Senhas Pendentes <span className="text-xs text-muted-foreground">(Aguardando triagem)</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="chamado-triagem" id="r-triagem" />
              <Label htmlFor="r-triagem" className="cursor-pointer">
                Em Triagem <span className="text-xs text-muted-foreground">(Aguardando identificação do paciente)</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="aguardando" id="r-fila" disabled={!item.pacienteId} />
              <Label htmlFor="r-fila" className={`cursor-pointer ${!item.pacienteId ? 'opacity-50' : ''}`}>
                Fila de Atendimento <span className="text-xs text-muted-foreground">(Aguardando ser chamado)</span>
              </Label>
            </div>
          </RadioGroup>
          {!item.pacienteId &&
            <p className="text-xs text-amber-600 pl-2">
                A opção 'Fila de Atendimento' está desabilitada porque esta senha não possui um paciente identificado.
            </p>
          }
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Voltar
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar e Reverter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
