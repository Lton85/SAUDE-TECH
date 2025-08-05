

"use client"

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, Loader2, User, Stethoscope, UserPlus, X, Search, ShieldQuestion } from "lucide-react";
import type { Medico } from "@/types/medico";
import type { Enfermeiro } from "@/types/enfermeiro";
import type { Paciente } from "@/types/paciente";

interface FiltrosRelatorioProps {
    pacientes: Paciente[];
    medicos: Medico[];
    enfermeiros: Enfermeiro[];
    selectedPacienteId: string;
    onPacienteChange: (id: string) => void;
    selectedMedicoId: string;
    onMedicoChange: (id: string) => void;
    selectedEnfermeiroId: string;
    onEnfermeiroChange: (id: string) => void;
    selectedClassificacao: string;
    onClassificacaoChange: (value: string) => void;
    onSearch: () => void;
    isLoading: boolean;
    onClearFilters: () => void;
    hasActiveFilters: boolean;
}

export function FiltrosRelatorio({
    pacientes,
    medicos,
    enfermeiros,
    selectedPacienteId,
    onPacienteChange,
    selectedMedicoId,
    onMedicoChange,
    selectedEnfermeiroId,
    onEnfermeiroChange,
    selectedClassificacao,
    onClassificacaoChange,
    onSearch,
    isLoading,
    onClearFilters,
    hasActiveFilters,
}: FiltrosRelatorioProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-2 p-4">
                <Filter className="w-5 h-5" />
                <CardTitle className="text-base">Filtros de Refinamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
                 <div className="space-y-2">
                    <Label htmlFor="paciente-filter" className="flex items-center gap-2 text-sm"><User className="h-4 w-4"/>Paciente</Label>
                    <Select
                        value={selectedPacienteId}
                        onValueChange={onPacienteChange}
                        disabled={isLoading}
                    >
                        <SelectTrigger id="paciente-filter">
                            <SelectValue placeholder="Filtrar por paciente" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos os Pacientes</SelectItem>
                            {pacientes.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="medico-filter" className="flex items-center gap-2 text-sm"><Stethoscope className="h-4 w-4"/>Médico</Label>
                    <Select
                        value={selectedMedicoId}
                        onValueChange={onMedicoChange}
                        disabled={isLoading}
                    >
                        <SelectTrigger id="medico-filter">
                            <SelectValue placeholder="Filtrar por médico" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos os Médicos</SelectItem>
                            {medicos.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="enfermeiro-filter" className="flex items-center gap-2 text-sm"><UserPlus className="h-4 w-4"/>Enfermeiro</Label>
                    <Select
                        value={selectedEnfermeiroId}
                        onValueChange={onEnfermeiroChange}
                        disabled={isLoading}
                    >
                        <SelectTrigger id="enfermeiro-filter">
                            <SelectValue placeholder="Filtrar por enfermeiro" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos os Enfermeiros</SelectItem>
                            {enfermeiros.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="classificacao-filter" className="flex items-center gap-2 text-sm"><ShieldQuestion className="h-4 w-4"/>Tipo de Atendimento</Label>
                    <Select
                        value={selectedClassificacao}
                        onValueChange={onClassificacaoChange}
                        disabled={isLoading}
                    >
                        <SelectTrigger id="classificacao-filter">
                            <SelectValue placeholder="Filtrar por tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos os Tipos</SelectItem>
                            <SelectItem value="Normal">Atendimento Normal</SelectItem>
                            <SelectItem value="Preferencial">Atendimento Preferencial</SelectItem>
                            <SelectItem value="Urgência">Atendimento de Urgência</SelectItem>
                        </SelectContent>
                    </Select>
                </div>


                <div className="flex flex-col gap-2 pt-2">
                    <Button onClick={onSearch} className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                        Aplicar Filtros
                    </Button>
                     <Button
                        variant="outline"
                        onClick={onClearFilters}
                        className="w-full"
                        disabled={!hasActiveFilters || isLoading}
                    >
                        <X className="mr-2 h-4 w-4" />
                        Limpar Filtros
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

    
