
"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Clock, Tv2, Users, ClipboardList, Stethoscope, Users2, CalendarDays, Activity } from "lucide-react";
import { allMenuItems, Tab } from "./client-layout";
import { getCurrentUser } from "@/services/authService";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, getDocs } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { endOfDay, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";

interface DashboardPageProps {
  onCardClick: (item: Tab) => void;
}

interface SummaryCardProps {
    title: string;
    value: number | null;
    icon: React.ElementType;
    color: string;
    isLoading: boolean;
    inactiveCount?: number | null;
}

const SummaryCard = ({ title, value, icon: Icon, color, isLoading, inactiveCount }: SummaryCardProps) => (
    <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4 flex items-center gap-4">
             <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white", color)}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
                {isLoading ? (
                    <>
                        <Skeleton className="h-7 w-16 mb-1" />
                        <Skeleton className="h-4 w-24" />
                    </>
                ) : (
                    <>
                        <p className="text-2xl font-bold">{value}</p>
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        {inactiveCount !== null && inactiveCount !== undefined && (
                            <p className={cn("text-xs", inactiveCount > 0 ? "text-red-500 font-semibold" : "text-muted-foreground")}>
                                {inactiveCount} inativos
                            </p>
                        )}
                    </>
                )}
            </div>
        </CardContent>
    </Card>
);

export default function DashboardPage({ onCardClick }: DashboardPageProps) {
    const [pacientesCount, setPacientesCount] = useState<number | null>(null);
    const [pacientesInativosCount, setPacientesInativosCount] = useState<number | null>(null);

    const [profissionaisCount, setProfissionaisCount] = useState<number | null>(null);
    const [profissionaisInativosCount, setProfissionaisInativosCount] = useState<number | null>(null);

    const [atendimentosDiaCount, setAtendimentosDiaCount] = useState<number | null>(null);
    const [atendimentosMesCount, setAtendimentosMesCount] = useState<number | null>(null);

    const [userMenuItems, setUserMenuItems] = React.useState<Tab[]>([]);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (currentUser) {
            if (currentUser.usuario === 'master') {
                setUserMenuItems(allMenuItems);
            } else {
                const userPermissions = currentUser.permissoes || [];
                const allowedMenuItems = allMenuItems.filter(item => 
                    !item.permissionRequired || userPermissions.includes(item.id)
                );
                setUserMenuItems(allowedMenuItems);
            }
        }
    }, []);

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
        const featureDescriptions: { [key: string]: string } = {
            "/atendimento": "Monitore o tempo de cada consulta.",
            "/cadastros": "Gerencie pacientes, médicos e enfermeiros.",
            "/triagem": "Gerencie os departamentos e suas prioridades.",
            "/relatorios": "Consulte o histórico de atendimentos.",
            "painel": "Exiba as senhas de atendimento na TV.",
        };

        return userMenuItems
            .filter(item => item.id !== '/' && item.id !== '/configuracoes' && item.id !== '/empresa' && item.id !== '/usuarios' && item.id !== 'sair')
            .map(item => ({
                id: item.id,
                title: item.label,
                description: featureDescriptions[item.id] || "Acesse a funcionalidade.",
                icon: item.icon,
            }));
    }, [userMenuItems]);

    const handleCardClick = (featureId: string) => {
      const menuItem = allMenuItems.find(m => m.id === featureId);
      if (menuItem) {
          onCardClick(menuItem);
      }
    };
    
  return (
    <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Acessos Rápidos</h2>
          <p className="text-muted-foreground">Navegue pelas principais funcionalidades do sistema.</p>
        </div>
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
                color="bg-blue-500"
                inactiveCount={pacientesInativosCount}
                isLoading={pacientesCount === null}
            />
             <SummaryCard 
                title="Atendimentos no Dia"
                value={atendimentosDiaCount}
                icon={CalendarDays}
                color="bg-orange-500"
                isLoading={atendimentosDiaCount === null}
            />
            <SummaryCard 
                title="Profissionais"
                value={profissionaisCount}
                icon={Stethoscope}
                color="bg-green-500"
                inactiveCount={profissionaisInativosCount}
                isLoading={profissionaisCount === null}
            />
            <SummaryCard 
                title="Atendimentos no Mês"
                value={atendimentosMesCount}
                icon={Activity}
                color="bg-purple-500"
                isLoading={atendimentosMesCount === null}
            />
        </div>

    </div>
  );
}
