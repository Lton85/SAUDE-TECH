
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, Save, Loader2, Pencil, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { saveOrUpdateEmpresa } from "@/services/empresaService";
import type { Empresa } from "@/types/empresa";
import { useToast } from "@/hooks/use-toast";

const ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

interface IbgeCityResponse {
    id: number;
    nome: string;
}

const initialEmpresaState: Empresa = {
    id: "config",
    codigoCliente: "",
    razaoSocial: "",
    nomeFantasia: "",
    cnpj: "",
    cep: "",
    endereco: "",
    numero: "",
    bairro: "",
    cidade: "",
    uf: "",
    telefone: "",
    email: "",
};

interface EmpresaPageProps {
    empresaData: Empresa | null;
    onEmpresaDataChange: (newData: Partial<Empresa>) => void;
}

export default function EmpresaPage({ empresaData, onEmpresaDataChange }: EmpresaPageProps) {
    const [formData, setFormData] = useState<Empresa>(initialEmpresaState);
    const [cities, setCities] = useState<string[]>([]);
    const [isCitiesLoading, setIsCitiesLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setIsLoading(true);
        if (empresaData) {
            setFormData(empresaData);
            if (empresaData.uf) {
                fetchCitiesForUf(empresaData.uf);
            }
        } else {
            setFormData(initialEmpresaState);
            setIsEditing(true); 
        }
        setIsLoading(false);
    }, [empresaData]);
    
    const fetchCitiesForUf = async (uf: string) => {
        if (!uf) {
            setCities([]);
            return;
        }
        setIsCitiesLoading(true);
        try {
            const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
            if (!response.ok) throw new Error('Failed to fetch cities');
            const data: IbgeCityResponse[] = await response.json();
            setCities(data.map(city => city.nome).sort());
        } catch (error) {
            console.error("Erro ao buscar cidades:", error);
            setCities([]);
             toast({
                title: "Erro ao buscar cidades",
                description: "Não foi possível carregar a lista de cidades para o estado selecionado.",
                variant: "destructive",
            });
        } finally {
            setIsCitiesLoading(false);
        }
    }
    
    const handleUfChange = (uf: string) => {
        const newFormData = { ...formData, uf, cidade: "" };
        setFormData(newFormData);
        onEmpresaDataChange({ uf, cidade: "" });
        fetchCitiesForUf(uf);
    }
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        const newFormData = {...formData, [id]: value };
        setFormData(newFormData);
        if (id === 'razaoSocial') {
            onEmpresaDataChange({ razaoSocial: value });
        }
    }

    const handleSelectChange = (id: keyof Omit<Empresa, 'id' | 'uf'>, value: string) => {
        const newFormData = { ...formData, [id]: value };
        setFormData(newFormData);
        onEmpresaDataChange({ [id]: value });
    }
    
    const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            if (data.erro) {
                toast({
                    title: "CEP não encontrado",
                    description: "Por favor, verifique o CEP digitado.",
                    variant: "destructive",
                });
            } else {
                const newFormData = {
                    ...formData,
                    endereco: data.logradouro,
                    bairro: data.bairro,
                    cidade: data.localidade,
                    uf: data.uf,
                    cep: formData.cep,
                };
                 setFormData(newFormData);
                 onEmpresaDataChange({
                     endereco: data.logradouro,
                     bairro: data.bairro,
                     cidade: data.localidade,
                     uf: data.uf
                 });
                 await fetchCitiesForUf(data.uf);
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
            toast({
                title: "Erro ao buscar CEP",
                description: "Ocorreu um problema ao tentar buscar o endereço pelo CEP.",
                variant: "destructive",
            });
        }
    };


    const handleEditToggle = () => {
        setIsEditing(true);
        if (formData.uf) {
            fetchCitiesForUf(formData.uf);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (empresaData) {
            setFormData(empresaData);
            onEmpresaDataChange(empresaData);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveOrUpdateEmpresa(formData);
            setIsEditing(false);
            toast({
                title: "Dados Salvos!",
                description: "As informações da empresa foram atualizadas com sucesso.",
                className: "bg-green-500 text-white"
            })
        } catch (error) {
            toast({
                title: "Erro ao salvar",
                description: (error as Error).message || "Não foi possível salvar os dados da empresa.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div>
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Building className="h-6 w-6" />
                    <CardTitle>Dados da Empresa</CardTitle>
                </div>
                <CardDescription>
                    Gerencie as informações da sua unidade de saúde. Estes dados serão utilizados nos relatórios e impressões.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="space-y-2 col-span-12 md:col-span-2">
                            <Label htmlFor="codigoCliente">Código do Cliente</Label>
                            <Input id="codigoCliente" value={formData.codigoCliente || ''} onChange={handleInputChange} placeholder="Ex: 001" disabled={!isEditing}/>
                        </div>
                        <div className="space-y-2 col-span-12 md:col-span-5">
                            <Label htmlFor="razaoSocial">Razão Social</Label>
                            <Input id="razaoSocial" value={formData.razaoSocial} onChange={handleInputChange} placeholder="Ex: Saúde Fácil Ltda." disabled={!isEditing}/>
                        </div>
                        <div className="space-y-2 col-span-12 md:col-span-3">
                            <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                            <Input id="nomeFantasia" value={formData.nomeFantasia} onChange={handleInputChange} placeholder="Ex: UBS Central" disabled={!isEditing}/>
                        </div>
                        <div className="space-y-2 col-span-12 md:col-span-2">
                            <Label htmlFor="cnpj">CNPJ</Label>
                            <Input id="cnpj" value={formData.cnpj} onChange={handleInputChange} placeholder="00.000.000/0001-00" disabled={!isEditing}/>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                         <div className="space-y-2 col-span-12 md:col-span-2">
                            <Label htmlFor="cep">CEP</Label>
                            <Input id="cep" value={formData.cep} onChange={handleInputChange} onBlur={handleCepBlur} placeholder="00000-000" disabled={!isEditing}/>
                        </div>
                        <div className="space-y-2 col-span-12 md:col-span-8">
                            <Label htmlFor="endereco">Endereço (Rua)</Label>
                            <Input id="endereco" value={formData.endereco} onChange={handleInputChange} placeholder="Ex: Av. Principal" disabled={!isEditing}/>
                        </div>
                        <div className="space-y-2 col-span-12 md:col-span-2">
                            <Label htmlFor="numero">Número</Label>
                            <Input id="numero" value={formData.numero} onChange={handleInputChange} placeholder="Ex: 123" disabled={!isEditing}/>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="space-y-2 col-span-12 md:col-span-8">
                            <Label htmlFor="bairro">Bairro</Label>
                            <Input id="bairro" value={formData.bairro} onChange={handleInputChange} placeholder="Ex: Centro" disabled={!isEditing}/>
                        </div>
                         <div className="space-y-2 col-span-12 md:col-span-2">
                            <Label htmlFor="uf">Estado (UF)</Label>
                            <Select value={formData.uf} onValueChange={handleUfChange} disabled={!isEditing}>
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
                             <Select value={formData.cidade} onValueChange={(v) => handleSelectChange('cidade', v)} disabled={!isEditing || isCitiesLoading || cities.length === 0}>
                                <SelectTrigger id="cidade">
                                    <SelectValue placeholder={isCitiesLoading ? "Carregando..." : (formData.uf ? "Selecione..." : "Escolha um UF")} />
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
                            <Input id="telefone" value={formData.telefone} onChange={handleInputChange} type="tel" placeholder="(00) 0000-0000" disabled={!isEditing}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input id="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="contato@ubs.com" disabled={!isEditing}/>
                        </div>
                    </div>
                    
                    <div className="flex justify-end pt-4 gap-2">
                        {!isEditing ? (
                            <Button onClick={handleEditToggle} disabled={isSaving}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar Cadastro
                            </Button>
                        ) : (
                            <>
                                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                                    <X className="mr-2 h-4 w-4" />
                                    Cancelar
                                </Button>
                                <Button onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Salvar Alterações
                                </Button>
                            </>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
