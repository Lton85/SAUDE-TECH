"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Send, Building, User, Tag } from "lucide-react"
import type { Paciente } from "@/types/paciente"
import type { Departamento } from "@/types/departamento"
import { useToast } from "@/hooks/use-toast"
import { addPacienteToFila } from "@/services/filaDeEsperaService"
import { getMedicos } from "@/services/medicosService"
import { getEnfermeiros } from "@/services/enfermeirosService"
import type { Medico } from "@/types/medico"
import type { Enfermeiro } from "@/types/enfermeiro"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

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

export function EnviarParaFilaDialog({ isOpen, onOpenChange, paciente, departamentos }: EnviarParaFilaDialogProps) {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDepartamentoId, setSelectedDepartamentoId] = useState<string>("")
  const [selectedProfissionalId, setSelectedProfissionalId] = useState<string>("")
  const [ticket, setTicket] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

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
      const ticketPrefix = ['C', 'P'][Math.floor(Math.random() * 2)];
      const ticketNumber = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
      setTicket(`${ticketPrefix}-${ticketNumber}`);
    }
  }, [isOpen, toast]);

  const handleSubmit = async () => {
    if (!selectedDepartamentoId || !paciente || !selectedProfissionalId || !ticket) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, selecione departamento, profissional e verifique a senha.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const departamento = departamentos.find(d => d.id === selectedDepartamentoId)
      if (!departamento) throw new Error("Departamento não encontrado")

      const profissional = profissionais.find(p => p.id === selectedProfissionalId);
      if (!profissional) throw new Error("Profissional não encontrado");

      await addPacienteToFila({
        pacienteId: paciente.id,
        pacienteNome: paciente.nome,
        departamentoId: departamento.id,
        departamentoNome: departamento.nome,
        profissionalId: profissional.id,
        profissionalNome: profissional.nome,
        senha: ticket,
        chegadaEm: new Date(),
        status: "aguardando",
      })

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
      setTicket("");
    }
  }
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
        setSelectedDepartamentoId("");
        setSelectedProfissionalId("");
        setTicket("");
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
            Encaminhe o paciente <span className="font-bold text-primary">{paciente.nome}</span> para o departamento e profissional desejado.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="departamento" className="flex items-center gap-2 text-muted-foreground"><Building className="h-4 w-4" />Departamento</Label>
              <Select value={selectedDepartamentoId} onValueChange={setSelectedDepartamentoId}>
                <SelectTrigger id="departamento">
                  <SelectValue placeholder="Selecione um departamento..." />
                </SelectTrigger>
                <SelectContent>
                  {departamentos.map((depto) => (
                    <SelectItem key={depto.id} value={depto.id}>
                      {depto.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="profissional" className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" />Profissional</Label>
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
             <div className="space-y-2">
              <Label htmlFor="senha" className="flex items-center gap-2 text-muted-foreground"><Tag className="h-4 w-4" />Senha</Label>
                <Input id="senha" value={ticket} readOnly className="font-bold text-lg bg-muted/50 text-center" />
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
