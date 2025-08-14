
"use client";

import { useState, useMemo, useEffect } from "react";
import { PacientesList } from "@/components/cadastros/pacientes-list";
import { ProfissionaisList } from "@/components/cadastros/profissionais-list";
import { DepartamentosList } from "@/components/cadastros/departamentos-list";
import { User, Stethoscope, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/services/authService";

type ActiveList = 'pacientes' | 'profissionais' | 'departamentos';

const menuItems = [
    { id: 'pacientes', label: 'Pacientes', icon: User, permission: '/cadastros/pacientes' },
    { id: 'profissionais', label: 'Profissionais', icon: Stethoscope, permission: '/cadastros/profissionais' },
    { id: 'departamentos', label: 'Departamentos', icon: Building, permission: '/cadastros/departamentos' },
];

export default function CadastrosPage() {
    const [activeList, setActiveList] = useState<ActiveList | null>(null);
    const [permissions, setPermissions] = useState<Set<string>>(new Set());

    useEffect(() => {
        const user = getCurrentUser();
        if (!user) return;

        const userPermissions = new Set(user.permissoes || []);
        
        if (user.usuario === 'master') {
            const allPossiblePermissions = new Set(menuItems.map(item => item.permission));
            setPermissions(allPossiblePermissions);
            setActiveList(menuItems[0].id as ActiveList);
            return;
        }

        setPermissions(userPermissions);
        
        const firstAllowedItem = menuItems.find(item => userPermissions.has(item.permission));
        if (firstAllowedItem) {
            setActiveList(firstAllowedItem.id as ActiveList);
        }

    }, []);


    const renderList = () => {
        switch (activeList) {
            case 'pacientes':
                return <PacientesList />;
            case 'profissionais':
                return <ProfissionaisList />;
            case 'departamentos':
                return <DepartamentosList />;
            default:
                return (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        Selecione uma categoria.
                    </div>
                );
        }
    };


    return (
        <div className="flex flex-col h-full gap-4">
            <div className="grid grid-cols-3 gap-4">
                {menuItems.map(item => {
                    const Icon = item.icon;
                    const hasPermission = permissions.has(item.permission);
                    return (
                        <Button
                            key={item.id}
                            onClick={() => setActiveList(item.id as ActiveList)}
                            className={cn(
                                "text-sm font-medium",
                                activeList === item.id
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-card text-card-foreground border hover:bg-muted",
                                !hasPermission && 'opacity-60 cursor-not-allowed'
                            )}
                            disabled={!hasPermission}
                        >
                            <Icon className="mr-2 h-4 w-4" />
                            {item.label}
                        </Button>
                    );
                })}
            </div>
            <div className="flex-1 overflow-y-auto">
                {renderList()}
            </div>
        </div>
    );
}
