
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Building, Clock, KeyRound, Settings, Tv2, Users, ClipboardList, Home, UserCheck, Stethoscope, Users2, Hourglass, CalendarDays } from "lucide-react";
import { allMenuItems, Tab } from "./client-layout";
import { getCurrentUser } from "@/services/authService";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, getDocs } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { endOfDay, startOfDay } from "date-fns";

interface DashboardPageProps {
  onCardClick: (item: Tab) => void;
}

interface SummaryCardProps {
    title: string;
    value: number | null;
    icon: React.ElementType;
    description?: string;
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
                <>
                    <Skeleton className="h-8 w-16" />
                    {description && <Skeleton className="h-4 w-24 mt-1" />}
                </>
            ) : (
                <>
                    <div className="text-2xl font-bold">{value}</div>
                    {description && <p className="text-xs text-muted-foreground">{description}</p>}
                </>
            )}
        </CardContent>
    </Card>
);

export default function DashboardPage({ onCardClick }: DashboardPageProps) {
    const currentUser = getCurrentUser();
    
    const [pacientesCount, setPacientesCount] = useState<number | null>(null);
    const [pacientesInativosCount, setPacientesInativosCount] = useState<number | null>(null);

    const [profissionaisCount, setProfissionaisCount] = useState<number | null>(null);
    const [profissionaisInativosCount, setProfissionaisInativosCount] = useState<number | null>(null);

    const [atendimentosDiaCount, setAtendimentosDiaCount] = useState<number | null>(null);
    const [atendimentosMesCount, setAtendimentosMesCount] = useState<number | null>(null);

    useEffect(() => {
        // Pacientes
        const qPacientes = query(collection(db, "pacientes"));
        const unsubscribePacientes = onSnapshot(qPacientes, (snapshot) => {
            let inativos = 0;
            snapshot.docs.forEach(doc => {
                if (doc.data().situacao === 'Inativo') {
                    inativos++;
                }
            });
            setPacientesCount(snapshot.size);
            setPacientesInativosCount(inativos);
        });

        // Profissionais
        const qProfissionais = query(collection(db, "profissionais"));
        const unsubscribeProfissionais = onSnapshot(qProfissionais, (snapshot) => {
             let inativos = 0;
            snapshot.docs.forEach(doc => {
                if (doc.data().situacao === 'Inativo') {
                    inativos++;
                }
            });
            setProfissionaisCount(snapshot.size);
            setProfissionaisInativosCount(inativos);
        });
        
        // Atendimentos no Dia
        const fetchAtendimentosDia = async () => {
             const startOfToday = startOfDay(new Date());
             const endOfToday = endOfDay(new Date());
             const qDia = query(
                 collection(db, "relatorios_atendimentos"), 
                 where("finalizadaEm", ">=", startOfToday), 
                 where("finalizadaEm", "<=", endOfToday)
             );
             const snapshotDia = await getDocs(qDia);
             setAtendimentosDiaCount(snapshotDia.size);
        }
        
         // Atendimentos no Mês
        const fetchAtendimentosMes = async () => {
             const today = new Date();
             const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
             const endOfThisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
             const qMes = query(
                 collection(db, "relatorios_atendimentos"), 
                 where("finalizadaEm", ">=", startOfThisMonth), 
                 where("finalizadaEm", "<=", endOfThisMonth)
             );
             const snapshotMes = await getDocs(qMes);
             setAtendimentosMesCount(snapshotMes.size);
        }

        fetchAtendimentosDia();
        fetchAtendimentosMes();


        return () => {
            unsubscribePacientes();
            unsubscribeProfissionais();
        };
    }, []);

    const navFeatures = useMemo(() => {
        const allFeatures = [
            { id: "/atendimento", title: "Atendimento", description: "Monitore o tempo de cada consulta.", icon: Clock },
            { id: "/cadastros", title: "Cadastros", description: "Gerencie pacientes, médicos e enfermeiros.", icon: Users },
            { id: "/triagem", title: "Departamentos", description: "Gerencie os departamentos e suas prioridades.", icon: ClipboardList },
            { id: "/configuracoes", title: "Configurações", description: "Ajuste as configurações gerais do sistema.", icon: Settings },
            { id: "painel", title: "Painel de Senhas", description: "Exiba as senhas de atendimento na TV.", icon: Tv2 },
        ];

        if (!currentUser) return [];

        if (currentUser.usuario === 'usuarioteste') {
            return allFeatures;
        }

        const userPermissions = currentUser.permissoes || [];
        // Adiciona "painel" e "/" às permissões do usuário para garantir que sempre apareçam
        const permissions = [...new Set([...userPermissions, 'painel', '/'])];

        return allFeatures.filter(feature =>
            !allMenuItems.find(item => item.id === feature.id)?.permissionRequired ||
            permissions.includes(feature.id)
        );
    }, [currentUser]);

    const handleCardClick = (featureId: string) => {
      const menuItem = allMenuItems.find(m => m.id === featureId);
      if (menuItem) {
          onCardClick(menuItem);
      }
    };
    
  return (
    <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {navFeatures.map((feature) => (
                <Card 
                    key={feature.id} 
                    className="hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group text-center"
                    onClick={() => handleCardClick(feature.id)}
                >
                    <CardHeader className="items-center pb-2">
                        <div className="p-3 rounded-full bg-primary/10 mb-2">
                            <feature.icon className="h-6 w-6 text-primary transition-colors" />
                        </div>
                        <CardTitle className="text-base font-semibold">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                           {feature.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SummaryCard 
                title="Pacientes Cadastrados"
                value={pacientesCount}
                icon={Users2}
                description={pacientesInativosCount !== null ? `${pacientesInativosCount} inativos` : undefined}
                isLoading={pacientesCount === null}
            />
             <SummaryCard 
                title="Atendimentos no Dia"
                value={atendimentosDiaCount}
                icon={CalendarDays}
                isLoading={atendimentosDiaCount === null}
            />
            <SummaryCard 
                title="Profissionais"
                value={profissionaisCount}
                icon={Stethoscope}
                description={profissionaisInativosCount !== null ? `${profissionaisInativosCount} inativos` : undefined}
                isLoading={profissionaisCount === null}
            />
            <SummaryCard 
                title="Atendimentos no Mês"
                value={atendimentosMesCount}
                icon={CalendarDays}
                isLoading={atendimentosMesCount === null}
            />
        </div>

    </div>
  );
}
