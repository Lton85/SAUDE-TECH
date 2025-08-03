"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getEnfermeiros, deleteEnfermeiro } from "@/services/enfermeirosService";
import type { Enfermeiro } from "@/types/enfermeiro";
import { Skeleton } from "@/components/ui/skeleton";
import { EnfermeiroDialog } from "@/components/enfermeiros/enfermeiro-dialog";
import { DeleteEnfermeiroDialog } from "@/components/enfermeiros/delete-dialog";
import { useToast } from "@/hooks/use-toast";

export default function EnfermeirosPage() {
  const [enfermeiros, setEnfermeiros] = useState<Enfermeiro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEnfermeiro, setSelectedEnfermeiro] = useState<Enfermeiro | null>(null);
  const [enfermeiroToDelete, setEnfermeiroToDelete] = useState<Enfermeiro | null>(null);
  const { toast } = useToast();

  const fetchEnfermeiros = async () => {
    setIsLoading(true);
    try {
      const data = await getEnfermeiros();
      setEnfermeiros(data);
    } catch (error) {
      console.error("Erro ao buscar enfermeiros:", error);
      toast({
        title: "Erro ao buscar enfermeiros",
        description: "Não foi possível carregar a lista.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnfermeiros();
  }, []);
  
  const handleSuccess = () => {
    fetchEnfermeiros();
    setSelectedEnfermeiro(null);
  };

  const handleAddNew = () => {
    setSelectedEnfermeiro(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (enfermeiro: Enfermeiro) => {
    setSelectedEnfermeiro(enfermeiro);
    setIsDialogOpen(true);
  };

  const handleDelete = (enfermeiro: Enfermeiro) => {
    setEnfermeiroToDelete(enfermeiro);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (enfermeiroToDelete) {
      try {
        await deleteEnfermeiro(enfermeiroToDelete.id);
        fetchEnfermeiros();
        toast({
          title: "Enfermeiro(a) Excluído(a)!",
          description: `O registro de ${enfermeiroToDelete.nome} foi removido.`,
        });
      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível remover o registro.",
          variant: "destructive",
        });
      } finally {
        setIsDeleteDialogOpen(false);
        setEnfermeiroToDelete(null);
      }
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Enfermeiros</CardTitle>
              <CardDescription>Gerencie a equipe de enfermagem.</CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Enfermeiro
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>COREN</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead><span className="sr-only">Ações</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(4)].map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : enfermeiros.length > 0 ? (
                enfermeiros.map((enfermeiro) => (
                  <TableRow key={enfermeiro.id}>
                    <TableCell className="font-medium">{enfermeiro.nome}</TableCell>
                    <TableCell>{enfermeiro.coren}</TableCell>
                    <TableCell><Badge variant="outline">{enfermeiro.turno}</Badge></TableCell>
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
                          <DropdownMenuItem onClick={() => handleEdit(enfermeiro)}>
                            <Pencil className="mr-2 h-3 w-3" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(enfermeiro)}>
                            <Trash2 className="mr-2 h-3 w-3" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                    Nenhum enfermeiro cadastrado.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <EnfermeiroDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleSuccess}
        enfermeiro={selectedEnfermeiro}
      />
      
      {enfermeiroToDelete && (
        <DeleteEnfermeiroDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          enfermeiroName={enfermeiroToDelete.nome}
        />
      )}
    </>
  );
}
