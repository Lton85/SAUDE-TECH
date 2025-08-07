
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, FileText, BadgeInfo, Activity, Fingerprint } from "lucide-react";
import type { Usuario } from "@/types/usuario";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface ViewUsuarioDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  usuario: Usuario | null;
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


export function ViewUsuarioDialog({ isOpen, onOpenChange, usuario }: ViewUsuarioDialogProps) {
  if (!usuario) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
             <FileText className="h-5 w-5 text-primary"/>
            Detalhes do Usuário
          </DialogTitle>
           <DialogDescription>
             Visualização dos dados de <span className="font-semibold text-primary">{usuario.nome}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 pr-4">
             <Card className="bg-card">
                <CardHeader>
                    <CardTitle className="text-base text-primary">Informações do Usuário</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <InfoRow icon={BadgeInfo} label="Código" value={usuario.codigo} />
                    <InfoRow icon={User} label="Nome" value={usuario.nome} />
                    <InfoRow icon={Fingerprint} label="CPF" value={usuario.cpf} />
                    <InfoRow icon={User} label="Usuário" value={usuario.usuario} />
                    <InfoRow icon={Activity} label="Situação">
                        <Badge variant={usuario.situacao === 'Ativo' ? 'default' : 'destructive'} className={`${usuario.situacao === 'Ativo' ? 'bg-green-500' : ''} mt-1`}>
                            {usuario.situacao}
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
