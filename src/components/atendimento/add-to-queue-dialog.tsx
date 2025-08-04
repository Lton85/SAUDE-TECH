"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Loader2, Send, Building, User, Tag, ChevronsUpDown, Check } from "lucide-react"
import type { Paciente } from "@/types/paciente"
import type { Departamento } from "@/types/departamento"
import { useToast } from "@/hooks/use-toast"
import { addPacienteToFila } from "@/services/filaDeEsperaService"
import { getMedicos } from "@/services/medicosService"
import { getEnfermeiros } from "@/services/enfermeirosService"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { cn } from "@/lib/utils"

interface Profissional {
  id: string;
  nome: string;
}
interface AddToQueueDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  pacientes: Paciente[]
  departamentos: Departamento[]
}

export function AddToQueueDialog({ isOpen, onOpenChange, pacientes, departamentos }: AddToQueueDialogProps) {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [isLoadingProfissionais, setIsLoadingProfissionais] = useState(true);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null)
  const [selectedDepartamentoId, setSelectedDepartamentoId] = useState<string>("")
  const [selectedProfissionalId, setSelectedProfissionalId] = useState<string>("")
  const [ticket, setTicket] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPatientPopoverOpen, setIsPatientPopoverOpen] = useState(false)
  const { toast } = useToast()

  const selectedDepartamento = useMemo(() => departamentos.find(d => d.id === selectedDepartamentoId), [departamentos, selectedDepartamentoId]);

  useEffect(() => {
    const fetchProfissionais = async () => {
      setIsLoadingProfissionais(true);
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
        setIsLoadingProfissionais(false);
      }
    };
    
    if (isOpen) {
      fetchProfissionais();
    }
  }, [isOpen, toast]);

  useEffect(() => {
    if (selectedPaciente) {
        const ticketPrefix = ['C', 'P'][Math.floor(Math.random() * 2)];
        const ticketNumber = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
        setTicket(`${ticketPrefix}-${ticketNumber}`);
    } else {
        setTicket("");
    }
  }, [selectedPaciente]);


  const resetState = () => {
    setSelectedPaciente(null);
    setSelectedDepartamentoId("");
    setSelectedProfissionalId("");
    setTicket("");
    setIsSubmitting(false);
  }

  const handleSubmit = async () => {
    if (!selectedDepartamentoId || !selectedPaciente || !selectedProfissionalId || !ticket) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, selecione paciente, departamento, profissional e verifique a senha.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (!selectedDepartamento) throw new Error("Departamento não encontrado")

      const profissional = profissionais.find(p => p.id === selectedProfissionalId);
      if (!profissional) throw new Error("Profissional não encontrado");

      await addPacienteToFila({
        pacienteId: selectedPaciente.id,
        pacienteNome: selectedPaciente.nome,
        departamentoId: selectedDepartamento.id,
        departamentoNome: selectedDepartamento.nome,
        profissionalId: profissional.id,
        profissionalNome: profissional.nome,
        senha: ticket,
        chegadaEm: new Date(),
        status: "aguardando",
      })

      toast({
        title: "Paciente Enviado!",
        description: `${selectedPaciente.nome} foi enviado para a fila de ${selectedDepartamento.nome}.`,
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
    }
  }
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
       resetState();
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Send />
            Adicionar Paciente à Fila
          </DialogTitle>
          <DialogDescription>
            Selecione o paciente e para qual departamento e profissional ele será encaminhado.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
            <div className="space-y-2">
                <Label htmlFor="paciente" className="flex items-center gap-2"><User className="h-4 w-4" />Paciente</Label>
                <Popover open={isPatientPopoverOpen} onOpenChange={setIsPatientPopoverOpen}>
                    <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isPatientPopoverOpen}
                        className="w-full justify-between font-normal"
                    >
                        {selectedPaciente
                        ? selectedPaciente.nome
                        : "Selecione um paciente..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[450px] p-0">
                    <Command>
                        <CommandInput placeholder="Buscar paciente por nome, CPF ou CNS..." />
                        <CommandEmpty>Nenhum paciente encontrado.</CommandEmpty>
                        <CommandList>
                        <CommandGroup>
                            {pacientes.map((paciente) => (
                            <CommandItem
                                key={paciente.id}
                                className="cursor-pointer"
                                onSelect={() => {
                                    setSelectedPaciente(paciente)
                                    setIsPatientPopoverOpen(false)
                                }}
                            >
                                <Check
                                    className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedPaciente?.id === paciente.id ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                <div>
                                    <span>{paciente.nome}</span>
                                    <span className="text-xs text-muted-foreground block">CNS: {paciente.cns}</span>
                                </div>
                            </CommandItem>
                            ))}
                        </CommandGroup>
                        </CommandList>
                    </Command>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departamento" className="flex items-center gap-2"><Building className="h-4 w-4" />Departamento</Label>
                  <Select value={selectedDepartamentoId} onValueChange={setSelectedDepartamentoId} disabled={!selectedPaciente}>
                    <SelectTrigger id="departamento">
                      <SelectValue placeholder={!selectedPaciente ? "Selecione um paciente" : "Selecione o departamento"}>
                        {selectedDepartamento ? `${selectedDepartamento.nome}${selectedDepartamento.numero ? ` (Sala: ${selectedDepartamento.numero})` : ''}` : (!selectedPaciente ? "Selecione um paciente" : "Selecione o departamento")}
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
                  <Select value={selectedProfissionalId} onValueChange={setSelectedProfissionalId} disabled={isLoadingProfissionais || !selectedPaciente}>
                    <SelectTrigger id="profissional">
                      <SelectValue placeholder={!selectedPaciente ? "Selecione um paciente" : (isLoadingProfissionais ? "Carregando..." : "Selecione o profissional")} />
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

             <div className={cn("space-y-2 text-center transition-opacity duration-300", selectedPaciente ? "opacity-100" : "opacity-0")}>
                <Label htmlFor="senha" className="flex items-center justify-center gap-2 text-muted-foreground"><Tag className="h-4 w-4" />Senha Gerada</Label>
                <Input id="senha" value={ticket} readOnly className="font-bold text-2xl bg-transparent border-none text-center h-auto p-0 tracking-wider" />
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !selectedPaciente || !selectedDepartamentoId || !selectedProfissionalId}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Envio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
