
"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface LimpezaHistoricoDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onConfirm: (password: string) => void
  onConfirmWithPassword?: (password: string) => void;
  title?: string
  description?: string
  confirmText?: string
  requiresPassword?: boolean;
  isSubmitting?: boolean;
}

export function LimpezaHistoricoDialog({
  isOpen, 
  onOpenChange, 
  onConfirm, 
  onConfirmWithPassword,
  title = "Ação Irreversível!", 
  description = "Esta ação é <b class='text-destructive'>IRREVERSÍVEL</b> e irá apagar todos os dados.", 
  confirmText = "Sim, confirmar",
  requiresPassword = true,
  isSubmitting = false,
}: LimpezaHistoricoDialogProps) {
  const [password, setPassword] = useState("");

  const handleConfirm = () => {
    if (onConfirmWithPassword) {
      onConfirmWithPassword(password);
    } else {
      onConfirm(password);
    }
  };
  
  const finalDescription = requiresPassword 
    ? description + " Para continuar, você precisará fornecer a senha de segurança."
    : description;


  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-foreground">
            <div dangerouslySetInnerHTML={{ __html: finalDescription }} />
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {requiresPassword && (
            <div className="space-y-2 py-2">
                <Label htmlFor="security-password">Senha de Segurança</Label>
                <Input 
                    id="security-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite a senha"
                />
            </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
          <Button onClick={handleConfirm} className="bg-destructive hover:bg-destructive/90" disabled={isSubmitting || (requiresPassword && !password)}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
