

"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Send, Building, User, Tag, Search, X, UserPlus, ShieldQuestion } from "lucide-react"
import type { Paciente } from "@/types/paciente"
import type { Departamento } from "@/types/departamento"
import { useToast } from "@/hooks/use-toast"
import { addPacienteToFila } from "@/services/filaDeEsperaService"
import { getMedicos } from "@/services/medicosService"
import { getEnfermeiros } from "@/services/enfermeirosService"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getNextCounter } from "@/services/countersService"
import type { FilaDeEsperaItem } from "@/types/fila"

interface Profissional {
  id: string;
  nome: string;
}
interface AddToQueueDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  pacientes: Paciente[]
  departamentos: Departamento[]
  onAddNewPatient: () => void;
  patientToAdd?: Paciente | null;
}

export function AddToQueueDialog({ isOpen, onOpenChange, pacientes, departamentos, onAddNewPatient, patientToAdd }: AddToQueueDialogProps) {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [isLoadingProfissionais, setIsLoadingProfissionais] = useState(true);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null)
  const [selectedDepartamentoId, setSelectedDepartamentoId] = useState<string>("")
  const [selectedProfissionalId, setSelectedProfissionalId] = useState<string>("")
  const [classification, setClassification] = useState<'Normal' | 'Emergência'>('Normal');
  const [ticket, setTicket] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showPatientList, setShowPatientList] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<(HTMLButtonElement | null)[]>([]);
  
  const { toast } = useToast()

  const selectedDepartamento = useMemo(() => departamentos.find(d => d.id === selectedDepartamentoId), [departamentos, selectedDepartamentoId]);

  const filteredPacientes = useMemo(() => {
    if (!searchQuery) return [];
    return pacientes.filter(p => 
      p.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.cpf && p.cpf.includes(searchQuery)) ||
      (p.cns && p.cns.includes(searchQuery))
    );
  }, [searchQuery, pacientes]);

  const generateTicket = useCallback(async (classificationType: 'Normal' | 'Emergência') => {
      try {
        const counterName = classificationType === 'Emergência' ? 'senha_emergencia' : 'senha_normal';
        const ticketNumber = await getNextCounter(counterName);
        const ticketPrefix = classificationType === 'Emergência' ? 'E' : 'N';
        const formattedTicket = `${ticketPrefix}-${String(ticketNumber).padStart(3, '0')}`;
        setTicket(formattedTicket);
      } catch (error) {
        toast({
          title: "Erro ao gerar senha",
          description: "Não foi possível obter a próxima senha sequencial.",
          variant: "destructive",
        });
        setTicket(""); // Clear ticket on error
      }
  }, [toast]);
  

  const resetState = () => {
    setSelectedPaciente(null);
    setSelectedDepartamentoId("");
    setSelectedProfissionalId("");
    setClassification('Normal');
    setTicket("");
    setIsSubmitting(false);
    setSearchQuery("");
    setShowPatientList(false);
    setHighlightedIndex(-1);
  }

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
      if (patientToAdd) {
        handleSelectPatient(patientToAdd);
      }
    }
  }, [isOpen, toast, patientToAdd]);

  useEffect(() => {
    if (selectedPaciente && isOpen) {
        generateTicket(classification);
    } else if (!selectedPaciente) {
        setTicket("");
    }
  }, [selectedPaciente, classification, isOpen, generateTicket]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowPatientList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (highlightedIndex >= 0 && resultsRef.current[highlightedIndex]) {
      resultsRef.current[highlightedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [highlightedIndex]);

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
        departamentoNumero: selectedDepartamento.numero,
        profissionalId: profissional.id,
        profissionalNome: profissional.nome,
        senha: ticket,
        status: "aguardando",
        classificacao: classification,
      })

      toast({
        title: "Paciente Enviado!",
        description: `${selectedPaciente.nome} foi enviado para a fila de ${selectedDepartamento.nome}.`,
        className: "bg-green-500 text-white",
      })
      
      resetState();
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

  const handleSelectPatient = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setSearchQuery(paciente.nome);
    setShowPatientList(false);
    setHighlightedIndex(-1);
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showPatientList && filteredPacientes.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % filteredPacientes.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev - 1 + filteredPacientes.length) % filteredPacientes.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIndex !== -1) {
          handleSelectPatient(filteredPacientes[highlightedIndex]);
        }
      } else if (e.key === 'Escape') {
        setShowPatientList(false);
        setHighlightedIndex(-1);
      }
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
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
            <div className="space-y-2" ref={searchRef}>
              <Label htmlFor="paciente-search" className="flex items-center gap-2"><User className="h-4 w-4" />Paciente</Label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="paciente-search"
                    placeholder="Buscar paciente por nome, CPF ou CNS..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      if(e.target.value) {
                         setShowPatientList(true)
                         setHighlightedIndex(-1);
                      } else {
                         setShowPatientList(false)
                         setSelectedPaciente(null)
                      }
                    }}
                    onFocus={() => { if(searchQuery) setShowPatientList(true) }}
                    onKeyDown={handleKeyDown}
                    className="pl-10"
                  />
                  {searchQuery && (
                    <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => { setSearchQuery(''); setSelectedPaciente(null); setShowPatientList(false); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                 <Button onClick={onAddNewPatient}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Novo
                 </Button>
              </div>

              {showPatientList && filteredPacientes.length > 0 && (
                <div className="relative">
                  <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg">
                    <ScrollArea className="h-auto max-h-60">
                      <div className="p-1">
                        {filteredPacientes.map((paciente, index) => (
                          <Button
                            ref={el => resultsRef.current[index] = el}
                            key={paciente.id}
                            variant="ghost"
                            className={cn(
                                "w-full justify-start h-auto py-2 px-2 text-left",
                                highlightedIndex === index && "bg-accent"
                            )}
                            onClick={() => handleSelectPatient(paciente)}
                            onMouseEnter={() => setHighlightedIndex(index)}
                          >
                             <div>
                                <p className="font-semibold">{paciente.nome}</p>
                                <p className="text-xs text-muted-foreground">CNS: {paciente.cns}</p>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              )}
               {showPatientList && filteredPacientes.length === 0 && searchQuery && (
                 <div className="relative">
                  <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg p-4 text-center text-sm text-muted-foreground">
                    Nenhum paciente encontrado.
                  </div>
                </div>
               )}
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

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="classification" className="flex items-center gap-2"><ShieldQuestion className="h-4 w-4" />Classificação</Label>
                    <Select value={classification} onValueChange={(value) => setClassification(value as 'Normal' | 'Emergência')} disabled={!selectedPaciente}>
                        <SelectTrigger id="classification">
                            <SelectValue placeholder="Selecione a classificação" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Normal">Normal</SelectItem>
                            <SelectItem value="Emergência">Emergência</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className={cn("space-y-2 transition-opacity duration-300", selectedPaciente ? "opacity-100" : "opacity-0")}>
                    <Label htmlFor="senha" className="flex items-center gap-2"><Tag className="h-4 w-4" />Senha</Label>
                    <Input 
                    id="senha" 
                    value={ticket} 
                    readOnly
                    className="font-bold text-lg bg-muted/30"
                    disabled={!selectedPaciente}
                    placeholder="Gerando senha..."
                    />
                </div>
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !selectedPaciente || !selectedDepartamentoId || !selectedProfissionalId || !ticket}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Envio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

    
