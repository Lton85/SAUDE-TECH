
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Pencil, Loader2, Building, User, Tag, ShieldQuestion } from "lucide-react";
import type { FilaDeEsperaItem } from "@/types/fila";
import type { Departamento } from "@/types/departamento";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Input } from "../ui/input";

interface Profissional {
  id: string;
  nome: string;
}

interface EditQueueItemDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  item: FilaDeEsperaItem | null;
  departamentos: Departamento[];
  profissionais: Profissional[];
  onSave: (id: string, data: Partial<FilaDeEsperaItem>) => Promise<void>;
  isHistory?: boolean;
}

export function EditQueueItemDialog({ isOpen, onOpenChange, item, departamentos, profissionais, onSave, isHistory = false }: EditQueueItemDialogProps) {
    const [selectedDepartamentoId, setSelectedDepartamentoId] = useState("");
    const [selectedProfissionalId, setSelectedProfissionalId] = useState("");
    const [classification, setClassification] = useState<'Normal' | 'Emergência'>('Normal');
    const [senha, setSenha] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (item) {
            setSelectedDepartamentoId(item.departamentoId);
            setSelectedProfissionalId(item.profissionalId);
            setSenha(item.senha);
            setClassification(item.classificacao || 'Normal');
        }
    }, [item]);

    const handleSave = async () => {
        if (!item || !selectedDepartamentoId || !selectedProfissionalId || !senha) {
            toast({
                title: "Campos inválidos",
                description: "Selecione um departamento, um profissional e preencha a senha.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const selectedDepto = departamentos.find(d => d.id === selectedDepartamentoId);
            const selectedProf = profissionais.find(p => p.id === selectedProfissionalId);

            if (!selectedDepto || !selectedProf) {
                throw new Error("Departamento ou profissional não encontrado.");
            }

            const updatedData: Partial<FilaDeEsperaItem> = {
                departamentoId: selectedDepto.id,
                departamentoNome: selectedDepto.nome,
                departamentoNumero: selectedDepto.numero,
                profissionalId: selectedProf.id,
                profissionalNome: selectedProf.nome,
                senha: senha,
                classificacao: classification,
            };
            
            await onSave(item.id, updatedData);
            
            toast({
                title: "Atendimento Atualizado!",
                description: `O atendimento de ${item.pacienteNome} foi atualizado.`,
                className: "bg-green-500 text-white"
            });
            onOpenChange(false);
        } catch (error) {
            toast({
                title: "Erro ao atualizar",
                description: (error as Error).message,
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };


  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Editar Atendimento
          </DialogTitle>
          <DialogDescription>
            {isHistory ? "Altere as informações do registro de atendimento finalizado." : `Altere as informações para o atendimento de ${item.pacienteNome}.`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
             <div className="space-y-2">
                 <Label htmlFor="senha" className="flex items-center gap-2"><Tag className="h-4 w-4" />Senha</Label>
                 <Input id="senha" value={senha} onChange={(e) => setSenha(e.target.value.toUpperCase())} />
            </div>
             <div className="space-y-2">
                  <Label htmlFor="departamento" className="flex items-center gap-2"><Building className="h-4 w-4" />Departamento</Label>
                  <Select value={selectedDepartamentoId} onValueChange={setSelectedDepartamentoId}>
                    <SelectTrigger id="departamento">
                      <SelectValue placeholder="Selecione o departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {departamentos.map((depto) => (
                        <SelectItem key={depto.id} value={depto.id}>
                          {depto.nome}{depto.numero ? ` (Sala: ${depto.numero})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="profissional" className="flex items-center gap-2"><User className="h-4 w-4" />Profissional</Label>
                <Select value={selectedProfissionalId} onValueChange={setSelectedProfissionalId}>
                    <SelectTrigger id="profissional">
                    <SelectValue placeholder="Selecione o profissional" />
                    </SelectTrigger>
                    <SelectContent>
                    {profissionais.map((prof) => (
                        <SelectItem key={prof.id} value={prof.id}>
                        {prof.nome}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="classification" className="flex items-center gap-2"><ShieldQuestion className="h-4 w-4" />Classificação</Label>
                <Select value={classification} onValueChange={(value) => setClassification(value as 'Normal' | 'Emergência')}>
                    <SelectTrigger id="classification">
                        <SelectValue placeholder="Selecione a classificação" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="Emergência">Emergência</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <DialogFooter className="sm:justify-end">
           <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
