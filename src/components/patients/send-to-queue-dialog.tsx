

"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Send, Building, User, Tag, IdCard, VenetianMask, Cake, BadgeInfo, ShieldQuestion } from "lucide-react"
import type { Paciente } from "@/types/paciente"
import type { Departamento } from "@/types/departamento"
import { useToast } from "@/hooks/use-toast"
import { addPacienteToFila } from "@/services/filaDeEsperaService"
import { getMedicos } from "@/services/medicosService"
import { getEnfermeiros } from "@/services/enfermeirosService"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Badge } from "../ui/badge"
import { Card, CardContent } from "../ui/card"
import { Separator } from "../ui/separator"
import type { FilaDeEsperaItem } from "@/types/fila"
import { getNextCounter } from "@/services/countersService"

interface Profissional {
  id: string;
  nome: string;
}
interface EnviarParaFilaDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  paciente: Paciente | null
  departamentos: Departamento[]
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

export function EnviarParaFilaDialog({ isOpen, onOpenChange, paciente, departamentos }: EnviarParaFilaDialogProps) {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDepartamentoId, setSelectedDepartamentoId] = useState<string>("")
  const [selectedProfissionalId, setSelectedProfissionalId] = useState<string>("")
  const [classification, setClassification] = useState<'Normal' | 'Emergência'>('Normal');
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const selectedDepartamento = departamentos.find(d => d.id === selectedDepartamentoId);
  

  useEffect(() => {
    const fetchProfissionais = async () => {
      setIsLoading(true);
      try {
        const [medicosData, enfermeirosData] = await Promise.all([getMedicos(), getEnfermeiros()]);
        const medicosList = medicosData.map(m => ({ id: m.id, nome: `Dr(a). ${m.nome}` }));
        const enfermeirosList = enfermeirosData.map(e => ({ id: e.id, nome: `Enf. ${e.nome}` }));
        setProfissionais([...medicosList, ...enfermeirosList].sort((a,b) => a.nome.localeCompare(b.nome)));
      } catch (error) {
         toast({
          title: "Erro ao carregar profissionais",
          description: "Não foi possível carregar a lista de médicos e enfermeiros.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isOpen) {
      fetchProfissionais();
    }
  }, [isOpen, toast]);

  const handleSubmit = async () => {
    if (!selectedDepartamentoId || !paciente || !selectedProfissionalId) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, selecione departamento e profissional.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const counterName = classification === 'Emergência' ? 'senha_emergencia' : 'senha_normal';
      const ticketNumber = await getNextCounter(counterName);
      const ticketPrefix = classification === 'Emergência' ? 'E' : 'N';
      const ticket = `${ticketPrefix}-${String(ticketNumber).padStart(3, '0')}`;

      const departamento = departamentos.find(d => d.id === selectedDepartamentoId)
      if (!departamento) throw new Error("Departamento não encontrado")

      const profissional = profissionais.find(p => p.id === selectedProfissionalId);
      if (!profissional) throw new Error("Profissional não encontrado");

      const newItem: Omit<FilaDeEsperaItem, 'id' | 'chegadaEm' | 'chamadaEm' | 'finalizadaEm' | 'prioridade'> = {
        pacienteId: paciente.id,
        pacienteNome: paciente.nome,
        departamentoId: departamento.id,
        departamentoNome: departamento.nome,
        departamentoNumero: departamento.numero,
        profissionalId: profissional.id,
        profissionalNome: profissional.nome,
        senha: ticket,
        status: "aguardando",
        classificacao: classification,
      }
      
      await addPacienteToFila(newItem)

      toast({
        title: "Paciente Enviado!",
        description: `${paciente.nome} foi enviado para a fila de ${departamento.nome}.`,
        className: "bg-green-500 text-white",
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao enviar paciente para a fila:", error)
      toast({
        title: "Erro ao enviar para a fila",
        description: (error as Error).message || "Não foi possível adicionar o paciente à fila. Tente novamente.",
        variant: "destructive",
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
        setClassification('Normal');
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2">
                        <InfoRow icon={BadgeInfo} label="CNS" value={paciente.cns} />
                        <InfoRow icon={VenetianMask} label="Sexo" value={paciente.sexo} />
                        <InfoRow icon={Cake} label="Idade" value={paciente.idade} />
                    </div>
                </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                 <div className="space-y-2 text-center">
                    <Label htmlFor="senha" className="flex items-center justify-center gap-2 text-muted-foreground"><Tag className="h-4 w-4" />Senha Gerada</Label>
                    <Input id="senha" readOnly className="font-bold text-2xl bg-transparent border-none text-center h-auto p-0 tracking-wider" placeholder="Será gerada ao confirmar" />
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
