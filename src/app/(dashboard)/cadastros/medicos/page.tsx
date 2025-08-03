"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getMedicos, addMedico, deleteMedico } from "@/services/medicosService";
import type { Medico } from "@/types/medico";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { NewMedicoDialog } from "@/components/medicos/new-medico-dialog";
import { DeleteConfirmationDialog } from "@/components/medicos/delete-dialog";


export default function MedicosPage() {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewMedicoDialogOpen, setIsNewMedicoDialogOpen] = useState(false);
  const [medicoToDelete, setMedicoToDelete] = useState<Medico | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchMedicos() {
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
    fetchMedicos();
  }, [toast]);

  const handleMedicoCreated = async (newMedicoData: Omit<Medico, 'id'>) => {
    try {
        const newMedico = await addMedico(newMedicoData);
        const updatedMedicos = [newMedico, ...medicos];
        setMedicos(updatedMedicos);
         toast({
            title: "Médico Cadastrado!",
            description: `O médico ${newMedico.nome} foi adicionado com sucesso.`,
            className: "bg-green-500 text-white"
        });
    } catch (error) {
         toast({
            title: "Erro ao cadastrar médico",
            description: "Não foi possível adicionar o novo médico.",
            variant: "destructive",
        });
    }
  };

  const handleDeleteConfirm = async () => {
    if (medicoToDelete) {
      try {
        await deleteMedico(medicoToDelete.id);
        const updatedMedicos = medicos.filter(m => m.id !== medicoToDelete.id);
        setMedicos(updatedMedicos);
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
          <Button onClick={() => setIsNewMedicoDialogOpen(true)}>
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
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Ver Agenda</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setMedicoToDelete(medico)}>
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

    <NewMedicoDialog
        isOpen={isNewMedicoDialogOpen}
        onOpenChange={setIsNewMedicoDialogOpen}
        onMedicoCreated={handleMedicoCreated}
    />
    <DeleteConfirmationDialog
      isOpen={!!medicoToDelete}
      onOpenChange={(isOpen) => !isOpen && setMedicoToDelete(null)}
      onConfirm={handleDeleteConfirm}
      medicoName={medicoToDelete?.nome || ''}
    />
    </>
  );
}
