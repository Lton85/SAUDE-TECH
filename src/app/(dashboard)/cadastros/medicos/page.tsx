"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle, Trash2, Pencil } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getMedicos, deleteMedico } from "@/services/medicosService";
import type { Medico } from "@/types/medico";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { MedicoDialog } from "@/components/medicos/medico-dialog";
import { DeleteConfirmationDialog } from "@/components/medicos/delete-dialog";


export default function MedicosPage() {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMedico, setSelectedMedico] = useState<Medico | null>(null);
  const [medicoToDelete, setMedicoToDelete] = useState<Medico | null>(null);
  const { toast } = useToast();

  const fetchMedicos = async () => {
    setIsLoading(true);
    try {
      const data = await getMedicos();
      setMedicos(data);
    } catch (error) {
      toast({
        title: "Erro ao buscar médicos",
        description: "Não foi possível carregar a lista de médicos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchMedicos();
  }, []);

  const handleSuccess = () => {
    fetchMedicos();
    setSelectedMedico(null);
  };
  
  const handleAddNew = () => {
    setSelectedMedico(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (medico: Medico) => {
    setSelectedMedico(medico);
    setIsDialogOpen(true);
  };

  const handleDelete = (medico: Medico) => {
    setMedicoToDelete(medico);
  };

  const handleDeleteConfirm = async () => {
    if (medicoToDelete) {
      try {
        await deleteMedico(medicoToDelete.id);
        fetchMedicos();
        toast({
          title: "Médico Excluído!",
          description: `O médico ${medicoToDelete.nome} foi removido do sistema.`,
        });
      } catch (error) {
         toast({
          title: "Erro ao excluir médico",
          description: "Não foi possível remover o médico.",
          variant: "destructive",
        });
      } finally {
        setMedicoToDelete(null);
      }
    }
  };

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Médicos</CardTitle>
            <CardDescription>Gerencie a equipe médica.</CardDescription>
          </div>
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Médico
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CRM</TableHead>
              <TableHead>Especialidade</TableHead>
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
            ) : medicos.length > 0 ? (
              medicos.map((medico) => (
                <TableRow key={medico.id}>
                  <TableCell className="font-medium">{medico.nome}</TableCell>
                  <TableCell>{medico.crm}</TableCell>
                  <TableCell><Badge variant="secondary">{medico.especialidade}</Badge></TableCell>
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
                        <DropdownMenuItem onClick={() => handleEdit(medico)}>
                            <Pencil className="mr-2 h-3 w-3" />
                            <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Ver Agenda</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(medico)}>
                            <Trash2 className="mr-2 h-3 w-3" />
                            <span>Excluir</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                    Nenhum médico cadastrado.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <MedicoDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleSuccess}
        medico={selectedMedico}
    />
   
    {medicoToDelete && (
        <DeleteConfirmationDialog
            isOpen={!!medicoToDelete}
            onOpenChange={() => setMedicoToDelete(null)}
            onConfirm={handleDeleteConfirm}
            medicoName={medicoToDelete?.nome || ''}
        />
    )}
    </>
  );
}
