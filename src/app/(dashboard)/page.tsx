
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Building, Clock, KeyRound, Settings, Tv2, Users, ClipboardList, Home, UserCheck, Stethoscope, Users2, Hourglass } from "lucide-react";
import { allMenuItems, Tab } from "./client-layout";
import { getCurrentUser } from "@/services/authService";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardPageProps {
  onCardClick: (item: Tab) => void;
}

interface SummaryCardProps {
    title: string;
    value: number | null;
    icon: React.ElementType;
    description: string;
    isLoading: boolean;
}

const SummaryCard = ({ title, value, icon: Icon, description, isLoading }: SummaryCardProps) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <Skeleton className="h-8 w-16" />
            ) : (
                <div className="text-2xl font-bold">{value}</div>
            )}
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

export default function DashboardPage({ onCardClick }: DashboardPageProps) {
    const currentUser = getCurrentUser();
    const [filaCount, setFilaCount] = useState<number | null>(null);
    const [emAtendimentoCount, setEmAtendimentoCount] = useState<number | null>(null);
    const [pacientesCount, setPacientesCount] = useState<number | null>(null);
    const [profissionaisCount, setProfissionaisCount] = useState<number | null>(null);

    useEffect(() => {
        const qFila = query(collection(db, "filaDeEspera"), where("status", "==", "aguardando"));
        const unsubscribeFila = onSnapshot(qFila, (snapshot) => setFilaCount(snapshot.size));

        const qAtendimento = query(collection(db, "filaDeEspera"), where("status", "==", "em-atendimento"));
        const unsubscribeAtendimento = onSnapshot(qAtendimento, (snapshot) => setEmAtendimentoCount(snapshot.size));

        const qPacientes = query(collection(db, "pacientes"));
        const unsubscribePacientes = onSnapshot(qPacientes, (snapshot) => setPacientesCount(snapshot.size));

        const qProfissionais = query(collection(db, "profissionais"), where("situacao", "==", "Ativo"));
        const unsubscribeProfissionais = onSnapshot(qProfissionais, (snapshot) => setProfissionaisCount(snapshot.size));

        return () => {
            unsubscribeFila();
            unsubscribeAtendimento();
            unsubscribePacientes();
            unsubscribeProfissionais();
        };
    }, []);

    const navFeatures = useMemo(() => {
        const allFeatures = [
            { id: "/atendimento", title: "Fila de Atendimento", description: "Gerencie a fila de espera dos pacientes.", icon: Clock },
            { id: "/cadastros", title: "Cadastros", description: "Acesse os cadastros de pacientes e profissionais.", icon: Users },
            { id: "/triagem", title: "Departamentos", description: "Cadastre e gerencie os locais de atendimento.", icon: ClipboardList },
            { id: "/relatorios", title: "Relatórios", description: "Exporte e analise os dados de atendimento.", icon: BarChart3 },
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

    const handleCardClick = (featureId: string) => {
      const menuItem = allMenuItems.find(m => m.id === featureId);
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

         <div>
            <h2 className="text-xl font-semibold tracking-tight mb-4">Acessos Rápidos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {navFeatures.map((feature) => (
                    <Card 
                        key={feature.id} 
                        className="hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group"
                        onClick={() => handleCardClick(feature.id)}
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SummaryCard 
                title="Pacientes na Fila"
                value={filaCount}
                icon={Hourglass}
                description="Aguardando para serem chamados"
                isLoading={filaCount === null}
            />
             <SummaryCard 
                title="Em Atendimento"
                value={emAtendimentoCount}
                icon={UserCheck}
                description="Pacientes sendo atendidos agora"
                isLoading={emAtendimentoCount === null}
            />
            <SummaryCard 
                title="Pacientes Cadastrados"
                value={pacientesCount}
                icon={Users2}
                description="Total de pacientes no sistema"
                isLoading={pacientesCount === null}
            />
            <SummaryCard 
                title="Profissionais Ativos"
                value={profissionaisCount}
                icon={Stethoscope}
                description="Profissionais disponíveis"
                isLoading={profissionaisCount === null}
            />
        </div>

    </div>
  );
}
