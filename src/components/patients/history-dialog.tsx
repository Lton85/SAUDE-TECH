import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, User, Pencil, X } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Paciente } from "@/types/paciente";

interface HistoryDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  paciente: Paciente | null;
}

const InfoRow = ({ icon: Icon, label, date }: { icon: React.ElementType, label: string, date: string }) => {
  const formattedDate = format(new Date(date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss", { locale: ptBR });
  return (
    <div className="flex items-center justify-between text-sm bg-secondary p-3 rounded-md">
       <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2 font-medium">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span>{formattedDate}</span>
      </div>
    </div>
  )
};

export function HistoryDialog({ isOpen, onOpenChange, paciente }: HistoryDialogProps) {
  if (!paciente) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Histórico do Paciente</DialogTitle>
           <p className="text-sm text-muted-foreground pt-1">
            Registro de criação e última alteração do cadastro de <span className="font-semibold text-primary">{paciente.nome}</span>.
          </p>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
            <div className="space-y-2">
                <h3 className="font-semibold">Criação do Cadastro</h3>
                <InfoRow 
                    icon={User}
                    label={paciente.historico.criadoPor}
                    date={paciente.historico.criadoEm}
                />
            </div>
            <div className="space-y-2">
                <h3 className="font-semibold">Última Alteração</h3>
                 <InfoRow 
                    icon={Pencil}
                    label={paciente.historico.alteradoPor}
                    date={paciente.historico.alteradoEm}
                />
            </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
