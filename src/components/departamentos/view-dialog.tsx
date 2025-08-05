import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building, Hash, Activity, FileText, BadgeInfo } from "lucide-react";
import type { Departamento } from "@/types/departamento";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface ViewDepartamentoDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  departamento: Departamento | null;
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


export function ViewDepartamentoDialog({ isOpen, onOpenChange, departamento }: ViewDepartamentoDialogProps) {
  if (!departamento) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
             <FileText className="h-5 w-5 text-primary"/>
            Detalhes do Departamento
          </DialogTitle>
           <DialogDescription>
             Visualização dos dados de <span className="font-semibold text-primary">{departamento.nome}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 pr-4">
             <Card className="bg-card">
                <CardHeader>
                    <CardTitle className="text-base text-primary">Informações do Departamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <InfoRow icon={BadgeInfo} label="Código" value={departamento.codigo} />
                    <InfoRow icon={Building} label="Nome" value={departamento.nome} />
                    <InfoRow icon={Hash} label="Nº da Sala" value={departamento.numero || "Não informado"} />
                    <InfoRow icon={Activity} label="Situação">
                        <Badge variant={departamento.situacao === 'Ativo' ? 'default' : 'destructive'} className={`${departamento.situacao === 'Ativo' ? 'bg-green-500' : ''} mt-1`}>
                            {departamento.situacao}
                        </Badge>
                    </InfoRow>
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
