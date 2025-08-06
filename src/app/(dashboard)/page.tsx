
import { Card, CardDescription, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardList, Clock, Tv2, Settings } from "lucide-react";

// This component is not used directly in the tabbed layout, 
// but is kept for reference or if the tab system is removed.
// The new "home" is managed inside the client-layout.
export default function DashboardPage() {
  const features = [
    {
      href: "/atendimento",
      title: "Atendimento",
      description: "Monitore o tempo de cada consulta.",
      icon: Clock,
      target: "_self"
    },
    {
      href: "/cadastros",
      title: "Cadastros",
      description: "Gerencie pacientes, médicos e enfermeiros.",
      icon: Users,
      target: "_self"
    },
    {
      href: "/triagem",
      title: "Departamentos",
      description: "Gerencie os departamentos e suas prioridades.",
      icon: ClipboardList,
      target: "_self"
    },
     {
      href: "/configuracoes",
      title: "Configurações",
      description: "Ajuste as configurações gerais do sistema.",
      icon: Settings,
      target: "_self"
    },
    {
      href: "/painel",
      title: "Painel de Senhas",
      description: "Exiba as senhas de atendimento na TV.",
      icon: Tv2,
      target: "_blank"
    },
  ];

  return (
    <div className="p-4">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {features.map((feature) => (
          <div key={feature.title} className="flex cursor-pointer">
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
    </div>
  );
}
