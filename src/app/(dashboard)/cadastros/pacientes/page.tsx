import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu";

const pacientes = [
  { id: '1', nome: 'João da Silva', cpf: '123.456.789-00', dataNascimento: '15/05/1985' },
  { id: '2', nome: 'Maria Oliveira', cpf: '987.654.321-00', dataNascimento: '22/09/1990' },
  { id: '3', nome: 'Carlos Pereira', cpf: '111.222.333-44', dataNascimento: '10/01/2001' },
  { id: '4', nome: 'Ana Souza', cpf: '555.666.777-88', dataNascimento: '30/11/1978' },
];

export default function PacientesPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Pacientes</CardTitle>
            <CardDescription>Gerencie os pacientes cadastrados.</CardDescription>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Paciente
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">CPF</TableHead>
              <TableHead className="hidden sm:table-cell">Data de Nascimento</TableHead>
              <TableHead><span className="sr-only">Ações</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pacientes.map((paciente) => (
              <TableRow key={paciente.id}>
                <TableCell className="font-medium">{paciente.nome}</TableCell>
                <TableCell className="hidden md:table-cell">{paciente.cpf}</TableCell>
                <TableCell className="hidden sm:table-cell">{paciente.dataNascimento}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Ver Prontuário</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive">Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
