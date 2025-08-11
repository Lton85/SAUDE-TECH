
"use client"

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Lock, Loader2 } from "lucide-react";
import type { Usuario } from "@/types/usuario";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { updateUsuario } from "@/services/usuariosService";
import { Label } from "../ui/label";
import { allMenuItems } from "@/app/(dashboard)/client-layout";
import { Separator } from "../ui/separator";
import { NotificationType } from "../ui/notification-dialog";

interface PermissionsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
  usuario?: Usuario | null;
  onNotification: (notification: { type: NotificationType; title: string; message: string; }) => void;
}

const permissionableMenus = allMenuItems.filter(item => item.permissionRequired);


export function PermissionsDialog({ isOpen, onOpenChange, onSuccess, usuario, onNotification }: PermissionsDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);

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
    if (selectedPermissions.length === permissionableMenus.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(permissionableMenus.map(menu => menu.id));
    }
  };

  const handleSubmit = async () => {
    if (!usuario) return;
    setIsSubmitting(true);
    try {
        await updateUsuario(usuario.id, { permissoes: selectedPermissions });
        onNotification({
            type: "success",
            title: "Permissões Atualizadas!",
            message: `As permissões de ${usuario.nome} foram salvas.`,
        });
        onSuccess();
        onOpenChange(false);
    } catch (error) {
      onNotification({
        type: "error",
        title: "Erro ao salvar permissões",
        message: (error as Error).message,
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
        
        <div className="py-4 space-y-2">
            <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer" onClick={handleSelectAll}>
                <Checkbox
                    id="select-all"
                    checked={selectedPermissions.length === permissionableMenus.length}
                    onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="font-semibold cursor-pointer text-base">
                    Selecionar Todos
                </Label>
            </div>
             <Separator />
            <div className="space-y-2 pt-2">
            {permissionableMenus.map(menu => (
                <div key={menu.id} className="flex items-center space-x-3 pl-2 pr-2 py-1 rounded-md hover:bg-muted/50 cursor-pointer" onClick={() => handlePermissionChange(menu.id, !selectedPermissions.includes(menu.id))}>
                    <Checkbox 
                        id={menu.id}
                        checked={selectedPermissions.includes(menu.id)}
                        onCheckedChange={(checked) => handlePermissionChange(menu.id, !!checked)}
                    />
                    <Label htmlFor={menu.id} className="cursor-pointer font-normal">{menu.label}</Label>
                </div>
            ))}
            </div>
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
