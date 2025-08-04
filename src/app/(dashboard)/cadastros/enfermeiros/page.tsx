"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { PlusCircle, Pencil, Trash2, Venus, Mars, Eye, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getEnfermeiros, deleteEnfermeiro } from "@/services/enfermeirosService";
import type { Enfermeiro } from "@/types/enfermeiro";
import { Skeleton } from "@/components/ui/skeleton";
import { EnfermeiroDialog } from "@/components/enfermeiros/enfermeiro-dialog";
import { DeleteEnfermeiroDialog } from "@/components/enfermeiros/delete-dialog";
import { ViewEnfermeiroDialog } from "@/components/enfermeiros/view-dialog";
import { HistoryEnfermeiroDialog } from "@/components/enfermeiros/history-dialog";
import { useToast } from "@/hooks/use-toast";

export default function EnfermeirosPage() {
  const [enfermeiros, setEnfermeiros] = useState<Enfermeiro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEnfermeiro, setSelectedEnfermeiro] = useState<Enfermeiro | null>(null);
  const [enfermeiroToDelete, setEnfermeiroToDelete] = useState<Enfermeiro | null>(null);
  const [enfermeiroToView, setEnfermeiroToView] = useState<Enfermeiro | null>(null);
  const [enfermeiroToHistory, setEnfermeiroToHistory] = useState<Enfermeiro | null>(null);

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
  
  const handleView = (enfermeiro: Enfermeiro) => {
    setEnfermeiroToView(enfermeiro);
  };
  
  const handleHistory = (enfermeiro: Enfermeiro) => {
    setEnfermeiroToHistory(enfermeiro);
  };

  const handleDelete = (enfermeiro: Enfermeiro) => {
    setEnfermeiroToDelete(enfermeiro);
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
                <TableHead className="px-2 py-2 text-xs">Código</TableHead>
                <TableHead className="px-2 py-2 text-xs">Nome</TableHead>
                <TableHead className="px-2 py-2 text-xs">CNS</TableHead>
                <TableHead className="px-2 py-2 text-xs">COREN</TableHead>
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
              ) : enfermeiros.length > 0 ? (
                enfermeiros.map((enfermeiro) => (
                  <TableRow key={enfermeiro.id}>
                    <TableCell className="font-mono px-2 py-1 text-xs"><Badge variant="outline">{enfermeiro.codigo}</Badge></TableCell>
                    <TableCell className="font-medium px-2 py-1 text-xs">{enfermeiro.nome}</TableCell>
                    <TableCell className="px-2 py-1 text-xs">{enfermeiro.cns}</TableCell>
                    <TableCell className="px-2 py-1 text-xs">{enfermeiro.coren}</TableCell>
                    <TableCell className="px-2 py-1 text-xs"><Badge variant="secondary">{enfermeiro.especialidade}</Badge></TableCell>
                    <TableCell className="px-2 py-1 text-xs">{enfermeiro.cpf}</TableCell>
                    <TableCell className="px-2 py-1 text-xs">
                     <div className="flex items-center gap-1">
                        {enfermeiro.sexo === 'Masculino' ? <Mars className="h-3 w-3 text-blue-500" /> : <Venus className="h-3 w-3 text-pink-500" />}
                        <span>{enfermeiro.sexo}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-2 py-1 text-xs">
                      <Badge variant={enfermeiro.situacao === 'Ativo' ? "default" : "destructive"} className={enfermeiro.situacao === 'Ativo' ? 'bg-green-500 hover:bg-green-600 text-xs' : 'text-xs'}>
                        {enfermeiro.situacao}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-2 py-1">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleView(enfermeiro)}>
                            <Eye className="h-3 w-3" />
                            <span className="sr-only">Visualizar</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(enfermeiro)}>
                            <Pencil className="h-3 w-3" />
                            <span className="sr-only">Editar</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleHistory(enfermeiro)}>
                            <History className="h-3 w-3" />
                            <span className="sr-only">Histórico</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => handleDelete(enfermeiro)}>
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
          isOpen={!!enfermeiroToDelete}
          onOpenChange={() => setEnfermeiroToDelete(null)}
          onConfirm={handleDeleteConfirm}
          enfermeiroName={enfermeiroToDelete.nome}
        />
      )}
      {enfermeiroToView && (
        <ViewEnfermeiroDialog
            isOpen={!!enfermeiroToView}
            onOpenChange={() => setEnfermeiroToView(null)}
            enfermeiro={enfermeiroToView}
        />
      )}
      {enfermeiroToHistory && (
          <HistoryEnfermeiroDialog
              isOpen={!!enfermeiroToHistory}
              onOpenChange={() => setEnfermeiroToHistory(null)}
              enfermeiro={enfermeiroToHistory}
          />
      )}
    </>
  );
}
