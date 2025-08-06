
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PacientesList } from "@/components/cadastros/pacientes-list";
import { ProfissionaisList } from "@/components/cadastros/profissionais-list";
import { User, Stethoscope } from "lucide-react";

export default function CadastrosPage() {
  return (
    <Tabs defaultValue="pacientes" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="pacientes">
          <User className="mr-2 h-4 w-4" />
          Pacientes
        </TabsTrigger>
        <TabsTrigger value="profissionais">
          <Stethoscope className="mr-2 h-4 w-4" />
          Profissionais
        </TabsTrigger>
      </TabsList>
      <TabsContent value="pacientes" className="mt-4">
        <PacientesList />
      </TabsContent>
      <TabsContent value="profissionais" className="mt-4">
        <ProfissionaisList />
      </TabsContent>
    </Tabs>
  );
}
