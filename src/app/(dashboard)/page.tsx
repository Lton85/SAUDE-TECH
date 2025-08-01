import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users, ClipboardList, Clock, Tv2 } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

export default function DashboardPage() {
  const features = [
    {
      href: "/cadastros",
      title: "Cadastros",
      description: "Gerencie pacientes, médicos e enfermeiros.",
      icon: Users,
      target: "_self"
    },
    {
      href: "/triagem",
      title: "Triagem",
      description: "Realize a triagem e priorize atendimentos.",
      icon: ClipboardList,
      target: "_self"
    },
    {
      href: "/atendimento",
      title: "Atendimento",
      description: "Monitore o tempo de cada consulta.",
      icon: Clock,
      target: "_self"
    },
    {
      href: "/painel",
      title: "Painel de Senhas",
      description: "Exiba as senhas de atendimento na TV.",
      icon: Tv2,
      target: "_blank"
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {features.map((feature) => (
        <Link href={feature.href} key={feature.title} target={feature.target}>
          <Card className="hover:border-primary/80 hover:shadow-lg transition-all h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{feature.title}</CardTitle>
              <feature.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-xs text-muted-foreground">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
