
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { MoreHorizontal, Pencil, Search, Mars, History, Eye, Venus, PlusCircle, Trash2, Send, FileText } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { HistoryDialog } from "@/components/patients/history-dialog";
import { ViewDialog } from "@/components/patients/view-dialog";
import { PatientDialog } from "@/components/patients/patient-dialog";
import type { Paciente } from "@/types/paciente";
import { DeleteConfirmationDialog } from "@/components/profissionais/delete-dialog";
import { useToast } from "@/hooks/use-toast";
import { getProfissionais, deleteProfissional } from "@/services/profissionaisService";
import { Skeleton } from "@/components/ui/skeleton";
import { EnviarParaFilaDialog } from "@/components/patients/send-to-queue-dialog";
import { getDepartamentos } from "@/services/departamentosService";
import type { Departamento } from "@/types/departamento";
import { ProntuarioDialog } from "@/components/pacientes/prontuario-dialog";
import { EditQueueItemDialog } from "../atendimento/edit-dialog";
import { FilaDeEsperaItem } from "@/types/fila";
import { updateHistoricoItem } from "@/services/filaDeEsperaService";
import type { Profissional } from "@/types/profissional";
import { ProfissionalDialog } from "../profissionais/profissional-dialog";
import { ViewProfissionalDialog } from "../profissionais/view-dialog";
import { HistoryProfissionalDialog } from "../profissionais/history-dialog";


export function ProfissionaisList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [filteredProfissionais, setFilteredProfissionais] = useState<Profissional[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  
  const [selectedProfissionalForHistory, setSelectedProfissionalForHistory] = useState<Profissional | null>(null);
  const [selectedProfissionalForView, setSelectedProfissionalForView] = useState<Profissional | null>(null);
  
  const [isProfissionalDialogOpen, setIsProfissionalDialogOpen] = useState(false);
  const [selectedProfissional, setSelectedProfissional] = useState<Profissional | null>(null);
  const [profissionalToDelete, setProfissionalToDelete] = useState<Profissional | null>(null);
  
  const [itemToEditFromHistory, setItemToEditFromHistory] = useState<FilaDeEsperaItem | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [profissionaisData, departamentosData] = await Promise.all([
        getProfissionais(), 
        getDepartamentos(),
      ]);
      setProfissionais(profissionaisData);
      setFilteredProfissionais(profissionaisData);
      setDepartamentos(departamentosData.filter(d => d.situacao === 'Ativo'));

    } catch (error) {
      toast({
        title: "Erro ao buscar dados",
        description: "Não foi possível carregar a lista de profissionais ou departamentos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statusCounts = useMemo(() => {
    return profissionais.reduce((acc, p) => {
        if (p.situacao === 'Ativo') {
            acc.ativos++;
        } else {
            acc.inativos++;
        }
        return acc;
    }, { ativos: 0, inativos: 0 });
  }, [profissionais]);

  useEffect(() => {
    const lowercasedQuery = searchTerm.toLowerCase();
    
    // General filter
    const filteredData = profissionais.filter((item) => {
      return (
        item.nome.toLowerCase().includes(lowercasedQuery) ||
        (item.crm && item.crm.toLowerCase().includes(lowercasedQuery)) ||
        (item.cpf && item.cpf.includes(searchTerm)) ||
        (item.cns && item.cns.includes(searchTerm))
      );
    });
    setFilteredProfissionais(filteredData);
  }, [searchTerm, profissionais]);

  const handleSuccess = () => {
    fetchData();
    setSelectedProfissional(null);
  };

  const handleAddNew = () => {
    setSelectedProfissional(null);
    setIsProfissionalDialogOpen(true);
  };

  const handleEdit = (profissional: Profissional) => {
    setSelectedProfissional(profissional);
    setIsProfissionalDialogOpen(true);
  };
  
  const handleDelete = (profissional: Profissional) => {
    setProfissionalToDelete(profissional);
  };

  const handleDeleteConfirm = async () => {
    if (profissionalToDelete) {
      try {
        await deleteProfissional(profissionalToDelete.id);
        fetchData();
        toast({
          title: "Profissional Excluído!",
          description: `O profissional ${profissionalToDelete.nome} foi removido do sistema.`,
        });
      } catch (error) {
         toast({
          title: "Erro ao excluir profissional",
          description: "Não foi possível remover o profissional.",
          variant: "destructive",
        });
      } finally {
        setProfissionalToDelete(null);
      }
    }
  };


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Lista de Profissionais</CardTitle>
              <CardDescription>Visualize e gerencie os profissionais cadastrados no sistema.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full max-w-md min-w-[350px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, CPF, CNS ou Conselho..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Profissional
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-2 py-2 text-xs">Código</TableHead>
                <TableHead className="px-2 py-2 text-xs">Profissional</TableHead>
                <TableHead className="px-2 py-2 text-xs">Conselho</TableHead>
                <TableHead className="px-2 py-2 text-xs">Especialidade</TableHead>
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
                    {[...Array(8)].map((_, j) => (
                      <TableCell key={j} className="px-2 py-1 text-xs">
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredProfissionais.length > 0 ? (
                filteredProfissionais.map((profissional) => (
                  <TableRow key={profissional.id}>
                    <TableCell className="font-mono px-2 py-1 text-xs">
                      <Badge variant="outline">{profissional.codigo}</Badge>
                    </TableCell>
                    <TableCell className="font-medium px-2 py-1 text-xs">
                      {profissional.nome}
                    </TableCell>
                    <TableCell className="px-2 py-1 text-xs">{profissional.crm}</TableCell>
                    <TableCell className="px-2 py-1 text-xs"><Badge variant="secondary">{profissional.especialidade}</Badge></TableCell>
                    <TableCell className="px-2 py-1 text-xs">{profissional.cns}</TableCell>
                    <TableCell className="px-2 py-1 text-xs">{profissional.cpf}</TableCell>
                    <TableCell className="px-2 py-1 text-xs">
                      <Badge variant={profissional.situacao === 'Ativo' ? "default" : "destructive"} className={profissional.situacao === 'Ativo' ? 'bg-green-500 hover:bg-green-600 text-xs' : 'text-xs'}>
                        {profissional.situacao}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-2 py-1">
                      <div className="flex items-center justify-end gap-1">
                         <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedProfissionalForView(profissional)}>
                            <Eye className="h-3 w-3" />
                            <span className="sr-only">Visualizar Cadastro</span>
                        </Button>
                         <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(profissional)}>
                            <Pencil className="h-3 w-3" />
                            <span className="sr-only">Editar</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedProfissionalForHistory(profissional)}>
                            <History className="h-3 w-3" />
                            <span className="sr-only">Histórico</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => handleDelete(profissional)}>
                            <Trash2 className="h-3 w-3" />
                            <span className="sr-only">Excluir</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                    Nenhum profissional cadastrado. Comece adicionando um novo.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
         <CardFooter className="py-3 px-6 border-t flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
                Exibindo <strong>{filteredProfissionais.length}</strong> de <strong>{profissionais.length}</strong> {profissionais.length === 1 ? 'registro' : 'registros'}
            </div>
            <div className="flex items-center gap-4 text-xs">
                <span className="text-green-600 font-medium">Ativos: <strong>{statusCounts.ativos}</strong></span>
                <span className="text-red-600 font-medium">Inativos: <strong>{statusCounts.inativos}</strong></span>
            </div>
        </CardFooter>
      </Card>
      {selectedProfissionalForHistory && (
          <HistoryProfissionalDialog
            isOpen={!!selectedProfissionalForHistory}
            onOpenChange={(isOpen) => !isOpen && setSelectedProfissionalForHistory(null)}
            profissional={selectedProfissionalForHistory}
          />
      )}
      {selectedProfissionalForView && (
          <ViewProfissionalDialog
            isOpen={!!selectedProfissionalForView}
            onOpenChange={(isOpen) => !isOpen && setSelectedProfissionalForView(null)}
            profissional={selectedProfissionalForView}
          />
      )}
       <ProfissionalDialog
          isOpen={isProfissionalDialogOpen}
          onOpenChange={setIsProfissionalDialogOpen}
          onSuccess={handleSuccess}
          profissional={selectedProfissional}
        />
        {profissionalToDelete && (
            <DeleteConfirmationDialog
                isOpen={!!profissionalToDelete}
                onOpenChange={() => setProfissionalToDelete(null)}
                onConfirm={handleDeleteConfirm}
                profissionalName={profissionalToDelete?.nome || ''}
            />
        )}
    </>
  );
}
