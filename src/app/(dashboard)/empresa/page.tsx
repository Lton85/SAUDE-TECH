
"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, Save, Loader2, Pencil, X, ShieldQuestion, Tv, PlusCircle, Trash2, Tablet, Image as ImageIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getEmpresa, saveOrUpdateEmpresa } from "@/services/empresaService";
import type { Empresa, Classificacao } from "@/types/empresa";
import { NotificationDialog, NotificationType } from "@/components/ui/notification-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";


const ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

interface IbgeCityResponse {
    id: number;
    nome: string;
}

const initialClassificacoes: Classificacao[] = [
    { id: 'Normal', nome: 'Normal', nomeAtivo: true, descricao: 'Atendimento geral para todos os públicos', descricaoAtiva: true, ativa: true },
    { id: 'Preferencial', nome: 'Preferencial', nomeAtivo: true, descricao: 'Gestantes, idosos, pessoas com deficiência.', descricaoAtiva: true, ativa: true },
    { id: 'Urgencia', nome: 'Urgência', nomeAtivo: true, descricao: 'Atendimento de urgência e emergência.', descricaoAtiva: true, ativa: true },
];

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
    nomeImpressora: "",
    classificacoes: initialClassificacoes,
    exibirUltimasSenhas: true,
    localChamadaTriagem: "Recepção",
    exibirLocalChamadaTriagem: true,
    tabletInfoSize: 'medio',
    tabletCardSize: 'medio',
};

export default function EmpresaPage() {
    const [formData, setFormData] = useState<Empresa>(initialEmpresaState);
    const [cities, setCities] = useState<string[]>([]);
    const [isCitiesLoading, setIsCitiesLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [notification, setNotification] = useState<{ type: NotificationType; title: string; message: string; } | null>(null);

    const fetchEmpresaData = async () => {
        setIsLoading(true);
        try {
            const empresaData = await getEmpresa();
            if (empresaData) {
                 const classificacoesExistentes = empresaData.classificacoes?.length ? empresaData.classificacoes : initialClassificacoes;
                 const classificacoesCompletas = classificacoesExistentes.map(c => ({
                    ...c,
                    nomeAtivo: c.nomeAtivo !== undefined ? c.nomeAtivo : true,
                    descricaoAtiva: c.descricaoAtiva !== undefined ? c.descricaoAtiva : true,
                 }));

                setFormData({
                    ...initialEmpresaState,
                    ...empresaData,
                    classificacoes: classificacoesCompletas,
                });

                if (empresaData.uf) {
                    fetchCitiesForUf(empresaData.uf);
                }
            } else {
                setFormData(initialEmpresaState);
                setIsEditing(true); 
            }
        } catch (error) {
            setNotification({
                type: "error",
                title: "Erro ao carregar dados",
                message: "Não foi possível buscar as informações da empresa.",
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchEmpresaData();
    }, []);

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
            setNotification({
                type: "error",
                title: "Erro ao buscar cidades",
                message: "Não foi possível carregar la lista de cidades para o estado selecionado.",
            });
        } finally {
            setIsCitiesLoading(false);
        }
    }
    
    const handleUfChange = (uf: string) => {
        setFormData(prev => ({ ...prev, uf, cidade: "" }));
        fetchCitiesForUf(uf);
    }
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: value }));
    }

    const handleSelectChange = (id: keyof Empresa, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    }

    const handleRadioChange = (id: keyof Empresa, value: string) => {
        setFormData(prev => ({...prev, [id]: value}));
    }
    
    const handleClassificationChange = (index: number, field: keyof Omit<Classificacao, 'id'>, value: string | boolean) => {
        setFormData(prev => {
            const newClassificacoes = [...(prev.classificacoes || [])];
            const classificacaoToUpdate = { ...newClassificacoes[index], [field]: value };
            newClassificacoes[index] = classificacaoToUpdate;
            return { ...prev, classificacoes: newClassificacoes };
        });
    };
    
    const handleAddClassification = () => {
        setFormData(prev => {
            const newId = `custom_${Date.now()}`;
            const newClassificacoes = [
                ...(prev.classificacoes || []),
                { id: newId, nome: '', nomeAtivo: true, descricao: '', descricaoAtiva: true, ativa: true }
            ];
            return { ...prev, classificacoes: newClassificacoes };
        });
    };

    const handleRemoveClassification = (index: number) => {
        setFormData(prev => {
            const newClassificacoes = [...(prev.classificacoes || [])];
            newClassificacoes.splice(index, 1);
            return { ...prev, classificacoes: newClassificacoes };
        });
    };

    const handleCheckboxChange = (id: keyof Empresa, checked: boolean) => {
        setFormData(prev => ({...prev, [id]: checked}));
    };
    
    const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            if (data.erro) {
                setNotification({
                    type: "warning",
                    title: "CEP não encontrado",
                    message: "Por favor, verifique o CEP digitado.",
                });
            } else {
                 setFormData(prev => ({
                    ...prev,
                    endereco: data.logradouro,
                    bairro: data.bairro,
                    cidade: data.localidade,
                    uf: data.uf,
                    cep: prev.cep,
                }));
                 await fetchCitiesForUf(data.uf);
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
            setNotification({
                type: "error",
                title: "Erro ao buscar CEP",
                message: "Ocorreu um problema ao tentar buscar o endereço pelo CEP.",
            });
        }
    };

    const handleEditToggle = () => {
        setIsEditing(true);
        if (formData.uf) {
            fetchCitiesForUf(formData.uf);
        }
    };

    const handleCancel = async () => {
        setIsEditing(false);
        await fetchEmpresaData(); // Refetch original data
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Garante que a propriedade `ativa` seja derivada do estado dos checkboxes `nomeAtivo` e `descricaoAtiva`
            const formDataToSave = {
                ...formData,
                classificacoes: formData.classificacoes?.map(c => ({
                    ...c,
                    ativa: c.nomeAtivo || c.descricaoAtiva,
                }))
            };

            await saveOrUpdateEmpresa(formDataToSave);
            setIsEditing(false);
            setNotification({
                type: "success",
                title: "Dados Salvos!",
                message: "As informações da empresa foram atualizadas com sucesso.",
            })
        } catch (error) {
            setNotification({
                type: "error",
                title: "Erro ao salvar",
                message: (error as Error).message || "Não foi possível salvar os dados da empresa.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div>
    }

    return (
        <>
        <div className="space-y-6">
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
                    <div className="space-y-6">
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
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <ShieldQuestion className="h-6 w-6" />
                            <CardTitle>Classificação de Atendimento</CardTitle>
                        </div>
                        <CardDescription>
                            Personalize e adicione novos tipos de atendimento para o tablet de senhas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {(formData.classificacoes || []).map((classificacao, index) => (
                                <React.Fragment key={classificacao.id}>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`class-name-active-${classificacao.id}`}
                                                checked={classificacao.nomeAtivo}
                                                onCheckedChange={(checked) => handleClassificationChange(index, 'nomeAtivo', !!checked)}
                                                disabled={!isEditing}
                                            />
                                            <Input
                                                id={`className-${classificacao.id}`}
                                                value={classificacao.nome}
                                                onChange={(e) => handleClassificationChange(index, 'nome', e.target.value)}
                                                disabled={!isEditing}
                                                className="font-semibold h-9 flex-1"
                                                placeholder="Nome da Classificação"
                                            />
                                            {isEditing && !initialClassificacoes.some(c => c.id === classificacao.id) && (
                                                <Button variant="ghost" size="icon" onClick={() => handleRemoveClassification(index)} className="text-destructive hover:text-destructive h-8 w-8">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                         <div className="flex items-center space-x-2 ml-8">
                                             <Checkbox
                                                id={`class-desc-active-${classificacao.id}`}
                                                checked={classificacao.descricaoAtiva}
                                                onCheckedChange={(checked) => handleClassificationChange(index, 'descricaoAtiva', !!checked)}
                                                disabled={!isEditing}
                                            />
                                            <Input
                                                id={`classDesc-${classificacao.id}`}
                                                value={classificacao.descricao || ''}
                                                onChange={(e) => handleClassificationChange(index, 'descricao', e.target.value)}
                                                disabled={!isEditing}
                                                placeholder="Descrição (Ex: Gestantes, Idosos...)"
                                                className="text-sm h-9 flex-1"
                                            />
                                        </div>
                                    </div>
                                    {index < (formData.classificacoes || []).length - 1 && <Separator className="mt-4" />}
                                </React.Fragment>
                            ))}
                            {isEditing && (
                                <Button variant="default" size="sm" className="mt-4 w-full" onClick={handleAddClassification}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Adicionar Nova Classificação
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Tv className="h-6 w-6" />
                                <CardTitle>Configurações do Painel</CardTitle>
                            </div>
                            <CardDescription>
                                Ajuste as informações exibidas no painel de senhas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="exibirUltimasSenhas" 
                                checked={!!formData.exibirUltimasSenhas}
                                onCheckedChange={(checked) => handleCheckboxChange('exibirUltimasSenhas', !!checked)}
                                disabled={!isEditing}
                            />
                            <Label htmlFor="exibirUltimasSenhas" className="font-normal">Exibir últimas senhas chamadas</Label>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <Label htmlFor="localChamadaTriagem">Local da Primeira Chamada</Label>
                            <Input 
                                    id="localChamadaTriagem" 
                                    value={formData.localChamadaTriagem || ''} 
                                    onChange={handleInputChange} 
                                    placeholder="Ex: Recepção, Triagem, Guichê 1"
                                    disabled={!isEditing}
                                />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="exibirLocalChamadaTriagem" 
                                checked={!!formData.exibirLocalChamadaTriagem}
                                onCheckedChange={(checked) => handleCheckboxChange('exibirLocalChamadaTriagem', !!checked)}
                                disabled={!isEditing}
                            />
                            <Label htmlFor="exibirLocalChamadaTriagem" className="font-normal">Exibir local da primeira chamada no painel</Label>
                        </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Tablet className="h-6 w-6" />
                                <CardTitle>Resolução Tablet</CardTitle>
                            </div>
                            <CardDescription className="text-sm">
                                Ajuste os tamanhos para a tela de senhas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="font-semibold text-sm">Informações</Label>
                                <RadioGroup value={formData.tabletInfoSize || 'medio'} onValueChange={(v) => handleRadioChange('tabletInfoSize', v as any)} className="flex items-center gap-2">
                                    <RadioGroupItem value="pequeno" id="info-p" disabled={!isEditing}/>
                                    <Label htmlFor="info-p" className="cursor-pointer text-xs px-1">P</Label>
                                    <RadioGroupItem value="medio" id="info-m" disabled={!isEditing}/>
                                    <Label htmlFor="info-m" className="cursor-pointer text-xs px-1">M</Label>
                                    <RadioGroupItem value="grande" id="info-g" disabled={!isEditing}/>
                                    <Label htmlFor="info-g" className="cursor-pointer text-xs px-1">G</Label>
                                </RadioGroup>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="font-semibold text-sm">Card</Label>
                                <RadioGroup value={formData.tabletCardSize || 'medio'} onValueChange={(v) => handleRadioChange('tabletCardSize', v as any)} className="flex items-center gap-2">
                                    <RadioGroupItem value="pequeno" id="card-p" disabled={!isEditing}/>
                                    <Label htmlFor="card-p" className="cursor-pointer text-xs px-1">P</Label>
                                    <RadioGroupItem value="medio" id="card-m" disabled={!isEditing}/>
                                    <Label htmlFor="card-m" className="cursor-pointer text-xs px-1">M</Label>
                                    <RadioGroupItem value="grande" id="card-g" disabled={!isEditing}/>
                                    <Label htmlFor="card-g" className="cursor-pointer text-xs px-1">G</Label>
                                </RadioGroup>
                            </div>
                        </CardContent>
                    </Card>
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
        </div>
        {notification && (
            <NotificationDialog
                type={notification.type}
                title={notification.title}
                message={notification.message}
                onOpenChange={() => setNotification(null)}
            />
        )}
        </>
    );
}
