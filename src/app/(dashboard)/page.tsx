
"use client";

import * as React from "react";
import { Card, CardDescription, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardList, Clock, Tv2, UserPlus, Stethoscope, CalendarCheck, CalendarDays, BarChart3, CheckCircle, UserX } from "lucide-react";
import { getPacientesRealtime } from "@/services/pacientesService";
import { getProfissionais } from "@/services/profissionaisService";
import type { Paciente } from "@/types/paciente";
import type { Profissional } from "@/types/profissional";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, Timestamp } from "firebase/firestore";
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Tab } from "./client-layout";
import { allMenuItems } from "./client-layout";
import { getCurrentUser } from "@/services/authService";


const StatCard = ({ title, value, subValue, icon: Icon, subIcon: SubIcon, subLabel, isLoading, color, valueLabel }: {
    title: string;
    value: number;
    subValue?: number;
    icon: React.ElementType;
    subIcon?: React.ElementType;
    subLabel?: string;
    isLoading: boolean;
    color?: string;
    valueLabel?: string;
}) => (
    <Card className="hover:border-primary/50 hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg text-white", color)}>
                <Icon className="h-5 w-5" />
            </div>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                 <>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-1/4 mt-2" />
                 </>
            ) : (
                <>
                    <div className="text-2xl font-bold flex items-center gap-2">
                        {value} 
                        {valueLabel && (
                            <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" />
                                {valueLabel}
                            </span>
                        )}
                    </div>
                    {subValue !== undefined && subValue > 0 && subLabel && SubIcon && (
                        <p className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1">
                            <SubIcon className="h-3 w-3" />
                            {subValue} {subLabel}
                        </p>
                    )}
                </>
            )}
        </CardContent>
    </Card>
);

interface DashboardPageProps {
  onCardClick: (item: Tab) => void;
}

export default function DashboardPage({ onCardClick }: DashboardPageProps) {
    const [totalPacientes, setTotalPacientes] = React.useState(0);
    const [pacientesInativos, setPacientesInativos] = React.useState(0);
    const [totalProfissionais, setTotalProfissionais] = React.useState(0);
    const [profissionaisInativos, setProfissionaisInativos] = React.useState(0);
    const [atendimentosHoje, setAtendimentosHoje] = React.useState(0);
    const [atendimentosMes, setAtendimentosMes] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(true);
    const [userMenuItems, setUserMenuItems] = React.useState<Tab[]>([]);

    React.useEffect(() => {
        const currentUser = getCurrentUser();
        if (currentUser) {
            if (currentUser.usuario === 'usuarioteste') {
                setUserMenuItems(allMenuItems);
            } else {
                const allowedMenuItems = allMenuItems.filter(item => 
                    !item.permissionRequired || (currentUser.permissoes && currentUser.permissoes.includes(item.id))
                );
                setUserMenuItems(allowedMenuItems);
            }
        }
    }, []);

     React.useEffect(() => {
        setIsLoading(true);
        // Pacientes Listener
        const unsubscribePacientes = getPacientesRealtime(
            (pacientes) => {
                setTotalPacientes(pacientes.length);
                setPacientesInativos(pacientes.filter(p => p.situacao === 'Inativo').length);
                setIsLoading(false);
            },
            (error) => console.error(error)
        );

        // Profissionais Listener
        const unsubscribeProfissionais = onSnapshot(collection(db, "profissionais"), (snapshot) => {
            const profissionais: Profissional[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Profissional));
            setTotalProfissionais(profissionais.length);
            setProfissionaisInativos(profissionais.filter(p => p.situacao === 'Inativo').length);
            setIsLoading(false);
        });

        // Atendimentos do Dia Listener
        const hojeStart = startOfDay(new Date());
        const hojeEnd = endOfDay(new Date());
        const qHoje = query(
            collection(db, "relatorios_atendimentos"),
            where("finalizadaEm", ">=", Timestamp.fromDate(hojeStart)),
            where("finalizadaEm", "<=", Timestamp.fromDate(hojeEnd))
        );
        const unsubscribeHoje = onSnapshot(qHoje, (snapshot) => {
            setAtendimentosHoje(snapshot.size);
            setIsLoading(false);
        });

        // Atendimentos do Mês Listener
        const mesStart = startOfMonth(new Date());
        const mesEnd = endOfMonth(new Date());
        const qMes = query(
            collection(db, "relatorios_atendimentos"),
            where("finalizadaEm", ">=", Timestamp.fromDate(mesStart)),
            where("finalizadaEm", "<=", Timestamp.fromDate(mesEnd))
        );
        const unsubscribeMes = onSnapshot(qMes, (snapshot) => {
            setAtendimentosMes(snapshot.size);
            setIsLoading(false);
        });

        return () => {
            unsubscribePacientes();
            unsubscribeProfissionais();
            unsubscribeHoje();
            unsubscribeMes();
        };
    }, []);

    const navFeatures = [
        { href: "/atendimento", title: "Atendimento", description: "Acompanhe a fila de espera e chamadas.", icon: Clock },
        { href: "/cadastros", title: "Cadastros", description: "Gerencie pacientes e profissionais.", icon: Users },
        { href: "/triagem", title: "Departamentos", description: "Gerencie os locais de atendimento.", icon: ClipboardList },
        { href: "/relatorios", title: "Relatórios", description: "Exporte e analise os dados de atendimento.", icon: BarChart3 },
        { href: "/painel", title: "Painel de Senhas", description: "Exiba as senhas de atendimento na TV.", icon: Tv2, target: "_blank" },
    ].filter(feature => {
        // Find the corresponding menu item from the user's allowed menu items
        return userMenuItems.some(item => {
             // Handle special case for /painel which doesn't have a leading slash in its id
            if (feature.href === '/painel') return item.id === 'painel';
            return item.href === feature.href;
        });
    });

    const handleCardClick = (feature: typeof navFeatures[number]) => {
      const menuItem = allMenuItems.find(m => m.href === feature.href || m.id === feature.href);
      if (menuItem) {
        if (feature.target === "_blank") {
           window.open(feature.href, "_blank");
        } else {
           onCardClick(menuItem);
        }
      }
    };

  return (
    <div className="space-y-8">
       <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {navFeatures.map((feature) => (
          <div key={feature.title} onClick={() => handleCardClick(feature)} className="flex cursor-pointer">
              <Card className="w-full hover:border-primary/80 hover:shadow-lg transition-all flex flex-col justify-center items-center text-center p-6">
                <CardHeader className="p-0 mb-4">
                  <feature.icon className="h-8 w-8 text-primary mx-auto" />
                </CardHeader>
                <CardContent className="p-0 flex-grow">
                  <CardTitle className="text-xl font-bold mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
          </div>
        ))}
      </div>
      
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           <StatCard 
                title="Pacientes Cadastrados"
                value={totalPacientes - pacientesInativos}
                valueLabel="Ativos"
                subValue={pacientesInativos}
                icon={UserPlus}
                subIcon={UserX}
                subLabel="Inativos"
                isLoading={isLoading}
                color="bg-sky-500"
           />
            <StatCard 
                title="Atendimentos no Dia"
                value={atendimentosHoje}
                icon={CalendarCheck}
                isLoading={isLoading}
                color="bg-amber-500"
           />
           <StatCard 
                title="Profissionais"
                value={totalProfissionais - profissionaisInativos}
                valueLabel="Ativos"
                subValue={profissionaisInativos}
                icon={Stethoscope}
                subIcon={UserX}
                subLabel="Inativos"
                isLoading={isLoading}
                color="bg-violet-500"
           />
            <StatCard 
                title="Atendimentos no Mês"
                value={atendimentosMes}
                icon={CalendarDays}
                isLoading={isLoading}
                color="bg-green-500"
           />
       </div>
    </div>
  );
}
