"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Departamento } from "@/types/departamento";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const formSchema = z.object({
  nome: z.string().min(3, { message: "O nome é obrigatório." }),
  numero: z.string().optional(),
  situacao: z.enum(['Ativo', 'Inativo'], { required_error: "A situação é obrigatória." }),
});

type DepartamentoFormValues = z.infer<typeof formSchema>;

interface DepartamentoFormProps extends React.ComponentPropsWithoutRef<'form'> {
  onSubmit: (values: DepartamentoFormValues) => void;
  departamento?: Departamento | null;
}

export const DepartamentoForm = ({ onSubmit, departamento, ...props }: DepartamentoFormProps) => {
    const form = useForm<DepartamentoFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        nome: "",
        numero: "",
        situacao: 'Ativo',
      },
    });

    React.useEffect(() => {
        if (departamento) {
            form.reset({
                nome: departamento.nome || "",
                numero: departamento.numero || "",
                situacao: departamento.situacao || 'Ativo',
            });
        } else {
             form.reset({
                nome: "",
                numero: "",
                situacao: 'Ativo',
            });
        }
    }, [departamento, form]);

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4" {...props}>
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
              <FormField
                control={form.control}
                name="situacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Situação</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a situação" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </form>
      </Form>
    );
  };

DepartamentoForm.displayName = "DepartamentoForm";
