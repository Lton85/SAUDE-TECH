"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Departamento } from "@/types/departamento";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  nome: z.string().min(3, { message: "O nome é obrigatório." }),
  numero: z.string().min(1, { message: "O número da sala é obrigatório." }),
  situacao: z.enum(['Ativo', 'Inativo'], { required_error: "A situação é obrigatória." }),
});

type DepartamentoFormValues = z.infer<typeof formSchema>;

interface DepartamentoFormProps {
  onSubmit: (values: DepartamentoFormValues) => void;
  defaultValues?: Partial<DepartamentoFormValues>;
}

export const DepartamentoForm = React.forwardRef<HTMLFormElement, DepartamentoFormProps>(
  ({ onSubmit, defaultValues }, ref) => {
    const form = useForm<DepartamentoFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        nome: defaultValues?.nome || "",
        numero: defaultValues?.numero || "",
        situacao: defaultValues?.situacao || 'Ativo',
      },
    });

    return (
      <Form {...form}>
        <form ref={ref} id="departamento-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
        </form>
      </Form>
    );
  }
);

DepartamentoForm.displayName = "DepartamentoForm";
