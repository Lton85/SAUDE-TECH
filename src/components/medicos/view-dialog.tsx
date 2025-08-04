import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Stethoscope, FileText, BadgeInfo, IdCard, Calendar, Venus, Mars, Phone, Clock, Activity, Fingerprint } from "lucide-react";
import type { Medico } from "@/types/medico";
import { Badge } from "@/components/ui/badge";

interface ViewMedicoDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  medico: Medico | null;
}

const InfoRow = ({ icon: Icon, label, value, children }: { icon: React.ElementType, label: string, value?: string, children?: React.ReactNode }) => {
    return (
        <div className="flex items-start gap-3">
            <Icon className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
            <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">{label}</span>
                {value && <span className="font-semibold text-card-foreground break-words">{value}</span>}
                {children}
            </div>
        </div>
    )
};

export function ViewMedicoDialog({ isOpen, onOpenChange, medico }: ViewMedicoDialogProps) {
  if (!medico) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
             <FileText className="h-5 w-5 text-primary"/>
            Cadastro do Médico
          </DialogTitle>
           <DialogDescription>
             Visualização dos dados completos de <span className="font-semibold text-primary">{medico.nome}</span>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="p-4 border rounded-lg bg-muted/20">
                <h3 className="font-semibold mb-4 text-primary">Informações Profissionais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    <InfoRow icon={BadgeInfo} label="Código" value={medico.codigo} />
                    <InfoRow icon={User} label="Nome Completo" value={medico.nome} />
                    <InfoRow icon={IdCard} label="CRM" value={medico.crm} />
                    <InfoRow icon={IdCard} label="CNS" value={medico.cns} />
                    <InfoRow icon={Stethoscope} label="Especialidade" value={medico.especialidade} />
                </div>
            </div>

            <div className="p-4 border rounded-lg bg-muted/20">
                <h3 className="font-semibold mb-4 text-primary">Informações Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    <InfoRow icon={Fingerprint} label="CPF" value={medico.cpf} />
                    <InfoRow icon={medico.sexo === 'Masculino' ? Mars : Venus} label="Sexo">
                        <span className="font-semibold text-card-foreground">{medico.sexo}</span>
                    </InfoRow>
                    <InfoRow icon={Calendar} label="Data de Nascimento" value={medico.dataNascimento} />
                    <InfoRow icon={Phone} label="Telefone" value={medico.telefone} />
                </div>
            </div>

            <div className="p-4 border rounded-lg bg-muted/20">
                <h3 className="font-semibold mb-4 text-primary">Informações de Trabalho</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <InfoRow icon={Clock} label="Carga Horária Semanal" value={medico.cargaHoraria} />
                    <InfoRow icon={Activity} label="Situação">
                        <Badge variant={medico.situacao === 'Ativo' ? 'default' : 'destructive'} className={`${medico.situacao === 'Ativo' ? 'bg-green-500' : ''} mt-1`}>
                            {medico.situacao}
                        </Badge>
                    </InfoRow>
                 </div>
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
