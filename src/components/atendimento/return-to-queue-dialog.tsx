
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
import { Undo2, Loader2, Building, User, ShieldQuestion } from "lucide-react";
import type { FilaDeEsperaItem } from "@/types/fila";
import type { Departamento } from "@/types/departamento";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "../ui/card";
import { NotificationType } from "../ui/notification-dialog";

interface Profissional {
  id: string;
  nome: string;
}

interface ReturnToQueueDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  item: FilaDeEsperaItem | null;
  departamentos: Departamento[];
  profissionais: Profissional[];
  onConfirm: (item: FilaDeEsperaItem, updates: Partial<FilaDeEsperaItem>) => Promise<void>;
  onNotification: (notification: { type: NotificationType; title: string; message: string; }) => void;
}

const classificationOrder: FilaDeEsperaItem['classificacao'][] = ["Normal", "Preferencial", "Urgência", "Outros"];

export function ReturnToQueueDialog({ isOpen, onOpenChange, item, departamentos, profissionais, onConfirm, onNotification }: ReturnToQueueDialogProps) {
    const [selectedDepartamentoId, setSelectedDepartamentoId] = useState("");
    const [selectedProfissionalId, setSelectedProfissionalId] = useState("");
    const [classification, setClassification] = useState<FilaDeEsperaItem['classificacao']>('Normal');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (item) {
            setSelectedDepartamentoId(item.departamentoId);
            setSelectedProfissionalId(item.profissionalId);
            setClassification(item.classificacao || 'Normal');
        }
    }, [item]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === ' ') {
                event.preventDefault(); 
                onOpenChange(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onOpenChange]);

    const handleConfirm = async () => {
        if (!item || !selectedDepartamentoId || !selectedProfissionalId) {
            onNotification({
                type: "error",
                title: "Campos inválidos",
                message: "Selecione um departamento e um profissional.",
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
            
            let prioridade: FilaDeEsperaItem['prioridade'];
            switch(classification) {
                case 'Preferencial': prioridade = 1; break;
                case 'Urgência': prioridade = 2; break;
                case 'Normal': prioridade = 3; break;
                case 'Outros': prioridade = 4; break;
                default: prioridade = 3;
            }

            const updates: Partial<FilaDeEsperaItem> = {
                departamentoId: selectedDepto.id,
                departamentoNome: selectedDepto.nome,
                departamentoNumero: selectedDepto.numero,
                profissionalId: selectedProf.id,
                profissionalNome: selectedProf.nome,
                classificacao: classification,
                prioridade: prioridade,
            };
            
            await onConfirm(item, updates);

        } catch (error) {
            onNotification({
                type: "error",
                title: "Erro ao retornar",
                message: (error as Error).message,
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
            <Undo2 className="h-5 w-5" />
            Retornar Paciente para a Fila
          </DialogTitle>
          <DialogDescription>
            Edite o departamento ou profissional, se necessário, e confirme para retornar <span className="font-semibold text-primary">{item.pacienteNome}</span> para a fila.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
            <Card>
                <CardContent className="p-4 space-y-4">
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
                        <Select value={classification} onValueChange={(value) => setClassification(value as FilaDeEsperaItem['classificacao'])}>
                            <SelectTrigger id="classification">
                                <SelectValue placeholder="Selecione a classificação" />
                            </SelectTrigger>
                            <SelectContent>
                                {classificationOrder.map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        </div>

        <DialogFooter className="sm:justify-end">
           <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar e Retornar à Fila
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
