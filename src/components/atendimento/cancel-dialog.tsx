
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { XCircle, Loader2 } from "lucide-react"
import type { FilaDeEsperaItem } from "@/types/fila"

interface CancelAtendimentoDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onConfirm: (motivo?: string) => void
  item: FilaDeEsperaItem | null
}

export function CancelAtendimentoDialog({ isOpen, onOpenChange, onConfirm, item }: CancelAtendimentoDialogProps) {
  const [motivo, setMotivo] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleConfirm = () => {
    setIsSubmitting(true);
    onConfirm(motivo);
    // The parent component will handle closing and state reset
  }

  // Reset state when dialog is closed
  React.useEffect(() => {
    if (!isOpen) {
      setMotivo("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Cancelar Atendimento
          </DialogTitle>
          <DialogDescription>
            Confirma o cancelamento do atendimento de <span className="font-bold text-destructive">{item.pacienteNome || `Senha ${item.senha}`}</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
            <Label htmlFor="motivo-cancelamento">
                Motivo do Cancelamento (Opcional)
            </Label>
            <Textarea 
                id="motivo-cancelamento"
                placeholder="Ex: Paciente não respondeu à chamada, desistência, etc."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="mt-2"
            />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Voltar
          </Button>
          <Button onClick={handleConfirm} variant="destructive" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Cancelamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
