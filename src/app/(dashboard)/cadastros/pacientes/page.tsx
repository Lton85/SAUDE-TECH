"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { MoreHorizontal, Pencil, Search, Mars, History, Eye, Venus } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { HistoryDialog } from "@/components/patients/history-dialog";
import { ViewDialog } from "@/components/patients/view-dialog";
import type { Paciente } from "@/types/paciente";


const pacientesData: Paciente[] = [
  {
    id: '81232',
    nome: 'Aarao de Carvalho da Costa',
    mae: 'Marinete de Carvalho da Costa',
    sexo: 'Masculino',
    idade: '49a',
    nascimento: '28/01/1976',
    cns: '706403696677388',
    cpf: '844.481.724-49',
    situacao: 'Ativo',
    historico: {
        criadoEm: '2023-10-26T06:50:00',
        criadoPor: 'Recepção',
        alteradoEm: '2023-10-26T07:00:00',
        alteradoPor: 'Triagem',
    }
  },
  {
    id: '81233',
    nome: 'Beatriz Almeida',
    mae: 'Juliana Almeida',
    sexo: 'Feminino',
    idade: '32a',
    nascimento: '15/05/1992',
    cns: '700001234567890',
    cpf: '123.456.789-00',
    situacao: 'Ativo',
    historico: {
        criadoEm: '2023-10-27T08:00:00',
        criadoPor: 'Recepção',
        alteradoEm: '2023-10-27T08:15:00',
        alteradoPor: 'Triagem',
    }
  },
  {
    id: '81234',
    nome: 'Carlos Eduardo Pereira',
    mae: 'Maria Pereira',
    sexo: 'Masculino',
    idade: '55a',
    nascimento: '10/11/1968',
    cns: '701234567890123',
    cpf: '987.654.321-11',
    situacao: 'Inativo',
    historico: {
        criadoEm: '2023-10-28T09:30:00',
        criadoPor: 'Recepção',
        alteradoEm: '2023-10-28T10:00:00',
        alteradoPor: 'Recepção',
    }
  },
];

export default function PacientesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPacientes, setFilteredPacientes] = useState(pacientesData);
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState<Paciente | null>(null);
  const [selectedPatientForView, setSelectedPatientForView] = useState<Paciente | null>(null);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = pacientesData.filter((item) => {
      return (
        item.nome.toLowerCase().includes(lowercasedFilter) ||
        item.mae.toLowerCase().includes(lowercasedFilter) ||
        item.cpf.includes(searchTerm) ||
        item.cns.includes(searchTerm)
      );
    });
    setFilteredPacientes(filteredData);
  }, [searchTerm]);

  return (
    <>
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
                placeholder="Buscar por nome, mãe, CPF ou CNS..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] px-2 py-2 text-xs">Código</TableHead>
                <TableHead className="px-2 py-2 text-xs">Paciente</TableHead>
                <TableHead className="px-2 py-2 text-xs">Mãe</TableHead>
                <TableHead className="px-2 py-2 text-xs">Sexo</TableHead>
                <TableHead className="px-2 py-2 text-xs">Idade</TableHead>
                <TableHead className="px-2 py-2 text-xs">Nascimento</TableHead>
                <TableHead className="px-2 py-2 text-xs">CNS</TableHead>
                <TableHead className="px-2 py-2 text-xs">CPF</TableHead>
                <TableHead className="px-2 py-2 text-xs">Situação</TableHead>
                <TableHead className="text-right px-2 py-2 text-xs">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPacientes.map((paciente) => (
                <TableRow key={paciente.id}>
                  <TableCell className="px-2 py-1 text-xs">
                    <Badge variant="outline">{paciente.id}</Badge>
                  </TableCell>
                  <TableCell className="font-medium px-2 py-1 text-xs">
                    {paciente.nome}
                  </TableCell>
                  <TableCell className="px-2 py-1 text-xs">{paciente.mae}</TableCell>
                  <TableCell className="px-2 py-1 text-xs">
                    <div className="flex items-center gap-1">
                      {paciente.sexo === 'Masculino' ? <Mars className="h-3 w-3 text-blue-500" /> : <Venus className="h-3 w-3 text-pink-500" />}
                      <span>{paciente.sexo}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-1 text-xs">{paciente.idade}</TableCell>
                  <TableCell className="px-2 py-1 text-xs">{paciente.nascimento}</TableCell>
                  <TableCell className="px-2 py-1 text-xs">{paciente.cns}</TableCell>
                  <TableCell className="px-2 py-1 text-xs">{paciente.cpf}</TableCell>
                  <TableCell className="px-2 py-1 text-xs">
                    <Badge variant={paciente.situacao === 'Ativo' ? "default" : "destructive"} className={paciente.situacao === 'Ativo' ? 'bg-green-500 hover:bg-green-600 text-xs' : 'text-xs'}>
                      {paciente.situacao}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-2 py-1">
                    <div className="flex items-center justify-end gap-1">
                       <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedPatientForView(paciente)}>
                          <Eye className="h-3 w-3" />
                          <span className="sr-only">Visualizar Cadastro</span>
                      </Button>
                       <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Pencil className="h-3 w-3" />
                          <span className="sr-only">Editar</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-6 w-6 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setSelectedPatientForHistory(paciente)}>
                              <History className="mr-2 h-3 w-3" />
                              <span>Histórico</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive">Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
               {filteredPacientes.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={10} className="h-24 text-center">
                      Nenhum resultado encontrado.
                      </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {selectedPatientForHistory && (
          <HistoryDialog
            isOpen={!!selectedPatientForHistory}
            onOpenChange={(isOpen) => !isOpen && setSelectedPatientForHistory(null)}
            paciente={selectedPatientForHistory}
          />
      )}
      {selectedPatientForView && (
          <ViewDialog
            isOpen={!!selectedPatientForView}
            onOpenChange={(isOpen) => !isOpen && setSelectedPatientForView(null)}
            paciente={selectedPatientForView}
          />
      )}
    </>
  );
}
