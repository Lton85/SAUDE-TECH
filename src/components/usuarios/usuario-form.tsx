
"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "../ui/checkbox";
import type { UsuarioFormValues } from "./usuario-form-schema";

export const UsuarioForm = ({ isEditMode }: { isEditMode: boolean }) => {
    const form = useFormContext<UsuarioFormValues>();

    return (
        <div className="space-y-4 py-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do usuário" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                        <Input placeholder="000.000.000-00" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="usuario"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Usuário</FormLabel>
                        <FormControl>
                        <Input placeholder="login.de.acesso" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
               <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="senha"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                        <Input type="password" placeholder={isEditMode ? "Deixe em branco para não alterar" : "••••••"} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmarSenha"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Confirmar Senha</FormLabel>
                        <FormControl>
                        <Input type="password" placeholder="••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
            </CardContent>
          </Card>
        </div>
    );
};

const SituacaoCheckbox = ({ isEditMode }: { isEditMode: boolean }) => {
    const form = useFormContext<UsuarioFormValues>();
    if (!isEditMode) return null;
    return (
        <div className="flex-1 flex justify-start">
            <FormField
                control={form.control}
                name="situacao"
                render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-start space-x-3 space-y-0">
                    <FormControl>
                    <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                    />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                    <FormLabel>
                        Cadastro Ativo
                    </FormLabel>
                    </div>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
    )
}

UsuarioForm.SituacaoCheckbox = SituacaoCheckbox;

    