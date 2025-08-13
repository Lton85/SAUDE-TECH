
"use client";

import { useState, useMemo } from "react";
import { PacientesList } from "@/components/cadastros/pacientes-list";
import { ProfissionaisList } from "@/components/cadastros/profissionais-list";
import { DepartamentosList } from "@/components/cadastros/departamentos-list";
import { User, Stethoscope, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ActiveList = 'pacientes' | 'profissionais' | 'departamentos';

export default function CadastrosPage() {
    const [activeList, setActiveList] = useState<ActiveList>('pacientes');

    const renderList = () => {
        switch (activeList) {
            case 'pacientes':
                return <PacientesList />;
            case 'profissionais':
                return <ProfissionaisList />;
            case 'departamentos':
                return <DepartamentosList />;
            default:
                return <PacientesList />;
        }
    };

    const menuItems = [
        { id: 'pacientes', label: 'Pacientes', icon: User },
        { id: 'profissionais', label: 'Profissionais', icon: Stethoscope },
        { id: 'departamentos', label: 'Departamentos', icon: Building },
    ];

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="grid grid-cols-3 gap-4">
                {menuItems.map(item => {
                    const Icon = item.icon;
                    return (
                        <Button
                            key={item.id}
                            size="sm"
                            onClick={() => setActiveList(item.id as ActiveList)}
                            className={cn(
                                activeList === item.id
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-card text-card-foreground border hover:bg-muted"
                            )}
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
