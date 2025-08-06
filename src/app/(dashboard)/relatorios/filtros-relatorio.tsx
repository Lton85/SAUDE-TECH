
"use client"

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, Loader2, User, Stethoscope, X, Search, ShieldQuestion, Building } from "lucide-react";
import type { Medico } from "@/types/medico";
import type { Paciente } from "@/types/paciente";
import type { Departamento } from "@/types/departamento";

interface FiltrosRelatorioProps {
    pacientes: Paciente[];
    medicos: Medico[];
    departamentos: Departamento[];
    selectedPacienteId: string;
    onPacienteChange: (id: string) => void;
    selectedMedicoId: string;
    onMedicoChange: (id: string) => void;
    selectedDepartamentoId: string;
    onDepartamentoChange: (id: string) => void;
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
    departamentos,
    selectedPacienteId,
    onPacienteChange,
    selectedMedicoId,
    onMedicoChange,
    selectedDepartamentoId,
    onDepartamentoChange,
    selectedClassificacao,
    onClassificacaoChange,
    onSearch,
    isLoading,
    onClearFilters,
    hasActiveFilters,
}: FiltrosRelatorioProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 p-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    <CardTitle className="text-base">Filtros de Refinamento</CardTitle>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    disabled={!hasActiveFilters || isLoading}
                    className="flex items-center gap-1 text-xs"
                >
                    <X className="mr-1 h-3 w-3" />
                    Limpar
                </Button>
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
                    <Label htmlFor="departamento-filter" className="flex items-center gap-2 text-sm"><Building className="h-4 w-4"/>Departamento</Label>
                    <Select
                        value={selectedDepartamentoId}
                        onValueChange={onDepartamentoChange}
                        disabled={isLoading}
                    >
                        <SelectTrigger id="departamento-filter">
                            <SelectValue placeholder="Filtrar por departamento" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos os Departamentos</SelectItem>
                            {departamentos.map(d => (
                                <SelectItem key={d.id} value={d.id}>{d.nome}{d.numero ? ` - Sala ${d.numero}`: ''}</SelectItem>
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
            </CardContent>
        </Card>
    );
}
