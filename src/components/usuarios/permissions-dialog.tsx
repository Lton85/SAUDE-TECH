
"use client"

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Lock, Loader2, ChevronDown } from "lucide-react";
import type { Usuario } from "@/types/usuario";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { updateUsuario } from "@/services/usuariosService";
import { Label } from "../ui/label";
import { allMenuItems, Tab } from "@/app/(dashboard)/client-layout";
import { Separator } from "../ui/separator";
import { NotificationType } from "../ui/notification-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";

interface PermissionsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
  usuario?: Usuario | null;
  onNotification: (notification: { type: NotificationType; title: string; message: string; }) => void;
}

const permissionableMenus = allMenuItems.filter(item => item.permissionRequired);

const PermissionItem = ({
  item,
  selectedPermissions,
  onPermissionChange,
}: {
  item: Tab;
  selectedPermissions: Set<string>;
  onPermissionChange: (id: string, checked: boolean) => void;
}) => {
  const hasSubItems = item.subItems && item.subItems.length > 0;

  const getCheckedState = () => {
    if (!hasSubItems) {
      return selectedPermissions.has(item.id);
    }
    const subItemIds = item.subItems!.map(sub => sub.id);
    const selectedSubItemsCount = subItemIds.filter(id => selectedPermissions.has(id)).length;

    if (selectedSubItemsCount === 0) return false;
    if (selectedSubItemsCount === subItemIds.length) return true;
    return "indeterminate";
  };

  const handleParentChange = (checked: boolean) => {
    onPermissionChange(item.id, checked);
  };
  
  if (hasSubItems) {
    return (
        <AccordionItem value={item.id} className="border-b-0">
            <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                <Checkbox
                    id={`perm-${item.id}`}
                    checked={getCheckedState()}
                    onCheckedChange={handleParentChange}
                    aria-label={`Selecionar tudo de ${item.label}`}
                />
                <AccordionTrigger className="flex-1 p-0 hover:no-underline">
                     <Label htmlFor={`perm-${item.id}`} className="font-semibold cursor-pointer text-base w-full">
                        {item.label}
                    </Label>
                </AccordionTrigger>
            </div>
            <AccordionContent>
                <div className="pl-12 pr-2 pt-2 space-y-2">
                {item.subItems!.map(sub => (
                    <div key={sub.id} className="flex items-center space-x-3">
                         <Checkbox
                            id={`perm-${sub.id}`}
                            checked={selectedPermissions.has(sub.id)}
                            onCheckedChange={(checked) => onPermissionChange(sub.id, !!checked)}
                        />
                         <Label htmlFor={`perm-${sub.id}`} className="font-normal cursor-pointer text-sm">
                            {sub.label}
                        </Label>
                    </div>
                ))}
                </div>
            </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
      <Checkbox
        id={`perm-${item.id}`}
        checked={selectedPermissions.has(item.id)}
        onCheckedChange={(checked) => onPermissionChange(item.id, !!checked)}
      />
      <Label htmlFor={`perm-${item.id}`} className="font-semibold cursor-pointer text-base">
        {item.label}
      </Label>
    </div>
  );
};


export function PermissionsDialog({ isOpen, onOpenChange, onSuccess, usuario, onNotification }: PermissionsDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedPermissions, setSelectedPermissions] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (usuario && isOpen) {
        setSelectedPermissions(new Set(usuario.permissoes || []));
    }
  }, [usuario, isOpen]);

  const handlePermissionChange = (id: string, checked: boolean) => {
    setSelectedPermissions(prev => {
        const newPermissions = new Set(prev);
        const menuItem = allMenuItems.find(item => item.id === id);

        if (checked) {
            newPermissions.add(id);
            if (menuItem?.subItems) {
                menuItem.subItems.forEach(sub => newPermissions.add(sub.id));
            }
        } else {
            newPermissions.delete(id);
            if (menuItem?.subItems) {
                menuItem.subItems.forEach(sub => newPermissions.delete(sub.id));
            }
        }
        
        return newPermissions;
    });
};
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
        const allIds = permissionableMenus.flatMap(menu => 
            menu.subItems ? [menu.id, ...menu.subItems.map(s => s.id)] : [menu.id]
        );
      setSelectedPermissions(new Set(allIds));
    } else {
      setSelectedPermissions(new Set());
    }
  };
  
  const isAllSelected = React.useMemo(() => {
    const allPermissionIds = permissionableMenus.flatMap(menu => 
        menu.subItems ? [menu.id, ...menu.subItems.map(s => s.id)] : [menu.id]
    );
    return allPermissionIds.every(id => selectedPermissions.has(id));
  }, [selectedPermissions]);


  const handleSubmit = async () => {
    if (!usuario) return;
    setIsSubmitting(true);
    try {
        const permissionsToSave = Array.from(selectedPermissions);
        // Ensure parent item is included if all children are selected
        permissionableMenus.forEach(menu => {
            if (menu.subItems && menu.subItems.every(sub => permissionsToSave.includes(sub.id))) {
                if (!permissionsToSave.includes(menu.id)) {
                    permissionsToSave.push(menu.id);
                }
            }
        });

        await updateUsuario(usuario.id, { permissoes: permissionsToSave });
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
      <DialogContent className="sm:max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
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
            <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                <Checkbox
                    id="select-all"
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="font-semibold cursor-pointer text-base">
                    Selecionar Todos
                </Label>
            </div>
             <Separator />
            <ScrollArea className="h-96">
                 <Accordion type="multiple" className="w-full space-y-1 p-1">
                    {permissionableMenus.map(menu => (
                        <PermissionItem 
                            key={menu.id}
                            item={menu}
                            selectedPermissions={selectedPermissions}
                            onPermissionChange={handlePermissionChange}
                        />
                    ))}
                </Accordion>
            </ScrollArea>
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
