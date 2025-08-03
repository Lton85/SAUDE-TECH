import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { MoreHorizontal, History, Pencil, Search, Mars } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const pacientes = [
  {
    id: '81232',
    nome: 'Aarao de Carvalho da Costa',
    mae: 'Marinete de Carvalho da Costa',
    sexo: 'Masculino',
    idade: '49a',
    nascimento: '28/01/1976',
    cns: '706403696677388',
    cpf: '844.481.724-49',
    situacao: 'Ativo'
  },
];

export default function PacientesPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Lista de Pacientes</CardTitle>
            <CardDescription>Visualize e gerencie os pacientes cadastrados no sistema.</CardDescription>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, mãe, CPF, CNS ou endereço..."
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Código</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Mãe</TableHead>
              <TableHead>Sexo</TableHead>
              <TableHead>Idade</TableHead>
              <TableHead>Nascimento</TableHead>
              <TableHead>CNS</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pacientes.map((paciente) => (
              <TableRow key={paciente.id}>
                <TableCell>
                  <Badge variant="outline">{paciente.id}</Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {paciente.nome}
                </TableCell>
                <TableCell>{paciente.mae}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mars className="h-4 w-4 text-blue-500" />
                    <span>{paciente.sexo}</span>
                  </div>
                </TableCell>
                <TableCell>{paciente.idade}</TableCell>
                <TableCell>{paciente.nascimento}</TableCell>
                <TableCell>{paciente.cns}</TableCell>
                <TableCell>{paciente.cpf}</TableCell>
                <TableCell>
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                    {paciente.situacao}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <History className="h-4 w-4" />
                        <span className="sr-only">Histórico</span>
                    </Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem>Ver Prontuário</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
