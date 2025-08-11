
"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export type NotificationType = 'success' | 'error' | 'warning';

interface NotificationDialogProps {
  type: NotificationType;
  title: string;
  message: string;
  onOpenChange: (isOpen: boolean) => void;
}

const icons: { [key in NotificationType]: React.ElementType } = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
};

const colors: { [key in NotificationType]: string } = {
    success: 'text-green-500',
    error: 'text-destructive',
    warning: 'text-orange-500',
};

export function NotificationDialog({ type, title, message, onOpenChange }: NotificationDialogProps) {
  const Icon = icons[type];
  const colorClass = colors[type];

  return (
    <AlertDialog open={true} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex flex-col items-center text-center">
            <Icon className={`h-16 w-16 mb-4 ${colorClass}`} />
            <AlertDialogTitle className={`text-2xl font-bold ${colorClass}`}>
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg text-muted-foreground mt-2">
              {message}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
