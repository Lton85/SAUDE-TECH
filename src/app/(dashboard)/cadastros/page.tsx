import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { User, Stethoscope, UserPlus } from "lucide-react";

export default function CadastrosPage() {
  const registrationTypes = [
    { href: "/cadastros/pacientes", title: "Pacientes", description: "Cadastrar e gerenciar dados de pacientes.", icon: User },
    { href: "/cadastros/medicos", title: "Médicos", description: "Cadastrar e gerenciar equipe médica.", icon: Stethoscope },
    { href: "/cadastros/enfermeiros", title: "Enfermeiros", description: "Cadastrar e gerenciar equipe de enfermagem.", icon: UserPlus },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {registrationTypes.map((type) => (
        <Link href={type.href} key={type.title}>
          <Card className="hover:border-primary/80 hover:shadow-lg transition-all h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <type.icon className="h-7 w-7 text-primary" />
                {type.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {type.description}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
