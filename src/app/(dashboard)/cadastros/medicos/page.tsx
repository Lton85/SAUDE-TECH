"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle, Trash2, Pencil, Venus, Mars } from "lucide-react";
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
                <TableHead className="px-2 py-2 text-xs">Código</TableHead>
                <TableHead className="px-2 py-2 text-xs">Nome</TableHead>
                <TableHead className="px-2 py-2 text-xs">CNS</TableHead>
                <TableHead className="px-2 py-2 text-xs">CRM</TableHead>
                <TableHead className="px-2 py-2 text-xs">Especialidade</TableHead>
                <TableHead className="px-2 py-2 text-xs">CPF</TableHead>
                <TableHead className="px-2 py-2 text-xs">Sexo</TableHead>
                <TableHead className="px-2 py-2 text-xs">Situação</TableHead>
                <TableHead className="text-right px-2 py-2 text-xs">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(9)].map((_, j) => (
                    <TableCell key={j} className="px-2 py-1"><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : medicos.length > 0 ? (
              medicos.map((medico) => (
                <TableRow key={medico.id}>
                   <TableCell className="font-mono px-2 py-1 text-xs"><Badge variant="outline">{medico.codigo}</Badge></TableCell>
                  <TableCell className="font-medium px-2 py-1 text-xs">{medico.nome}</TableCell>
                  <TableCell className="px-2 py-1 text-xs">{medico.cns}</TableCell>
                  <TableCell className="px-2 py-1 text-xs">{medico.crm}</TableCell>
                  <TableCell className="px-2 py-1 text-xs"><Badge variant="secondary">{medico.especialidade}</Badge></TableCell>
                  <TableCell className="px-2 py-1 text-xs">{medico.cpf}</TableCell>
                   <TableCell className="px-2 py-1 text-xs">
                     <div className="flex items-center gap-1">
                        {medico.sexo === 'Masculino' ? <Mars className="h-3 w-3 text-blue-500" /> : <Venus className="h-3 w-3 text-pink-500" />}
                        <span>{medico.sexo}</span>
                      </div>
                   </TableCell>
                   <TableCell className="px-2 py-1 text-xs">
                      <Badge variant={medico.situacao === 'Ativo' ? "default" : "destructive"} className={medico.situacao === 'Ativo' ? 'bg-green-500 hover:bg-green-600 text-xs' : 'text-xs'}>
                        {medico.situacao}
                      </Badge>
                    </TableCell>
                  <TableCell className="text-right px-2 py-1">
                     <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(medico)}>
                            <Pencil className="h-3 w-3" />
                            <span className="sr-only">Editar</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => handleDelete(medico)}>
                            <Trash2 className="h-3 w-3" />
                            <span className="sr-only">Excluir</span>
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
                <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
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
