

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { MoreHorizontal, Pencil, Search, Mars, History, Eye, Venus, PlusCircle, Trash2, Send, FileText } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { HistoryDialog } from "@/components/patients/history-dialog";
import { ViewDialog } from "@/components/patients/view-dialog";
import { PatientDialog } from "@/components/patients/patient-dialog";
import type { Paciente } from "@/types/paciente";
import { DeleteConfirmationDialog } from "@/components/patients/delete-dialog";
import { useToast } from "@/hooks/use-toast";
import { getPacientes, deletePaciente } from "@/services/pacientesService";
import { Skeleton } from "@/components/ui/skeleton";
import { EnviarParaFilaDialog } from "@/components/patients/send-to-queue-dialog";
import { getDepartamentos } from "@/services/departamentosService";
import type { Departamento } from "@/types/departamento";


export function PacientesList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [filteredPacientes, setFilteredPacientes] = useState<Paciente[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState<Paciente | null>(null);
  const [selectedPatientForView, setSelectedPatientForView] = useState<Paciente | null>(null);
  const [selectedPatientForQueue, setSelectedPatientForQueue] = useState<Paciente | null>(null);
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Paciente | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pacientesData, departamentosData] = await Promise.all([getPacientes(), getDepartamentos()]);
      setPacientes(pacientesData);
      setFilteredPacientes(pacientesData);
      setDepartamentos(departamentosData.filter(d => d.situacao === 'Ativo'));
    } catch (error) {
      toast({
        title: "Erro ao buscar dados",
        description: "Não foi possível carregar a lista de pacientes ou departamentos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const lowercasedQuery = searchTerm.toLowerCase();

    // Specific filters
    if (lowercasedQuery.startsWith("rua:")) {
      const searchValue = lowercasedQuery.substring(4).trim();
      setFilteredPacientes(pacientes.filter(p => p.endereco && p.endereco.toLowerCase().includes(searchValue)));
      return;
    }
    if (lowercasedQuery.startsWith("numero:")) {
      const searchValue = lowercasedQuery.substring(7).trim();
      setFilteredPacientes(pacientes.filter(p => p.numero && p.numero.toLowerCase().includes(searchValue)));
      return;
    }
    
    // General filter
    const filteredData = pacientes.filter((item) => {
      return (
        item.nome.toLowerCase().includes(lowercasedQuery) ||
        (item.mae && item.mae.toLowerCase().includes(lowercasedQuery)) ||
        (item.cpf && item.cpf.includes(searchTerm)) ||
        (item.cns && item.cns.includes(searchTerm)) ||
        (item.endereco && item.endereco.toLowerCase().includes(lowercasedQuery))
      );
    });
    setFilteredPacientes(filteredData);
  }, [searchTerm, pacientes]);

  const handleSuccess = () => {
    fetchData();
    setSelectedPatient(null);
  };

  const handleAddNew = () => {
    setSelectedPatient(null);
    setIsPatientDialogOpen(true);
  };

  const handleEdit = (paciente: Paciente) => {
    setSelectedPatient(paciente);
    setIsPatientDialogOpen(true);
  };

  const handleDelete = (paciente: Paciente) => {
    setPatientToDelete(paciente);
  };
  
  const handleSendToQueue = (paciente: Paciente) => {
    setSelectedPatientForQueue(paciente);
  }

  const handleDeleteConfirm = async () => {
    if (patientToDelete) {
      try {
        await deletePaciente(patientToDelete.id);
        fetchData();
        toast({
          title: "Paciente Excluído!",
          description: `O paciente ${patientToDelete.nome} foi removido do sistema.`,
        });
      } catch (error) {
         toast({
          title: "Erro ao excluir paciente",
          description: "Não foi possível remover o paciente.",
          variant: "destructive",
        });
      } finally {
        setPatientToDelete(null);
      }
    }
  };


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Lista de Pacientes</CardTitle>
              <CardDescription>Visualize e gerencie os pacientes cadastrados no sistema.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full max-w-md min-w-[350px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, mãe, CPF, CNS ou endereço..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Paciente
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-2 py-2 text-xs">Código</TableHead>
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
               {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(10)].map((_, j) => (
                      <TableCell key={j} className="px-2 py-1 text-xs">
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredPacientes.length > 0 ? (
                filteredPacientes.map((paciente) => (
                  <TableRow key={paciente.id}>
                    <TableCell className="font-mono px-2 py-1 text-xs">
                      <Badge variant="outline">{paciente.codigo}</Badge>
                    </TableCell>
                    <TableCell className="font-medium px-2 py-1 text-xs">
                      {paciente.nome}
                    </TableCell>
                    <TableCell className="px-2 py-1 text-xs">{paciente.mae}</TableCell>
                    <TableCell className="px-2 py-1 text-xs">
                      <div className="flex items-center gap-1">
                        {paciente.sexo === 'Masculino' ? <Mars className="h-3 w-3 text-blue-500" /> : <Venus className="h-3 w-3 text-pink-500" />}
                        <span className="text-xs">{paciente.sexo}</span>
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
                         <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(paciente)}>
                            <Pencil className="h-3 w-3" />
                            <span className="sr-only">Editar</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedPatientForHistory(paciente)}>
                            <History className="h-3 w-3" />
                            <span className="sr-only">Histórico</span>
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
                             <DropdownMenuItem onClick={() => handleSendToQueue(paciente)}>
                                <Send className="mr-2 h-3 w-3" />
                                <span>Enviar para Fila</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(paciente)}>
                                <Trash2 className="mr-2 h-3 w-3" />
                                <span>Excluir</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                    Nenhum paciente cadastrado. Comece adicionando um novo.
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
       <PatientDialog
          isOpen={isPatientDialogOpen}
          onOpenChange={setIsPatientDialogOpen}
          onSuccess={handleSuccess}
          paciente={selectedPatient}
        />
        {patientToDelete && (
            <DeleteConfirmationDialog
                isOpen={!!patientToDelete}
                onOpenChange={() => setPatientToDelete(null)}
                onConfirm={handleDeleteConfirm}
                patientName={patientToDelete?.nome || ''}
            />
        )}
        {selectedPatientForQueue && (
            <EnviarParaFilaDialog
                isOpen={!!selectedPatientForQueue}
                onOpenChange={() => setSelectedPatientForQueue(null)}
                paciente={selectedPatientForQueue}
                departamentos={departamentos}
            />
        )}
    </>
  );
}
