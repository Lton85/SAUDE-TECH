
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { PlusCircle, Trash2, Pencil, Venus, Mars, Eye, History, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getProfissionais, deleteProfissional } from "@/services/profissionaisService";
import type { Profissional } from "@/types/profissional";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ProfissionalDialog } from "@/components/profissionais/profissional-dialog";
import { DeleteConfirmationDialog } from "@/components/profissionais/delete-dialog";
import { ViewProfissionalDialog } from "@/components/profissionais/view-dialog";
import { HistoryProfissionalDialog } from "@/components/profissionais/history-dialog";
import { Input } from "@/components/ui/input";


export function ProfissionaisList() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [filteredProfissionais, setFilteredProfissionais] = useState<Profissional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProfissional, setSelectedProfissional] = useState<Profissional | null>(null);
  const [profissionalToDelete, setProfissionalToDelete] = useState<Profissional | null>(null);
  const [profissionalToView, setProfissionalToView] = useState<Profissional | null>(null);
  const [profissionalToHistory, setProfissionalToHistory] = useState<Profissional | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const fetchProfissionais = async () => {
    setIsLoading(true);
    try {
      const data = await getProfissionais();
      setProfissionais(data);
      setFilteredProfissionais(data);
    } catch (error) {
      toast({
        title: "Erro ao buscar profissionais",
        description: "Não foi possível carregar a lista de profissionais.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchProfissionais();
  }, []);
  
  const statusCounts = useMemo(() => {
    return profissionais.reduce((acc, profissional) => {
        if (profissional.situacao === 'Ativo') {
            acc.ativos++;
        } else {
            acc.inativos++;
        }
        return acc;
    }, { ativos: 0, inativos: 0 });
  }, [profissionais]);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = profissionais.filter((item) => {
      return (
        item.nome.toLowerCase().includes(lowercasedFilter) ||
        (item.cpf && item.cpf.includes(searchTerm)) ||
        (item.cns && item.cns.includes(searchTerm)) ||
        (item.crm && item.crm.toLowerCase().includes(lowercasedFilter))
      );
    });
    setFilteredProfissionais(filteredData);
  }, [searchTerm, profissionais]);

  const handleSuccess = () => {
    fetchProfissionais();
    setSelectedProfissional(null);
  };
  
  const handleAddNew = () => {
    setSelectedProfissional(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (profissional: Profissional) => {
    setSelectedProfissional(profissional);
    setIsDialogOpen(true);
  };
  
  const handleView = (profissional: Profissional) => {
    setProfissionalToView(profissional);
  };
  
  const handleHistory = (profissional: Profissional) => {
    setProfissionalToHistory(profissional);
  };

  const handleDelete = (profissional: Profissional) => {
    setProfissionalToDelete(profissional);
  };

  const handleDeleteConfirm = async () => {
    if (profissionalToDelete) {
      try {
        await deleteProfissional(profissionalToDelete.id);
        fetchProfissionais();
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
            <CardTitle>Profissionais</CardTitle>
            <CardDescription>Gerencie a equipe de profissionais da saúde.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full max-w-sm min-w-[350px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, CPF, CNS ou CRM..."
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
                    <TableCell key={j} className="px-2 py-1 text-xs"><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredProfissionais.length > 0 ? (
              filteredProfissionais.map((profissional) => (
                <TableRow key={profissional.id}>
                   <TableCell className="font-mono px-2 py-1 text-xs"><Badge variant="outline">{profissional.codigo}</Badge></TableCell>
                  <TableCell className="font-medium px-2 py-1 text-xs">{profissional.nome}</TableCell>
                  <TableCell className="px-2 py-1 text-xs">{profissional.cns}</TableCell>
                  <TableCell className="px-2 py-1 text-xs">{profissional.crm}</TableCell>
                  <TableCell className="px-2 py-1 text-xs"><Badge variant="secondary">{profissional.especialidade}</Badge></TableCell>
                  <TableCell className="px-2 py-1 text-xs">{profissional.cpf}</TableCell>
                   <TableCell className="px-2 py-1 text-xs">
                     <div className="flex items-center gap-1">
                        {profissional.sexo === 'Masculino' ? <Mars className="h-3 w-3 text-blue-500" /> : <Venus className="h-3 w-3 text-pink-500" />}
                        <span className="text-xs">{profissional.sexo}</span>
                      </div>
                   </TableCell>
                   <TableCell className="px-2 py-1 text-xs">
                      <Badge variant={profissional.situacao === 'Ativo' ? "default" : "destructive"} className={profissional.situacao === 'Ativo' ? 'bg-green-500 hover:bg-green-600 text-xs' : 'text-xs'}>
                        {profissional.situacao}
                      </Badge>
                    </TableCell>
                  <TableCell className="text-right px-2 py-1">
                     <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleView(profissional)}>
                            <Eye className="h-3 w-3" />
                            <span className="sr-only">Visualizar</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(profissional)}>
                            <Pencil className="h-3 w-3" />
                            <span className="sr-only">Editar</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleHistory(profissional)}>
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
                    <TableCell colSpan={9} className="h-24 text-center">
                    Nenhum profissional encontrado.
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

    <ProfissionalDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
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
    
    {profissionalToView && (
        <ViewProfissionalDialog
            isOpen={!!profissionalToView}
            onOpenChange={() => setProfissionalToView(null)}
            profissional={profissionalToView}
        />
    )}

    {profissionalToHistory && (
        <HistoryProfissionalDialog
            isOpen={!!profissionalToHistory}
            onOpenChange={() => setProfissionalToHistory(null)}
            profissional={profissionalToHistory}
        />
    )}
    </>
  );
}
