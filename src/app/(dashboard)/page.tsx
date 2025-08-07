
"use client";

import * as React from "react";
import { Card, CardDescription, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardList, Clock, Tv2, Settings, UserPlus, Stethoscope, CalendarCheck, CalendarDays, UserMinus } from "lucide-react";
import { getPacientesRealtime } from "@/services/pacientesService";
import { getProfissionais } from "@/services/profissionaisService";
import type { Paciente } from "@/types/paciente";
import type { Profissional } from "@/types/profissional";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, Timestamp } from "firebase/firestore";
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';
import { cn } from "@/lib/utils";

const StatCard = ({ title, value, subValue, icon: Icon, subIcon: SubIcon, subLabel, isLoading, color }: {
    title: string;
    value: number;
    subValue?: number;
    icon: React.ElementType;
    subIcon?: React.ElementType;
    subLabel?: string;
    isLoading: boolean;
    color?: string;
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
                    <div className="text-2xl font-bold">{value}</div>
                    {subValue !== undefined && subLabel && SubIcon && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <SubIcon className="h-3 w-3" />
                            {subValue} {subLabel}
                        </p>
                    )}
                </>
            )}
        </CardContent>
    </Card>
);

export default function DashboardPage() {
    const [totalPacientes, setTotalPacientes] = React.useState(0);
    const [pacientesInativos, setPacientesInativos] = React.useState(0);
    const [totalProfissionais, setTotalProfissionais] = React.useState(0);
    const [profissionaisInativos, setProfissionaisInativos] = React.useState(0);
    const [atendimentosHoje, setAtendimentosHoje] = React.useState(0);
    const [atendimentosMes, setAtendimentosMes] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(true);

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


    const features = [
        { href: "/atendimento", title: "Atendimento", description: "Monitore o tempo de cada consulta.", icon: Clock },
        { href: "/cadastros", title: "Cadastros", description: "Gerencie pacientes, médicos e enfermeiros.", icon: Users },
        { href: "/triagem", title: "Departamentos", description: "Gerencie os departamentos e suas prioridades.", icon: ClipboardList },
        { href: "/configuracoes", title: "Configurações", description: "Ajuste as configurações gerais do sistema.", icon: Settings },
        { href: "/painel", title: "Painel de Senhas", description: "Exiba as senhas de atendimento na TV.", icon: Tv2, target: "_blank" },
    ];

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {features.map((feature) => (
          <Link key={feature.title} href={feature.href} target={feature.target || "_self"} className="flex">
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
          </Link>
        ))}
      </div>
      
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           <StatCard 
                title="Pacientes Cadastrados"
                value={totalPacientes}
                subValue={pacientesInativos}
                icon={UserPlus}
                subIcon={UserMinus}
                subLabel="inativos"
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
                value={totalProfissionais}
                subValue={profissionaisInativos}
                icon={Stethoscope}
                subIcon={UserMinus}
                subLabel="inativos"
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
