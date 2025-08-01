"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const waitingPatients = [
  { name: "Carlos Pereira", priority: "Urgente", time: "10:30" },
  { name: "Fernanda Costa", priority: "Pouco Urgente", time: "10:35" },
  { name: "Roberto Almeida", priority: "Não Urgente", time: "10:40" },
];

export default function TriagemPage() {
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'Urgente': return 'destructive';
      case 'Pouco Urgente': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card className="self-start">
        <CardHeader>
          <CardTitle>Nova Triagem</CardTitle>
          <CardDescription>Preencha os dados para iniciar a triagem do paciente.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patient">Paciente</Label>
            <Input id="patient" placeholder="Buscar paciente pelo nome ou CPF..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="symptoms">Sintomas e Queixas</Label>
            <Textarea id="symptoms" placeholder="Descreva os sintomas principais..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Classificação de Risco</Label>
            <Select>
              <SelectTrigger id="priority">
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">Urgente (Vermelho)</SelectItem>
                <SelectItem value="less-urgent">Pouco Urgente (Amarelo)</SelectItem>
                <SelectItem value="not-urgent">Não Urgente (Verde)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" size="lg">Iniciar Atendimento</Button>
        </CardFooter>
      </Card>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-headline">Fila de Espera</h2>
        {waitingPatients.map((patient, index) => (
            <Card key={index} className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold">{patient.name}</p>
                <p className="text-sm text-muted-foreground">Chegada: {patient.time}</p>
              </div>
              <Badge variant={getPriorityVariant(patient.priority)} className="text-sm">{patient.priority}</Badge>
            </Card>
          ))}
          {waitingPatients.length === 0 && (
            <Card className="flex items-center justify-center p-8 border-dashed">
              <p className="text-muted-foreground">Nenhum paciente na fila de espera.</p>
            </Card>
          )}
      </div>
    </div>
  );
}
