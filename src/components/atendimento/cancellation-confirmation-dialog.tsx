
"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

interface CancellationConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  itemName: string;
}

export function CancellationConfirmationDialog({ isOpen, onOpenChange, itemName }: CancellationConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex flex-col items-center text-center">
            <XCircle className="h-16 w-16 text-destructive mb-4" />
            <AlertDialogTitle className="text-2xl font-bold text-destructive">
              Atendimento Cancelado!
            </AlertDialogTitle>
            <p className="text-lg text-muted-foreground mt-2">
              O atendimento de <span className="font-semibold">{itemName}</span> foi cancelado com sucesso.
            </p>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

    