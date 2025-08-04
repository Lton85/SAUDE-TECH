import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Cake, VenetianMask, BadgeInfo, FileText, Hand, Heart, IdCard, Calendar, Venus, Mars, Home, Globe, Mail, Phone, Pencil } from "lucide-react";
import type { Paciente } from "@/types/paciente";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ViewDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  paciente: Paciente | null;
}

const InfoRow = ({ icon: Icon, label, value, children, className }: { icon: React.ElementType, label: string, value?: string, children?: React.ReactNode, className?: string }) => {
    return (
        <div className={cn("flex items-start gap-3", className)}>
            <Icon className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
            <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">{label}</span>
                {value && <span className="font-semibold text-card-foreground break-words">{value}</span>}
                {children}
            </div>
        </div>
    )
};


export function ViewDialog({ isOpen, onOpenChange, paciente }: ViewDialogProps) {
  if (!paciente) return null;

  const fullAddress = `${paciente.endereco}, ${paciente.numero} - ${paciente.bairro}, ${paciente.cidade} - ${paciente.uf}, CEP: ${paciente.cep}`;


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
             <FileText className="h-5 w-5 text-primary"/>
            Cadastro do Paciente
          </DialogTitle>
           <DialogDescription>
             Visualização dos dados completos de <span className="font-semibold text-primary">{paciente.nome}</span>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="p-4 border rounded-lg bg-muted/20">
                <h3 className="font-semibold mb-4 text-primary">Informações Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    <InfoRow icon={BadgeInfo} label="Código" value={paciente.codigo} />
                    <InfoRow icon={User} label="Nome Completo" value={paciente.nome} />
                    <InfoRow icon={Hand} label="Nome da Mãe" value={paciente.mae} />
                    {paciente.pai && <InfoRow icon={Hand} label="Nome do Pai" value={paciente.pai} />}
                    <InfoRow icon={paciente.sexo === 'Masculino' ? Mars : Venus} label="Sexo">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-card-foreground">{paciente.sexo}</span>
                        </div>
                    </InfoRow>
                    <InfoRow icon={Cake} label="Nascimento" value={paciente.nascimento} />
                    <InfoRow icon={Calendar} label="Idade" value={paciente.idade} />
                    <InfoRow icon={Heart} label="Estado Civil" value={paciente.estadoCivil} />
                </div>
            </div>

             <div className="p-4 border rounded-lg bg-muted/20">
                <h3 className="font-semibold mb-4 text-primary">Documentos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                     <InfoRow icon={IdCard} label="CNS" value={paciente.cns} />
                     <InfoRow icon={BadgeInfo} label="CPF" value={paciente.cpf} />
                </div>
            </div>

            <div className="p-4 border rounded-lg bg-muted/20">
                <h3 className="font-semibold mb-4 text-primary">Contato e Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {paciente.email && <InfoRow icon={Mail} label="E-mail" value={paciente.email} />}
                    {paciente.telefone && <InfoRow icon={Phone} label="Telefone" value={paciente.telefone} />}
                    {paciente.endereco && <InfoRow icon={Home} label="Endereço Completo" value={fullAddress} className="md:col-span-2" />}
                </div>
            </div>

             {paciente.observacoes && (
                <div className="p-4 border rounded-lg bg-muted/20">
                    <h3 className="font-semibold mb-2 text-primary">Observações</h3>
                    <InfoRow icon={Pencil} label="" value={paciente.observacoes} />
                </div>
             )}


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
