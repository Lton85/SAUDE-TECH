import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Cake, VenetianMask, BadgeInfo, FileText, Hand, Heart, IdCard, Calendar, Venus, Mars } from "lucide-react";
import type { Paciente } from "@/types/paciente";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ViewDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  paciente: Paciente | null;
}

const InfoRow = ({ icon: Icon, label, value, children }: { icon: React.ElementType, label: string, value?: string, children?: React.ReactNode }) => {
    return (
        <div className="flex items-start gap-3">
            <Icon className="h-4 w-4 mt-1 text-muted-foreground" />
            <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">{label}</span>
                {value && <span className="font-semibold text-card-foreground">{value}</span>}
                {children}
            </div>
        </div>
    )
};


export function ViewDialog({ isOpen, onOpenChange, paciente }: ViewDialogProps) {
  if (!paciente) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
             <FileText className="h-5 w-5 text-primary"/>
            Cadastro do Paciente
          </DialogTitle>
           <DialogDescription>
             Visualização dos dados completos de <span className="font-semibold text-primary">{paciente.nome}</span>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 p-4 border rounded-lg bg-muted/20">
                <InfoRow icon={IdCard} label="Código" value={paciente.id} />
                <InfoRow icon={User} label="Nome Completo" value={paciente.nome} />
                <InfoRow icon={Hand} label="Nome da Mãe" value={paciente.mae} />
                 <InfoRow icon={paciente.sexo === 'Masculino' ? Mars : Venus} label="Sexo">
                     <div className="flex items-center gap-2">
                        <span className="font-semibold text-card-foreground">{paciente.sexo}</span>
                     </div>
                </InfoRow>
                <InfoRow icon={Cake} label="Nascimento" value={paciente.nascimento} />
                <InfoRow icon={Calendar} label="Idade" value={paciente.idade} />
                <InfoRow icon={Heart} label="CNS" value={paciente.cns} />
                <InfoRow icon={BadgeInfo} label="CPF" value={paciente.cpf} />
            </div>
            <div className="p-4 border rounded-lg bg-muted/20">
                 <InfoRow icon={FileText} label="Situação do Cadastro">
                    <Badge variant={paciente.situacao === 'Ativo' ? 'default' : 'destructive'} className={`${paciente.situacao === 'Ativo' ? 'bg-green-500' : ''} mt-1`}>
                        {paciente.situacao}
                    </Badge>
                 </InfoRow>
            </div>
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
