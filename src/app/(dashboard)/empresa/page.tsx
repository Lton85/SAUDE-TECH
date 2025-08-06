
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, Save } from "lucide-react";

export default function EmpresaPage() {
    return (
        <Card className="max-w-4xl mx-auto">
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
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="space-y-2 col-span-12 md:col-span-5">
                            <Label htmlFor="razaoSocial">Razão Social</Label>
                            <Input id="razaoSocial" placeholder="Ex: Saúde Fácil Ltda." />
                        </div>
                        <div className="space-y-2 col-span-12 md:col-span-4">
                            <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                            <Input id="nomeFantasia" placeholder="Ex: UBS Central" />
                        </div>
                        <div className="space-y-2 col-span-12 md:col-span-3">
                            <Label htmlFor="cnpj">CNPJ</Label>
                            <Input id="cnpj" placeholder="00.000.000/0001-00" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                         <div className="space-y-2 col-span-12 sm:col-span-3">
                            <Label htmlFor="cep">CEP</Label>
                            <Input id="cep" placeholder="00000-000" />
                        </div>
                        <div className="space-y-2 col-span-12 sm:col-span-9">
                            <Label htmlFor="endereco">Endereço (Rua)</Label>
                            <Input id="endereco" placeholder="Ex: Av. Principal" />
                        </div>
                    </div>

                     <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="space-y-2 col-span-12 sm:col-span-3">
                            <Label htmlFor="numero">Número</Label>
                            <Input id="numero" placeholder="Ex: 123" />
                        </div>
                        <div className="space-y-2 col-span-12 sm:col-span-9">
                            <Label htmlFor="bairro">Bairro</Label>
                            <Input id="bairro" placeholder="Ex: Centro" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="cidade">Cidade</Label>
                            <Input id="cidade" placeholder="Ex: São Paulo" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="uf">Estado (UF)</Label>
                            <Input id="uf" placeholder="Ex: SP" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="telefone">Telefone</Label>
                            <Input id="telefone" type="tel" placeholder="(00) 0000-0000" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input id="email" type="email" placeholder="contato@ubs.com" />
                        </div>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                        <Button>
                            <Save className="mr-2 h-4 w-4" />
                            Salvar Alterações
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
