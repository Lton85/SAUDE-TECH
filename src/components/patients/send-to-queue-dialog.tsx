
"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Send, Building, User, Tag, IdCard, VenetianMask, Cake, BadgeInfo, ShieldQuestion } from "lucide-react"
import type { Paciente } from "@/types/paciente"
import type { Departamento } from "@/types/departamento"
import { addPacienteToFila } from "@/services/filaDeEsperaService"
import { getProfissionais } from "@/services/profissionaisService"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Badge } from "../ui/badge"
import { Card, CardContent } from "../ui/card"
import { Separator } from "../ui/separator"
import type { FilaDeEsperaItem } from "@/types/fila"
import { getNextCounter } from "@/services/countersService"
import { NotificationType } from "../ui/notification-dialog"
import type { Classificacao } from "@/types/empresa";

interface Profissional {
  id: string;
  nome: string;
}
interface EnviarParaFilaDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  paciente: Paciente | null
  departamentos: Departamento[]
  classificacoes: Classificacao[];
  onNotification: (notification: { type: NotificationType; title: string; message: string; }) => void;
}

const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | undefined }) => {
    if(!value) return null;
    return (
        <div className="flex items-center gap-2 text-sm">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{label}:</span>
            <span className="font-semibold text-card-foreground">{value}</span>
        </div>
    );
}

export function EnviarParaFilaDialog({ isOpen, onOpenChange, paciente, departamentos, classificacoes, onNotification }: EnviarParaFilaDialogProps) {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDepartamentoId, setSelectedDepartamentoId] = useState<string>("")
  const [selectedProfissionalId, setSelectedProfissionalId] = useState<string>("")
  const [classificationId, setClassificationId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [senha, setSenha] = useState("");

  const selectedDepartamento = departamentos.find(d => d.id === selectedDepartamentoId);
  
  useEffect(() => {
    const fetchProfissionais = async () => {
      setIsLoading(true);
      try {
        const profissionaisData = await getProfissionais();
        const profissionaisList = profissionaisData.map(m => ({ id: m.id, nome: `Dr(a). ${m.nome}` }));
        setProfissionais([...profissionaisList].sort((a,b) => a.nome.localeCompare(b.nome)));
      } catch (error) {
         onNotification({
          type: "error",
          title: "Erro ao carregar profissionais",
          message: "Não foi possível carregar a lista de profissionais.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isOpen) {
      if (classificacoes.length > 0) {
        setClassificationId(classificacoes[0].id);
      }
      fetchProfissionais();
    }
  }, [isOpen, onNotification, classificacoes]);
  
  const generateTicketPreview = useCallback(async (currentClassificationId: string) => {
    if (paciente && isOpen) {
        try {
            const classificacao = classificacoes.find(c => c.id === currentClassificationId);
            if (!classificacao) {
                setSenha("Erro");
                throw new Error("Classificação não encontrada.");
            }
            const counterName = `senha_${classificacao.id.toLowerCase()}`;
            const ticketPrefix = classificacao.nome.charAt(0).toUpperCase();

            setSenha("Gerando...");
            const ticketNumber = await getNextCounter(counterName, false); // false = peek next number
            const ticket = `${ticketPrefix}-${String(ticketNumber).padStart(2, '0')}`;
            setSenha(ticket);
        } catch (error) {
            console.error("Erro ao gerar senha:", error);
            setSenha("Erro");
            onNotification({ type: "error", title: "Erro ao pré-visualizar senha", message: (error as Error).message });
        }
    } else {
        setSenha("");
    }
  }, [paciente, isOpen, classificacoes, onNotification]);


  useEffect(() => {
    if (paciente && isOpen) {
        generateTicketPreview(classificationId);
    }
  }, [paciente, isOpen, classificationId, generateTicketPreview]);

  const handleSubmit = async () => {
    if (!selectedDepartamentoId || !paciente || !selectedProfissionalId) {
      onNotification({
        type: "error",
        title: "Campos obrigatórios",
        message: "Por favor, selecione departamento e profissional.",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const newItem: Omit<FilaDeEsperaItem, 'id' | 'chegadaEm' | 'chamadaEm' | 'finalizadaEm' | 'canceladaEm' | 'prioridade'> = {
        pacienteId: paciente.id,
        pacienteNome: paciente.nome,
        departamentoId: selectedDepartamentoId,
        departamentoNome: selectedDepartamento?.nome || '',
        departamentoNumero: selectedDepartamento?.numero,
        profissionalId: selectedProfissionalId,
        profissionalNome: profissionais.find(p => p.id === selectedProfissionalId)?.nome || '',
        senha: senha,
        status: "aguardando",
        classificacao: classificationId,
      }
      
      await addPacienteToFila(newItem)

      onNotification({
        type: "success",
        title: "Paciente Enviado!",
        message: `${paciente.nome} foi enviado para a fila de ${selectedDepartamento?.nome}.`,
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao enviar paciente para a fila:", error)
      onNotification({
        type: "error",
        title: "Erro ao enviar para a fila",
        message: (error as Error).message || "Não foi possível adicionar o paciente à fila. Tente novamente.",
      })
    } finally {
      setIsSubmitting(false)
      setSelectedDepartamentoId("");
      setSelectedProfissionalId("");
    }
  }
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
        setSelectedDepartamentoId("");
        setSelectedProfissionalId("");
        if (classificacoes.length > 0) {
            setClassificationId(classificacoes[0].id);
        }
        setSenha("");
    }
    onOpenChange(open);
  }

  if (!paciente) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Send />
            Enviar para Fila de Atendimento
          </DialogTitle>
          <DialogDescription>
            Encaminhe o paciente para o departamento e profissional desejado.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
            <Card className="bg-muted/30">
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <Label htmlFor="paciente" className="text-muted-foreground">Paciente</Label>
                            <p id="paciente" className="font-semibold text-lg text-card-foreground">{paciente.nome}</p>
                        </div>
                         <div className="flex items-center gap-2">
                            <IdCard className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="outline">{paciente.codigo}</Badge>
                         </div>
                    </div>
                    <Separator/>
                    <div className="grid grid-cols-5 gap-x-4 gap-y-2">
                        <div className="col-span-3"><InfoRow icon={BadgeInfo} label="CNS" value={paciente.cns} /></div>
                        <div className="col-span-2"><InfoRow icon={Cake} label="Idade" value={paciente.idade} /></div>
                    </div>
                </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="classification" className="flex items-center gap-2"><ShieldQuestion className="h-4 w-4" />Classificação</Label>
                    <Select value={classificationId} onValueChange={setClassificationId}>
                        <SelectTrigger id="classification">
                            <SelectValue placeholder="Selecione a classificação" />
                        </SelectTrigger>
                        <SelectContent>
                            {classificacoes.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2 text-center">
                    <Label htmlFor="senha" className="flex items-center justify-center gap-2 text-muted-foreground"><Tag className="h-4 w-4" />Senha Gerada</Label>
                    <Input id="senha" value={senha} readOnly className="font-bold text-2xl bg-transparent border-none text-center h-auto p-0 tracking-wider" placeholder="" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departamento" className="flex items-center gap-2"><Building className="h-4 w-4" />Departamento</Label>
                  <Select value={selectedDepartamentoId} onValueChange={setSelectedDepartamentoId}>
                    <SelectTrigger id="departamento">
                      <SelectValue placeholder="Selecione um departamento...">
                        {selectedDepartamento ? `${selectedDepartamento.nome}${selectedDepartamento.numero ? ` (Sala: ${selectedDepartamento.numero})` : ''}` : 'Selecione um departamento...'}
                      </SelectValue>
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
                  <Select value={selectedProfissionalId} onValueChange={setSelectedProfissionalId} disabled={isLoading}>
                    <SelectTrigger id="profissional">
                      <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione um profissional..."} />
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
            </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !selectedDepartamentoId || !selectedProfissionalId}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Envio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
