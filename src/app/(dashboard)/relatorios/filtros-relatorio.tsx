
"use client"

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, Loader2 } from "lucide-react";
import type { Medico } from "@/types/medico";
import type { Enfermeiro } from "@/types/enfermeiro";

type Profissional = (Medico | Enfermeiro) & { tipo: 'medico' | 'enfermeiro' };

interface FiltrosRelatorioProps {
    profissionais: Profissional[];
    selectedProfissionalId: string;
    onProfissionalChange: (id: string) => void;
    onSearch: () => void;
    isLoading: boolean;
}

export function FiltrosRelatorio({
    profissionais,
    selectedProfissionalId,
    onProfissionalChange,
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
                    <Label htmlFor="profissional-filter">Profissional</Label>
                    <Select
                        value={selectedProfissionalId}
                        onValueChange={onProfissionalChange}
                    >
                        <SelectTrigger id="profissional-filter">
                            <SelectValue placeholder="Filtrar por profissional" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos os Profissionais</SelectItem>
                            {profissionais.map(p => (
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
