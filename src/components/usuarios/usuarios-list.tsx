
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { MoreHorizontal, Pencil, Search, PlusCircle, Trash2, History, Eye, KeyRound, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Usuario } from "@/types/usuario";
import { useToast } from "@/hooks/use-toast";
import { getUsuarios, deleteUsuario } from "@/services/usuariosService";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteUsuarioDialog } from "@/components/usuarios/delete-dialog";
import { UsuarioDialog } from "@/components/usuarios/usuario-dialog";
import { ViewUsuarioDialog } from "./view-dialog";
import { HistoryUsuarioDialog } from "./history-dialog";
import { PermissionsDialog } from "./permissions-dialog";

export function UsuariosList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  
  const [selectedUsuarioForView, setSelectedUsuarioForView] = useState<Usuario | null>(null);
  const [selectedUsuarioForHistory, setSelectedUsuarioForHistory] = useState<Usuario | null>(null);
  const [selectedUsuarioForPermissions, setSelectedUsuarioForPermissions] = useState<Usuario | null>(null);
  
  const [isUsuarioDialogOpen, setIsUsuarioDialogOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const usuariosData = await getUsuarios();
      setUsuarios(usuariosData);
      setFilteredUsuarios(usuariosData);
    } catch (error) {
      toast({
        title: "Erro ao buscar dados",
        description: "Não foi possível carregar a lista de usuários.",
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
    return usuarios.reduce((acc, p) => {
        if (p.situacao === 'Ativo') {
            acc.ativos++;
        } else {
            acc.inativos++;
        }
        return acc;
    }, { ativos: 0, inativos: 0 });
  }, [usuarios]);

  useEffect(() => {
    const lowercasedQuery = searchTerm.toLowerCase();
    const filteredData = usuarios.filter((item) => {
      return (
        item.nome.toLowerCase().includes(lowercasedQuery) ||
        item.cpf.includes(searchTerm) ||
        item.usuario.toLowerCase().includes(lowercasedQuery)
      );
    });
    setFilteredUsuarios(filteredData);
  }, [searchTerm, usuarios]);

  const handleSuccess = () => {
    fetchData();
    setSelectedUsuario(null);
  };

  const handleAddNew = () => {
    setSelectedUsuario(null);
    setIsUsuarioDialogOpen(true);
  };

  const handleEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setIsUsuarioDialogOpen(true);
  };

  const handleDelete = (usuario: Usuario) => {
    setUsuarioToDelete(usuario);
  };

  const handleDeleteConfirm = async () => {
    if (usuarioToDelete) {
      try {
        await deleteUsuario(usuarioToDelete.id);
        fetchData();
        toast({
          title: "Usuário Excluído!",
          description: `O usuário ${usuarioToDelete.nome} foi removido do sistema.`,
        });
      } catch (error) {
         toast({
          title: "Erro ao excluir usuário",
          description: "Não foi possível remover o usuário.",
          variant: "destructive",
        });
      } finally {
        setUsuarioToDelete(null);
      }
    }
  };


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Lista de Usuários</CardTitle>
              <CardDescription>Visualize e gerencie os usuários do sistema.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full max-w-md min-w-[350px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, CPF ou usuário..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Usuário
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
                <TableHead className="px-2 py-2 text-xs">CPF</TableHead>
                <TableHead className="px-2 py-2 text-xs">Usuário</TableHead>
                <TableHead className="px-2 py-2 text-xs">Situação</TableHead>
                <TableHead className="text-right px-2 py-2 text-xs">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
               {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(6)].map((_, j) => (
                      <TableCell key={j} className="px-2 py-1 text-xs">
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredUsuarios.length > 0 ? (
                filteredUsuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-mono px-2 py-1 text-xs">
                      <Badge variant="outline">{usuario.codigo}</Badge>
                    </TableCell>
                    <TableCell className="font-medium px-2 py-1 text-xs">
                      {usuario.nome}
                    </TableCell>
                    <TableCell className="px-2 py-1 text-xs">{usuario.cpf}</TableCell>
                    <TableCell className="px-2 py-1 text-xs">{usuario.usuario}</TableCell>
                    <TableCell className="px-2 py-1 text-xs">
                      <Badge variant={usuario.situacao === 'Ativo' ? "default" : "destructive"} className={usuario.situacao === 'Ativo' ? 'bg-green-500 hover:bg-green-600 text-xs' : 'text-xs'}>
                        {usuario.situacao}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-2 py-1">
                      <div className="flex items-center justify-end gap-1">
                         <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedUsuarioForView(usuario)}>
                            <Eye className="h-3 w-3" />
                            <span className="sr-only">Visualizar</span>
                        </Button>
                         <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(usuario)}>
                            <Pencil className="h-3 w-3" />
                            <span className="sr-only">Editar</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedUsuarioForHistory(usuario)}>
                            <History className="h-3 w-3" />
                            <span className="sr-only">Histórico</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedUsuarioForPermissions(usuario)}>
                            <Lock className="h-3 w-3" />
                            <span className="sr-only">Permissões</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => handleDelete(usuario)}>
                            <Trash2 className="h-3 w-3" />
                            <span className="sr-only">Excluir</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                    Nenhum usuário cadastrado.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
         <CardFooter className="py-3 px-6 border-t flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
                Exibindo <strong>{filteredUsuarios.length}</strong> de <strong>{usuarios.length}</strong> {usuarios.length === 1 ? 'registro' : 'registros'}
            </div>
            <div className="flex items-center gap-4 text-xs">
                <span className="text-green-600 font-medium">Ativos: <strong>{statusCounts.ativos}</strong></span>
                <span className="text-red-600 font-medium">Inativos: <strong>{statusCounts.inativos}</strong></span>
            </div>
        </CardFooter>
      </Card>
      
      <UsuarioDialog
          isOpen={isUsuarioDialogOpen}
          onOpenChange={setIsUsuarioDialogOpen}
          onSuccess={handleSuccess}
          usuario={selectedUsuario}
        />

      {selectedUsuarioForView && (
          <ViewUsuarioDialog
            isOpen={!!selectedUsuarioForView}
            onOpenChange={(isOpen) => !isOpen && setSelectedUsuarioForView(null)}
            usuario={selectedUsuarioForView}
          />
      )}

      {selectedUsuarioForHistory && (
          <HistoryUsuarioDialog
            isOpen={!!selectedUsuarioForHistory}
            onOpenChange={(isOpen) => !isOpen && setSelectedUsuarioForHistory(null)}
            usuario={selectedUsuarioForHistory}
          />
      )}
      
      {selectedUsuarioForPermissions && (
          <PermissionsDialog
            isOpen={!!selectedUsuarioForPermissions}
            onOpenChange={(isOpen) => !isOpen && setSelectedUsuarioForPermissions(null)}
            usuario={selectedUsuarioForPermissions}
            onSuccess={fetchData}
          />
      )}

      {usuarioToDelete && (
          <DeleteUsuarioDialog
              isOpen={!!usuarioToDelete}
              onOpenChange={() => setUsuarioToDelete(null)}
              onConfirm={handleDeleteConfirm}
              usuarioName={usuarioToDelete?.nome || ''}
          />
      )}
    </>
  );
}
