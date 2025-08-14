

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
  selectedPermissions: string[];
  onPermissionChange: (id: string, checked: boolean) => void;
}) => {
  const hasSubItems = item.subItems && item.subItems.length > 0;
  
  const isSelected = selectedPermissions.includes(item.id);

  // For parent checkbox visual state, it's checked if all sub-items are checked.
  const areAllSubItemsSelected = hasSubItems
    ? item.subItems!.every(sub => selectedPermissions.includes(sub.id))
    : isSelected;
    
  // A parent item has an "indeterminate" state if some, but not all, of its children are selected.
  const isIndeterminate = hasSubItems && selectedPermissions.some(p => item.subItems!.map(s => s.id).includes(p)) && !areAllSubItemsSelected;


  const handleParentChange = (checked: boolean) => {
    // When a parent checkbox is clicked, it toggles its own permission and all its children's permissions.
    onPermissionChange(item.id, checked);
    if (hasSubItems) {
      item.subItems!.forEach(sub => onPermissionChange(sub.id, checked));
    }
  };

  const handleSubItemChange = (subId: string, checked: boolean) => {
    onPermissionChange(subId, checked);
  
    // After a sub-item changes, determine if the parent should be checked or unchecked.
    const allSubItemIds = item.subItems!.map(s => s.id);
    // Create a new set with the potential new state
    const newSelectedSubItems = new Set(selectedPermissions.filter(p => allSubItemIds.includes(p)));
  
    if (checked) {
      newSelectedSubItems.add(subId);
    } else {
      newSelectedSubItems.delete(subId);
    }
  
    // Check/uncheck the parent based on whether ALL sub-items are selected
    if (newSelectedSubItems.size === item.subItems!.length) {
      // All children are selected, so select the parent
      if (!selectedPermissions.includes(item.id)) {
        onPermissionChange(item.id, true);
      }
    } else {
      // Not all children are selected, so unselect the parent
      if (selectedPermissions.includes(item.id)) {
        onPermissionChange(item.id, false);
      }
    }
  };
  
  if (hasSubItems) {
    return (
        <AccordionItem value={item.id} className="border-b-0">
            <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                <Checkbox
                    id={`perm-${item.id}`}
                    checked={areAllSubItemsSelected}
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
                            checked={selectedPermissions.includes(sub.id)}
                            onCheckedChange={(checked) => handleSubItemChange(sub.id, !!checked)}
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
        checked={isSelected}
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
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (usuario && isOpen) {
        setSelectedPermissions(usuario.permissoes || []);
    }
  }, [usuario, isOpen]);

  const handlePermissionChange = (menuId: string, checked: boolean) => {
    setSelectedPermissions(prev => {
      const newPermissions = new Set(prev);
      if (checked) {
        newPermissions.add(menuId);
      } else {
        newPermissions.delete(menuId);
      }
      return Array.from(newPermissions);
    });
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
        const allIds = permissionableMenus.flatMap(menu => 
            menu.subItems ? [menu.id, ...menu.subItems.map(s => s.id)] : [menu.id]
        );
      setSelectedPermissions(Array.from(new Set(allIds)));
    } else {
      setSelectedPermissions([]);
    }
  };
  
  const allPermissionIds = React.useMemo(() => {
    return permissionableMenus.flatMap(menu => 
        menu.subItems ? [menu.id, ...menu.subItems.map(s => s.id)] : [menu.id]
    );
  }, []);

  const isAllSelected = React.useMemo(() => {
    return allPermissionIds.every(id => selectedPermissions.includes(id));
  }, [selectedPermissions, allPermissionIds]);

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

