
"use client"

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Lock, Loader2 } from "lucide-react";
import type { Usuario } from "@/types/usuario";
import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { updateUsuario } from "@/services/usuariosService";
import { Label } from "../ui/label";

interface PermissionsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
  usuario?: Usuario | null;
}

const allMenus = [
    { id: "/atendimento", label: "Fila de Atendimento" },
    { id: "/cadastros", label: "Cadastros" },
    { id: "/triagem", label: "Departamentos" },
    { id: "/relatorios", label: "Relatórios" },
    { id: "/empresa", label: "Empresa" },
    { id: "/usuarios", label: "Usuários" },
    { id: "/configuracoes", label: "Configurações" },
];

export function PermissionsDialog({ isOpen, onOpenChange, onSuccess, usuario }: PermissionsDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    if (usuario && isOpen) {
        setSelectedPermissions(usuario.permissoes || []);
    }
  }, [usuario, isOpen]);

  const handlePermissionChange = (menuId: string, checked: boolean) => {
    setSelectedPermissions(prev => 
        checked ? [...prev, menuId] : prev.filter(id => id !== menuId)
    );
  };
  
  const handleSelectAll = () => {
    if (selectedPermissions.length === allMenus.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(allMenus.map(menu => menu.id));
    }
  };

  const handleSubmit = async () => {
    if (!usuario) return;
    setIsSubmitting(true);
    try {
        await updateUsuario(usuario.id, { permissoes: selectedPermissions });
        toast({
            title: "Permissões Atualizadas!",
            description: `As permissões de ${usuario.nome} foram salvas.`,
            className: "bg-green-500 text-white"
        });
        onSuccess();
        onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar permissões",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!usuario) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock />
            Permissões de Acesso
          </DialogTitle>
          <DialogDescription>
            Selecione os menus que <span className="font-semibold text-primary">{usuario.nome}</span> poderá acessar.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
            <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer" onClick={handleSelectAll}>
                <Checkbox
                    id="select-all"
                    checked={selectedPermissions.length === allMenus.length}
                    onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="font-semibold cursor-pointer">
                    Selecionar Todos
                </Label>
            </div>
            {allMenus.map(menu => (
                <div key={menu.id} className="flex items-center space-x-2 pl-4 pr-2 py-1 rounded-md hover:bg-muted/50 cursor-pointer" onClick={() => handlePermissionChange(menu.id, !selectedPermissions.includes(menu.id))}>
                    <Checkbox 
                        id={menu.id}
                        checked={selectedPermissions.includes(menu.id)}
                        onCheckedChange={(checked) => handlePermissionChange(menu.id, !!checked)}
                    />
                    <Label htmlFor={menu.id} className="cursor-pointer">{menu.label}</Label>
                </div>
            ))}
        </div>

        <DialogFooter>
             <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Permissões
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
