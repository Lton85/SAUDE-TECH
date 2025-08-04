"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Send } from "lucide-react"
import type { Paciente } from "@/types/paciente"
import type { Departamento } from "@/types/departamento"
import { useToast } from "@/hooks/use-toast"
import { addPacienteToFila } from "@/services/filaDeEsperaService"

interface EnviarParaFilaDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  paciente: Paciente | null
  departamentos: Departamento[]
}

export function EnviarParaFilaDialog({ isOpen, onOpenChange, paciente, departamentos }: EnviarParaFilaDialogProps) {
  const [selectedDepartamentoId, setSelectedDepartamentoId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!selectedDepartamentoId || !paciente) {
      toast({
        title: "Seleção necessária",
        description: "Por favor, selecione um departamento.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const departamento = departamentos.find(d => d.id === selectedDepartamentoId)
      if (!departamento) throw new Error("Departamento não encontrado")

      await addPacienteToFila({
        pacienteId: paciente.id,
        pacienteNome: paciente.nome,
        departamentoId: departamento.id,
        departamentoNome: departamento.nome,
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
        description: "Não foi possível adicionar o paciente à fila. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setSelectedDepartamentoId("");
    }
  }
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
        setSelectedDepartamentoId("");
    }
    onOpenChange(open);
  }

  if (!paciente) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send />
            Enviar para Fila de Atendimento
          </DialogTitle>
          <DialogDescription>
            Selecione o departamento para onde o paciente <span className="font-bold text-primary">{paciente.nome}</span> será encaminhado.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select value={selectedDepartamentoId} onValueChange={setSelectedDepartamentoId}>
            <SelectTrigger>
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
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !selectedDepartamentoId}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Envio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
