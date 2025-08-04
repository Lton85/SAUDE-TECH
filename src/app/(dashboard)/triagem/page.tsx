
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { PlusCircle, Pencil, Trash2, Eye, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getDepartamentos, deleteDepartamento } from "@/services/departamentosService";
import type { Departamento } from "@/types/departamento";
import { Skeleton } from "@/components/ui/skeleton";
import { DepartamentoDialog } from "@/components/departamentos/departamento-dialog";
import { DeleteDepartamentoDialog } from "@/components/departamentos/delete-dialog";
import { ViewDepartamentoDialog } from "@/components/departamentos/view-dialog";
import { HistoryDepartamentoDialog } from "@/components/departamentos/history-dialog";
import { useToast } from "@/hooks/use-toast";

export default function DepartamentosPage() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedDepartamento, setSelectedDepartamento] = useState<Departamento | null>(null);
  const [departamentoToDelete, setDepartamentoToDelete] = useState<Departamento | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const deptosData = await getDepartamentos();
      setDepartamentos(deptosData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar a lista de departamentos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSuccess = () => {
    fetchData();
    setIsDialogOpen(false);
    setSelectedDepartamento(null);
  };

  const handleAddNew = () => {
    setSelectedDepartamento(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (departamento: Departamento) => {
    setSelectedDepartamento(departamento);
    setIsDialogOpen(true);
  };
  
  const handleView = (departamento: Departamento) => {
    setSelectedDepartamento(departamento);
    setIsViewDialogOpen(true);
  };
  
  const handleHistory = (departamento: Departamento) => {
    setSelectedDepartamento(departamento);
    setIsHistoryDialogOpen(true);
  };

  const handleDelete = (departamento: Departamento) => {
    setDepartamentoToDelete(departamento);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (departamentoToDelete) {
      try {
        await deleteDepartamento(departamentoToDelete.id);
        fetchData();
        toast({
          title: "Departamento Excluído!",
          description: `O registro de ${departamentoToDelete.nome} foi removido.`,
        });
      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: (error as Error).message || "Não foi possível remover o registro.",
          variant: "destructive",
        });
      } finally {
        setIsDeleteDialogOpen(false);
        setDepartamentoToDelete(null);
      }
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Departamentos</CardTitle>
              <CardDescription>Gerencie os locais de atendimento.</CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Departamento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-2 py-2 text-xs w-[100px]">Código</TableHead>
                <TableHead className="px-2 py-2 text-xs">Nome</TableHead>
                <TableHead className="px-2 py-2 text-xs">Nº da Sala</TableHead>
                <TableHead className="px-2 py-2 text-xs">Situação</TableHead>
                <TableHead className="text-right px-2 py-2 text-xs">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(5)].map((_, j) => (
                      <TableCell key={j} className="px-2 py-1 text-xs"><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : departamentos.length > 0 ? (
                departamentos.map((departamento) => (
                  <TableRow key={departamento.id}>
                    <TableCell className="font-mono px-2 py-1 text-xs"><Badge variant="outline">{departamento.codigo}</Badge></TableCell>
                    <TableCell className="font-medium px-2 py-1 text-xs">{departamento.nome}</TableCell>
                    <TableCell className="px-2 py-1 text-xs">{departamento.numero || "N/A"}</TableCell>
                    <TableCell className="px-2 py-1 text-xs">
                      <Badge variant={departamento.situacao === 'Ativo' ? 'default' : 'destructive'} className={`${departamento.situacao === 'Ativo' ? 'bg-green-500 hover:bg-green-600' : ''} text-xs`}>
                        {departamento.situacao}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-2 py-1">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleView(departamento)}>
                          <Eye className="h-3 w-3" />
                          <span className="sr-only">Visualizar</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(departamento)}>
                          <Pencil className="h-3 w-3" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleHistory(departamento)}>
                          <History className="h-3 w-3" />
                          <span className="sr-only">Histórico</span>
                        </Button>
                         <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => handleDelete(departamento)}>
                          <Trash2 className="h-3 w-3" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                    Nenhum departamento cadastrado.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DepartamentoDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleSuccess}
        departamento={selectedDepartamento}
      />

      {selectedDepartamento && (
        <ViewDepartamentoDialog
          isOpen={isViewDialogOpen}
          onOpenChange={(isOpen) => {
            setIsViewDialogOpen(isOpen);
            if (!isOpen) {
              setSelectedDepartamento(null);
            }
          }}
          departamento={selectedDepartamento}
        />
      )}
      
       {selectedDepartamento && (
        <HistoryDepartamentoDialog
          isOpen={isHistoryDialogOpen}
          onOpenChange={(isOpen) => {
            setIsHistoryDialogOpen(isOpen);
            if (!isOpen) {
              setSelectedDepartamento(null);
            }
          }}
          departamento={selectedDepartamento}
        />
      )}

      {departamentoToDelete && (
        <DeleteDepartamentoDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          departamentoName={departamentoToDelete.nome}
        />
      )}
    </>
  );
}
