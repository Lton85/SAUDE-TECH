import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, FileText, BadgeInfo, IdCard, Calendar, Venus, Mars, Phone, Clock, Activity, Fingerprint, Stethoscope } from "lucide-react";
import type { Enfermeiro } from "@/types/enfermeiro";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

interface ViewEnfermeiroDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  enfermeiro: Enfermeiro | null;
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

export function ViewEnfermeiroDialog({ isOpen, onOpenChange, enfermeiro }: ViewEnfermeiroDialogProps) {
  if (!enfermeiro) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
             <FileText className="h-5 w-5 text-primary"/>
            Cadastro do(a) Enfermeiro(a)
          </DialogTitle>
           <DialogDescription>
             Visualização dos dados completos de <span className="font-semibold text-primary">{enfermeiro.nome}</span>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <Card>
                <CardHeader>
                  <CardTitle className="text-base text-primary">Informações Profissionais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                      <InfoRow icon={BadgeInfo} label="Código" value={enfermeiro.codigo} />
                      <InfoRow icon={User} label="Nome Completo" value={enfermeiro.nome} />
                      <InfoRow icon={IdCard} label="COREN" value={enfermeiro.coren} />
                      <InfoRow icon={IdCard} label="CNS" value={enfermeiro.cns} />
                      <InfoRow icon={Stethoscope} label="Especialidade" value={enfermeiro.especialidade} />
                  </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base text-primary">Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                        <InfoRow icon={Fingerprint} label="CPF" value={enfermeiro.cpf} />
                        <InfoRow icon={enfermeiro.sexo === 'Masculino' ? Mars : Venus} label="Sexo">
                            <span className="font-semibold text-card-foreground">{enfermeiro.sexo}</span>
                        </InfoRow>
                        <InfoRow icon={Calendar} label="Data de Nascimento" value={enfermeiro.dataNascimento} />
                        <InfoRow icon={Phone} label="Telefone" value={enfermeiro.telefone} />
                    </div>
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base text-primary">Informações de Trabalho</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <InfoRow icon={Clock} label="Turno" value={enfermeiro.turno} />
                    <InfoRow icon={Activity} label="Situação">
                        <Badge variant={enfermeiro.situacao === 'Ativo' ? 'default' : 'destructive'} className={`${enfermeiro.situacao === 'Ativo' ? 'bg-green-500' : ''} mt-1`}>
                            {enfermeiro.situacao}
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
