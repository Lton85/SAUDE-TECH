
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Building, Clock, KeyRound, Settings, Tv2, Users, ClipboardList, Home } from "lucide-react";
import { allMenuItems, Tab } from "./client-layout";
import { getCurrentUser } from "@/services/authService";
import { useMemo } from "react";

interface DashboardPageProps {
  onCardClick: (item: Tab) => void;
}

export default function DashboardPage({ onCardClick }: DashboardPageProps) {
    const currentUser = getCurrentUser();

    const navFeatures = useMemo(() => {
        const allFeatures = [
            { id: "/atendimento", title: "Fila de Atendimento", description: "Gerencie a fila de espera dos pacientes.", icon: Clock },
            { id: "/cadastros", title: "Cadastros", description: "Acesse os cadastros de pacientes e profissionais.", icon: Users },
            { id: "/triagem", title: "Departamentos", description: "Cadastre e gerencie os locais de atendimento.", icon: ClipboardList },
            { id: "/relatorios", title: "Relatórios", description: "Exporte e analise os dados de atendimento.", icon: BarChart3 },
            { id: "/empresa", title: "Empresa", description: "Gerencie as informações da sua unidade.", icon: Building },
            { id: "/usuarios", title: "Usuários", description: "Controle os acessos de usuários ao sistema.", icon: KeyRound },
            { id: "/configuracoes", title: "Configurações", description: "Ajuste os parâmetros gerais do sistema.", icon: Settings },
            { id: "painel", title: "Painel de Senhas", description: "Exiba as senhas de atendimento na TV.", icon: Tv2 },
        ];

        if (!currentUser) return [];

        if (currentUser.usuario === 'usuarioteste') {
            return allFeatures;
        }

        return allFeatures.filter(feature =>
            !allMenuItems.find(item => item.id === feature.id)?.permissionRequired ||
            (currentUser.permissoes && currentUser.permissoes.includes(feature.id))
        );
    }, [currentUser]);


    const handleCardClick = (feature: typeof navFeatures[number]) => {
      const menuItem = allMenuItems.find(m => m.id === feature.id);
      if (menuItem) {
          onCardClick(menuItem);
      }
    };
    
  return (
    <div className="flex flex-col gap-8">
        <header>
            <h1 className="text-3xl font-bold tracking-tight">Bem-vindo ao Saúde Fácil!</h1>
            <p className="text-muted-foreground mt-1">Seu sistema completo para gestão de atendimento em saúde.</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {navFeatures.map((feature) => (
                <Card 
                    key={feature.id} 
                    className="hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group"
                    onClick={() => handleCardClick(feature)}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{feature.title}</CardTitle>
                        <feature.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                           {feature.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  );
}
