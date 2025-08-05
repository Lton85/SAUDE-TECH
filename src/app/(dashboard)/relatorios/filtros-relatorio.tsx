
"use client"

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, Loader2, User, Stethoscope, UserPlus } from "lucide-react";
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
    onSearch: () => void;
    isLoading: boolean;
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
    onSearch,
    isLoading,
}: FiltrosRelatorioProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-2">
                <Filter className="w-5 h-5" />
                <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="paciente-filter" className="flex items-center gap-2 text-sm"><User className="h-4 w-4"/>Paciente</Label>
                    <Select
                        value={selectedPacienteId}
                        onValueChange={onPacienteChange}
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


                <Button onClick={onSearch} className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Aplicar Filtros
                </Button>
            </CardContent>
        </Card>
    );
}

    