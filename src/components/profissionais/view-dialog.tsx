
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Stethoscope, FileText, BadgeInfo, IdCard, Calendar, Venus, Mars, Phone, Clock, Activity, Fingerprint } from "lucide-react";
import type { Profissional } from "@/types/profissional";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

interface ViewProfissionalDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  profissional: Profissional | null;
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

export function ViewProfissionalDialog({ isOpen, onOpenChange, profissional }: ViewProfissionalDialogProps) {
  if (!profissional) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
             <FileText className="h-5 w-5 text-primary"/>
            Cadastro do Profissional
          </DialogTitle>
           <DialogDescription>
             Visualização dos dados completos de <span className="font-semibold text-primary">{profissional.nome}</span>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-base text-primary">Informações Profissionais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    <InfoRow icon={BadgeInfo} label="Código" value={profissional.codigo} />
                    <InfoRow icon={User} label="Nome Completo" value={profissional.nome} />
                    <InfoRow icon={IdCard} label="Conselho" value={profissional.crm} />
                    <InfoRow icon={IdCard} label="CNS" value={profissional.cns} />
                    <InfoRow icon={Stethoscope} label="Especialidade" value={profissional.especialidade} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-base text-primary">Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    <InfoRow icon={Fingerprint} label="CPF" value={profissional.cpf} />
                    <InfoRow icon={profissional.sexo === 'Masculino' ? Mars : Venus} label="Sexo">
                        <span className="font-semibold text-card-foreground">{profissional.sexo}</span>
                    </InfoRow>
                    <InfoRow icon={Calendar} label="Data de Nascimento" value={profissional.dataNascimento} />
                    <InfoRow icon={Phone} label="Telefone" value={profissional.telefone} />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card">
              <CardHeader>
                  <CardTitle className="text-base text-primary">Informações de Trabalho</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <InfoRow icon={Clock} label="Carga Horária Semanal" value={profissional.cargaHoraria} />
                    <InfoRow icon={Activity} label="Situação">
                        <Badge variant={profissional.situacao === 'Ativo' ? 'default' : 'destructive'} className={`${profissional.situacao === 'Ativo' ? 'bg-green-500' : ''} mt-1`}>
                            {profissional.situacao}
                        </Badge>
                    </InfoRow>
                 </div>
              </CardContent>
            </Card>
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
