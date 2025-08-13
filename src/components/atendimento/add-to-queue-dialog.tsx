
"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Send, Building, User, Tag, Search, X, UserPlus, ShieldQuestion, IdCard, VenetianMask, Cake, BadgeInfo, Home, Globe, Fingerprint } from "lucide-react"
import type { Paciente } from "@/types/paciente"
import type { Departamento } from "@/types/departamento"
import { addPacienteToFila } from "@/services/filaDeEsperaService"
import { getProfissionais } from "@/services/profissionaisService"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getNextCounter } from "@/services/countersService"
import { Card, CardContent } from "../ui/card"
import { Separator } from "../ui/separator"
import { Badge } from "../ui/badge"
import { FilaDeEsperaItem } from "@/types/fila"
import { NotificationType } from "../ui/notification-dialog"
import { Classificacao } from "@/types/empresa"

interface Profissional {
  id: string;
  nome: string;
}
interface AddToQueueDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  pacientes: Paciente[]
  departamentos: Departamento[]
  classificacoes: Classificacao[];
  onAddNewPatient: () => void;
  patientToAdd?: Paciente | null;
  atendimentoParaCompletar?: FilaDeEsperaItem | null;
  onSuccess: (message: string, description: string) => void;
}

const InfoRow = ({ icon: Icon, label, value, children, className }: { icon: React.ElementType, label: string, value?: string, children?: React.ReactNode, className?: string }) => {
    if (!value && !children) return null;
    return (
        <div className={cn("flex items-center gap-2 text-sm", className)}>
            <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">{label}:</span>
            {value && <span className="font-semibold text-card-foreground truncate">{value}</span>}
            {children}
        </div>
    );
}

export function AddToQueueDialog({ isOpen, onOpenChange, pacientes, departamentos, classificacoes, onAddNewPatient, patientToAdd, atendimentoParaCompletar, onSuccess }: AddToQueueDialogProps) {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [isLoadingProfissionais, setIsLoadingProfissionais] = useState(true);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null)
  const [selectedDepartamentoId, setSelectedDepartamentoId] = useState<string>("")
  const [selectedProfissionalId, setSelectedProfissionalId] = useState<string>("")
  const [classificationId, setClassificationId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [senha, setSenha] = useState("");
  const [notification, setNotification] = useState<{ type: NotificationType; title: string; message: string; } | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showPatientList, setShowPatientList] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<(HTMLButtonElement | null)[]>([]);
  
  const isCompleting = !!atendimentoParaCompletar;

  const selectedDepartamento = useMemo(() => departamentos.find(d => d.id === selectedDepartamentoId), [departamentos, selectedDepartamentoId]);

  const filteredPacientes = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase().trim();
    
    if (!lowercasedQuery) {
        return [];
    }

    // Check for specific filters like "rua " or "numero "
    if (lowercasedQuery.startsWith("rua ")) {
      const searchValue = lowercasedQuery.substring(4).trim();
      return pacientes.filter(p => p.endereco && p.endereco.toLowerCase().includes(searchValue));
    }

    if (lowercasedQuery.startsWith("numero ")) {
      const searchValue = lowercasedQuery.substring(7).trim();
      return pacientes.filter(p => p.numero && p.numero.toLowerCase().includes(searchValue));
    }
    
    // Default search across multiple fields
    return pacientes.filter(p => 
      p.nome.toLowerCase().includes(lowercasedQuery) ||
      (p.mae && p.mae.toLowerCase().includes(lowercasedQuery)) ||
      (p.endereco && p.endereco.toLowerCase().includes(lowercasedQuery)) ||
      (p.numero && p.numero.toLowerCase().includes(lowercasedQuery)) ||
      (p.cpf && p.cpf.includes(searchQuery)) ||
      (p.cns && p.cns.includes(searchQuery))
    );
  }, [searchQuery, pacientes]);

  const resetState = useCallback(() => {
    setSelectedPaciente(null);
    setSelectedDepartamentoId("");
    setSelectedProfissionalId("");
    setClassificationId(classificacoes.length > 0 ? classificacoes[0].id : "");
    setIsSubmitting(false);
    setSearchQuery("");
    setShowPatientList(false);
    setHighlightedIndex(-1);
    setSenha("");
  }, [classificacoes]);

  useEffect(() => {
    const fetchProfissionais = async () => {
      setIsLoadingProfissionais(true);
      try {
        const profissionaisData = await getProfissionais();
        const profissionaisList = profissionaisData.map(m => ({ id: m.id, nome: `Dr(a). ${m.nome}` }));
        setProfissionais([...profissionaisList].sort((a,b) => a.nome.localeCompare(b.nome)));
      } catch (error) {
         setNotification({
          type: "error",
          title: "Erro ao carregar profissionais",
          message: "Não foi possível carregar la lista de profissionais.",
        });
      } finally {
        setIsLoadingProfissionais(false);
      }
    };
    
    if (isOpen) {
      if (classificacoes.length > 0) {
        setClassificationId(classificacoes[0].id);
      }
      fetchProfissionais();
      if (patientToAdd) {
        handleSelectPatient(patientToAdd);
      }
      if (atendimentoParaCompletar) {
        setSenha(atendimentoParaCompletar.senha);
        setClassificationId(atendimentoParaCompletar.classificacao);
      }
    } else {
        resetState();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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
    if (!selectedDepartamentoId || !selectedPaciente || !selectedProfissionalId) {
      setNotification({
        type: "error",
        title: "Campos obrigatórios",
        message: "Por favor, selecione paciente, departamento e profissional.",
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (!selectedDepartamento) throw new Error("Departamento não encontrado")
      const profissional = profissionais.find(p => p.id === selectedProfissionalId);
      if (!profissional) throw new Error("Profissional não encontrado");

      const item: Omit<FilaDeEsperaItem, 'id' | 'chegadaEm' | 'chamadaEm' | 'finalizadaEm' | 'canceladaEm' | 'prioridade'> = {
        pacienteId: selectedPaciente.id,
        pacienteNome: selectedPaciente.nome,
        departamentoId: selectedDepartamento.id,
        departamentoNome: selectedDepartamento.nome,
        departamentoNumero: selectedDepartamento.numero,
        profissionalId: profissional.id,
        profissionalNome: profissional.nome,
        senha: senha, // A senha será gerada/confirmada no backend
        status: "aguardando",
        classificacao: classificationId,
      }

      await addPacienteToFila(item, atendimentoParaCompletar?.id);
      
      onSuccess(isCompleting ? "Cadastro Completado!" : "Paciente Enviado!", `${selectedPaciente.nome} foi enviado para a fila de ${selectedDepartamento.nome}.`)
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao enviar paciente para a fila:", error)
      setNotification({
        type: "error",
        title: "Erro ao enviar para a fila",
        message: (error as Error).message || "Não foi possível adicionar o paciente à fila. Tente novamente.",
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
  
  useEffect(() => {
    // This is to handle the case where the dialog is re-opened with a patient pre-selected.
    if(patientToAdd && isOpen) {
        handleSelectPatient(patientToAdd);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientToAdd, isOpen]);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' && searchQuery === '') {
        e.preventDefault();
        setSearchQuery(' '); // Trigger re-render of useMemo
        setShowPatientList(true);
    }
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
      <DialogContent className="sm:max-w-5xl" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Send />
             {isCompleting ? `Completar Cadastro da Senha ${atendimentoParaCompletar.senha}` : 'Adicionar Paciente à Fila'}
          </DialogTitle>
          <DialogDescription>
            {isCompleting ? 'Identifique o paciente e complete o cadastro para enviá-lo à fila de atendimento.' : 'Selecione o paciente e para qual departamento e profissional ele será encaminhado.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2" ref={searchRef}>
            <Label htmlFor="paciente-search" className="flex items-center gap-2 sr-only">Paciente</Label>
            <div className="flex gap-2">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                id="paciente-search"
                placeholder="Buscar por nome, mãe, CPF, CNS, endereço ou nº..."
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowPatientList(true)
                    setHighlightedIndex(-1);
                    if (!e.target.value) {
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
                            highlightedIndex === index && "bg-accent text-accent-foreground"
                        )}
                        onClick={() => handleSelectPatient(paciente)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        >
                            <div>
                            <p className="font-semibold">{paciente.nome}</p>
                            <p className={cn("text-xs", highlightedIndex !== index && "text-muted-foreground")}>CNS: {paciente.cns}</p>
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


        <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 transition-opacity duration-500 pt-4", selectedPaciente ? "opacity-100" : "opacity-40 pointer-events-none")}>
           <Card className="h-full">
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1 w-full pr-2">
                            <Label htmlFor="paciente" className="text-muted-foreground">Paciente</Label>
                            <p id="paciente" className="font-semibold text-lg text-card-foreground break-words">{selectedPaciente?.nome || 'Selecione um paciente'}</p>
                        </div>
                         <div className="flex items-center gap-2">
                             {selectedPaciente && <>
                                <IdCard className="h-4 w-4 text-muted-foreground" />
                                <Badge variant="outline">{selectedPaciente.codigo}</Badge>
                             </>}
                         </div>
                    </div>
                    {selectedPaciente && <>
                        <Separator/>
                        <div className="space-y-2">
                            <InfoRow icon={BadgeInfo} label="CNS" value={selectedPaciente.cns} />
                            <InfoRow icon={Fingerprint} label="CPF" value={selectedPaciente.cpf} />
                            <InfoRow icon={VenetianMask} label="Sexo" value={selectedPaciente.sexo} />
                            <InfoRow icon={Cake} label="Idade" value={selectedPaciente.idade} />
                            <InfoRow 
                                icon={Home} 
                                label="Endereço" 
                                value={`${selectedPaciente.endereco || ''}, ${selectedPaciente.numero || ''}`}
                                className="text-xs" 
                            />
                            <InfoRow 
                                icon={Globe} 
                                label="Cidade" 
                                value={`${selectedPaciente.cidade || ''} - ${selectedPaciente.uf || ''}`}
                                className="text-xs" 
                            />
                        </div>
                    </>}
                </CardContent>
            </Card>

            <Card className="h-full">
              <CardContent className="p-4 space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="departamento" className="flex items-center gap-2"><Building className="h-4 w-4" />Departamento</Label>
                    <Select value={selectedDepartamentoId} onValueChange={setSelectedDepartamentoId} disabled={!selectedPaciente}>
                        <SelectTrigger id="departamento" className="w-full">
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
                        <SelectTrigger id="profissional" className="w-full">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="classification" className="flex items-center gap-2"><ShieldQuestion className="h-4 w-4" />Classificação</Label>
                        <Select value={classificationId} onValueChange={setClassificationId} disabled={!selectedPaciente || isCompleting}>
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
                    <div className="space-y-2">
                        <Label htmlFor="senha" className="flex items-center gap-2"><Tag className="h-4 w-4" />Senha</Label>
                        <Input 
                        id="senha" 
                        value={isCompleting ? senha : "Será gerada ao confirmar"}
                        readOnly
                        className="font-bold text-lg bg-background text-center tracking-wider"
                        disabled
                        placeholder="-"
                        />
                    </div>
                </div>
              </CardContent>
            </Card>
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
