"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { DepartamentoFormValues } from "./departamento-dialog";
import { Checkbox } from "../ui/checkbox";

export const DepartamentoForm = () => {
    const form = useFormContext<DepartamentoFormValues>();

    return (
        <div className="space-y-4 py-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Departamento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Consultório" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nº da Sala</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>
    );
};

const SituacaoCheckbox = ({ isEditMode }: { isEditMode: boolean }) => {
    const form = useFormContext<DepartamentoFormValues>();
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

DepartamentoForm.SituacaoCheckbox = SituacaoCheckbox;
DepartamentoForm.displayName = "DepartamentoForm";
