
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, Save, Loader2, Pencil, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

const ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

interface IbgeCityResponse {
    id: number;
    nome: string;
}

export default function EmpresaPage() {
    const [selectedUf, setSelectedUf] = useState<string>("");
    const [selectedCity, setSelectedCity] = useState<string>("");
    const [cities, setCities] = useState<string[]>([]);
    const [isCitiesLoading, setIsCitiesLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchCities = async () => {
            if (!selectedUf) {
                setCities([]);
                setSelectedCity("");
                return;
            }
            setIsCitiesLoading(true);
            try {
                const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`);
                const data: IbgeCityResponse[] = await response.json();
                setCities(data.map(city => city.nome).sort());
            } catch (error) {
                console.error("Erro ao buscar cidades:", error);
                setCities([]);
            } finally {
                setIsCitiesLoading(false);
            }
        };
        fetchCities();
    }, [selectedUf]);
    
    const handleEditToggle = () => setIsEditing(!isEditing);
    
    const handleCancel = () => {
        // Here you would typically reset the form to its original state
        setIsEditing(false);
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Building className="h-6 w-6" />
                        <CardTitle>Dados da Empresa</CardTitle>
                    </div>
                     {!isEditing && (
                        <Button onClick={handleEditToggle} variant="outline">
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar Cadastro
                        </Button>
                    )}
                </div>
                <CardDescription>
                    Gerencie as informações da sua unidade de saúde. Estes dados serão utilizados nos relatórios e impressões.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="space-y-2 col-span-12 md:col-span-6">
                            <Label htmlFor="razaoSocial">Razão Social</Label>
                            <Input id="razaoSocial" placeholder="Ex: Saúde Fácil Ltda." disabled={!isEditing}/>
                        </div>
                        <div className="space-y-2 col-span-12 md:col-span-4">
                            <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                            <Input id="nomeFantasia" placeholder="Ex: UBS Central" disabled={!isEditing}/>
                        </div>
                        <div className="space-y-2 col-span-12 md:col-span-2">
                            <Label htmlFor="cnpj">CNPJ</Label>
                            <Input id="cnpj" placeholder="00.000.000/0001-00" disabled={!isEditing}/>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                         <div className="space-y-2 col-span-12 md:col-span-2">
                            <Label htmlFor="cep">CEP</Label>
                            <Input id="cep" placeholder="00000-000" disabled={!isEditing}/>
                        </div>
                        <div className="space-y-2 col-span-12 md:col-span-8">
                            <Label htmlFor="endereco">Endereço (Rua)</Label>
                            <Input id="endereco" placeholder="Ex: Av. Principal" disabled={!isEditing}/>
                        </div>
                        <div className="space-y-2 col-span-12 md:col-span-2">
                            <Label htmlFor="numero">Número</Label>
                            <Input id="numero" placeholder="Ex: 123" disabled={!isEditing}/>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="space-y-2 col-span-12 md:col-span-8">
                            <Label htmlFor="bairro">Bairro</Label>
                            <Input id="bairro" placeholder="Ex: Centro" disabled={!isEditing}/>
                        </div>
                         <div className="space-y-2 col-span-12 md:col-span-2">
                            <Label htmlFor="uf">Estado (UF)</Label>
                            <Select value={selectedUf} onValueChange={setSelectedUf} disabled={!isEditing}>
                                <SelectTrigger id="uf">
                                    <SelectValue placeholder="UF" />
                                </SelectTrigger>
                                <SelectContent>
                                    <ScrollArea className="h-72">
                                        {ufs.map(uf => (
                                            <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                                        ))}
                                    </ScrollArea>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 col-span-12 md:col-span-2">
                            <Label htmlFor="cidade">Cidade</Label>
                             <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!isEditing || isCitiesLoading || cities.length === 0}>
                                <SelectTrigger id="cidade">
                                    <SelectValue placeholder={isCitiesLoading ? "Carregando..." : "Cidade"} />
                                </SelectTrigger>
                                <SelectContent>
                                     {isCitiesLoading ? (
                                        <div className="flex items-center justify-center p-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        </div>
                                    ) : (
                                    <ScrollArea className="h-72">
                                        {cities.map(city => (
                                            <SelectItem key={city} value={city}>{city}</SelectItem>
                                        ))}
                                    </ScrollArea>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="telefone">Telefone</Label>
                            <Input id="telefone" type="tel" placeholder="(00) 0000-0000" disabled={!isEditing}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input id="email" type="email" placeholder="contato@ubs.com" disabled={!isEditing}/>
                        </div>
                    </div>
                    
                    {isEditing && (
                        <div className="flex justify-end pt-4 gap-2">
                             <Button variant="outline" onClick={handleCancel}>
                                <X className="mr-2 h-4 w-4" />
                                Cancelar
                            </Button>
                            <Button>
                                <Save className="mr-2 h-4 w-4" />
                                Salvar Alterações
                            </Button>
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
