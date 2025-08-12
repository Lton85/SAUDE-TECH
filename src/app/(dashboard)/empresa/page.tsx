
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, Save, Loader2, Pencil, X, ShieldQuestion, Tv, PlusCircle, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getEmpresa, saveOrUpdateEmpresa } from "@/services/empresaService";
import type { Empresa, Classificacao } from "@/types/empresa";
import { NotificationDialog, NotificationType } from "@/components/ui/notification-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

const ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

interface IbgeCityResponse {
    id: number;
    nome: string;
}

const initialClassificacoes: Classificacao[] = [
    { id: 'Normal', nome: 'Normal', descricao: 'Para consultas de rotina', ativa: true, editavel: false, exibirDescricao: true },
    { id: 'Preferencial', nome: 'Preferencial', descricao: 'Gestantes, Idosos, Cadeirantes', ativa: true, editavel: false, exibirDescricao: true },
    { id: 'Urgencia', nome: 'Urgência', descricao: 'Atendimento de emergência', ativa: true, editavel: false, exibirDescricao: true },
    { id: 'Outros', nome: 'Outros', descricao: '', ativa: true, editavel: false, exibirDescricao: true },
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
                setFormData({
                    ...initialEmpresaState,
                    ...empresaData,
                    classificacoes: classificacoesExistentes,
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
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: value }));
    }

    const handleSelectChange = (id: keyof Omit<Empresa, 'id' | 'uf' | 'classificacoesAtendimento' | 'nomesClassificacoes'>, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    }
    
    const handleClassificationChange = (index: number, field: keyof Omit<Classificacao, 'id' | 'editavel'>, value: string | boolean) => {
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
                { id: newId, nome: 'Nova Classificação', descricao: '', ativa: true, editavel: true, exibirDescricao: true }
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
            await saveOrUpdateEmpresa(formData);
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
                            Ative, personalize e adicione novos tipos de atendimento para o tablet de senhas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="space-y-4">
                           {(formData.classificacoes || []).map((classificacao, index) => (
                               <div key={classificacao.id} className="flex items-start space-x-4">
                                   <div className="flex flex-col items-center gap-2 pt-1">
                                    <Checkbox 
                                        id={`class-active-${classificacao.id}`}
                                        checked={classificacao.ativa}
                                        onCheckedChange={(checked) => handleClassificationChange(index, 'ativa', !!checked)}
                                        disabled={!isEditing}
                                    />
                                    <Label htmlFor={`class-active-${classificacao.id}`} className="text-xs text-muted-foreground">Ativa</Label>
                                   </div>
                                   <div className="flex-1 space-y-2">
                                        <Input
                                          id={`className-${classificacao.id}`}
                                          value={classificacao.nome}
                                          onChange={(e) => handleClassificationChange(index, 'nome', e.target.value)}
                                          disabled={!isEditing}
                                          className="font-semibold"
                                        />
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id={`class-show-desc-${classificacao.id}`}
                                                checked={classificacao.exibirDescricao}
                                                onCheckedChange={(checked) => handleClassificationChange(index, 'exibirDescricao', !!checked)}
                                                disabled={!isEditing}
                                            />
                                            <Input
                                            id={`classDesc-${classificacao.id}`}
                                            value={classificacao.descricao || ''}
                                            onChange={(e) => handleClassificationChange(index, 'descricao', e.target.value)}
                                            disabled={!isEditing}
                                            placeholder="Descrição (Ex: Gestantes, Idosos...)"
                                            className="text-xs h-8"
                                            />
                                        </div>
                                   </div>
                                    {isEditing && classificacao.editavel && (
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveClassification(index)} className="text-destructive hover:text-destructive h-8 w-8 mt-0.5">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                               </div>
                           ))}
                           {isEditing && (
                            <Button variant="outline" size="sm" className="mt-4 w-full" onClick={handleAddClassification}>
                                <PlusCircle className="mr-2 h-4 w-4"/>
                                Adicionar Nova Classificação
                            </Button>
                           )}
                        </div>
                    </CardContent>
                </Card>

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

    

    