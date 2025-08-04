import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, User, Pencil, History } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Paciente } from "@/types/paciente";
import { Badge } from "@/components/ui/badge";

interface HistoryDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  paciente: Paciente | null;
}

const InfoCard = ({ icon: Icon, title, user, date }: { icon: React.ElementType, title: string, user: string, date: string }) => {
    const formattedDate = format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    const formattedTime = format(new Date(date), "HH:mm:ss", { locale: ptBR });

    return (
        <div className="flex flex-col gap-3 rounded-lg border p-4 bg-card shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
            </div>
            <div className="space-y-2 text-sm pl-2 border-l-2 border-primary/20 ml-5">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Realizado por:</span>
                    <Badge variant="secondary">{user}</Badge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Data:</span>
                    <span className="font-medium text-foreground">{formattedDate} às {formattedTime}</span>
                </div>
            </div>
        </div>
    )
};


export function HistoryDialog({ isOpen, onOpenChange, paciente }: HistoryDialogProps) {
  if (!paciente) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico do Paciente
          </DialogTitle>
           <DialogDescription>
            Acompanhe o registro de criação e a última alteração do cadastro de <span className="font-semibold text-primary">{paciente.nome}</span>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
            <InfoCard 
                icon={User}
                title="Criação do Cadastro"
                user={paciente.historico.criadoPor}
                date={paciente.historico.criadoEm}
            />
            <InfoCard 
                icon={Pencil}
                title="Última Alteração"
                user={paciente.historico.alteradoPor}
                date={paciente.historico.alteradoEm}
            />
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

    