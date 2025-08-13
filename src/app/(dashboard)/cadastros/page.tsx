
"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PacientesList } from "@/components/cadastros/pacientes-list";
import { ProfissionaisList } from "@/components/cadastros/profissionais-list";
import { DepartamentosList } from "@/components/cadastros/departamentos-list";
import { User, Stethoscope, Building, Lock } from "lucide-react";
import { getCurrentUser } from "@/services/authService";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface TabInfo {
    id: string;
    label: string;
    icon: React.ElementType;
    component: React.ElementType;
}

const allTabs: TabInfo[] = [
    { id: 'pacientes', label: 'Pacientes', icon: User, component: PacientesList },
    { id: 'profissionais', label: 'Profissionais', icon: Stethoscope, component: ProfissionaisList },
    { id: 'departamentos', label: 'Departamentos', icon: Building, component: DepartamentosList },
];

export default function CadastrosPage() {
    const [permissions, setPermissions] = React.useState<string[]>([]);
    const [activeTab, setActiveTab] = React.useState<string | null>(null);

    React.useEffect(() => {
        const user = getCurrentUser();
        if (!user) return;

        const userPermissions = user.permissoes || [];
        if (user.usuario === 'master') {
             const allPermissions = allTabs.map(t => `/cadastros/${t.id}`);
            setPermissions(allPermissions);
            setActiveTab(allTabs[0]?.id);
        } else {
            setPermissions(userPermissions);
            const firstAllowedTab = allTabs.find(tab => userPermissions.includes(`/cadastros/${tab.id}`));
            setActiveTab(firstAllowedTab ? firstAllowedTab.id : null);
        }
    }, []);

    if (activeTab === null) {
        return (
            <div className="flex flex-col items-center justify-center h-full rounded-md border border-dashed py-10 mt-10">
                <Lock className="h-10 w-10 text-muted-foreground/50" />
                <p className="mt-4 text-center text-muted-foreground">
                    Você não tem permissão para acessar esta seção.
                </p>
            </div>
        );
    }

    return (
        <Tabs defaultValue={activeTab} className="w-full flex flex-col flex-1">
             <TabsList className={`grid w-full grid-cols-3`}>
                {allTabs.map(tab => {
                    const Icon = tab.icon;
                    const hasPermission = permissions.includes(`/cadastros/${t.id}`);
                    return (
                        <TooltipProvider key={tab.id}>
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <TabsTrigger value={tab.id} disabled={!hasPermission}>
                                        {!hasPermission && <Lock className="mr-2 h-3 w-3" />}
                                        <Icon className="mr-2 h-4 w-4" />
                                        {tab.label}
                                    </TabsTrigger>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p>{tab.label}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                })}
            </TabsList>
            <div className="flex-1 overflow-y-auto mt-4">
                {allTabs.map(tab => {
                    const Component = tab.component;
                    const hasPermission = permissions.includes(`/cadastros/${t.id}`);
                    return (
                        <TabsContent key={tab.id} value={tab.id} className="mt-0">
                            {hasPermission ? (
                                <Component />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full rounded-md border border-dashed py-10 mt-10">
                                    <Lock className="h-10 w-10 text-muted-foreground/50" />
                                    <p className="mt-4 text-center text-muted-foreground">
                                        Você não tem permissão para acessar esta aba.
                                    </p>
                                </div>
                            )}
                        </TabsContent>
                    );
                })}
            </div>
        </Tabs>
    );
}
