"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Medico } from "@/types/medico";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  nome: z.string().min(3, { message: "O nome completo é obrigatório." }),
  crm: z.string().min(4, { message: "O CRM é obrigatório." }),
  cns: z.string().min(15, { message: "O CNS é obrigatório." }),
  especialidade: z.string().min(3, { message: "A especialidade é obrigatória." }),
  cbo: z.string().min(4, { message: "O CBO é obrigatório." }),
  cargaHoraria: z.string().min(1, { message: "A carga horária é obrigatória." }),
  situacao: z.enum(['Ativo', 'Inativo'], { required_error: "A situação é obrigatória." }),
});

type MedicoFormValues = z.infer<typeof formSchema>;

interface MedicoFormProps {
  onSubmit: (values: MedicoFormValues) => void;
  medico?: Partial<Medico> | null;
  isSubmitting: boolean;
}

export function MedicoForm({ onSubmit, medico, isSubmitting }: MedicoFormProps) {
  const form = useForm<MedicoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      crm: "",
      cns: "",
      especialidade: "",
      cbo: "",
      cargaHoraria: "",
      situacao: "Ativo",
    },
  });

  React.useEffect(() => {
    if (medico) {
      form.reset({
        nome: medico.nome || "",
        crm: medico.crm || "",
        cns: medico.cns || "",
        especialidade: medico.especialidade || "",
        cbo: medico.cbo || "",
        cargaHoraria: medico.cargaHoraria || "",
        situacao: medico.situacao || "Ativo",
      });
    } else {
        form.reset({
            nome: "",
            crm: "",
            cns: "",
            especialidade: "",
            cbo: "",
            cargaHoraria: "",
            situacao: "Ativo",
        });
    }
  }, [medico, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. Nome do Médico" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="crm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CRM</FormLabel>
                  <FormControl>
                    <Input placeholder="000000/BR" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cns"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNS</FormLabel>
                  <FormControl>
                    <Input placeholder="000 0000 0000 0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="especialidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidade</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Clínico Geral" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cbo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CBO Especialidade</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 2251-25" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="cargaHoraria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carga Horária (Semanal)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 40h" {...field} />
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
        </div>
        <div className="flex justify-end gap-2 pt-4">
           <Button type="submit" disabled={isSubmitting}>
             {isSubmitting ? "Salvando..." : "Salvar"}
           </Button>
        </div>
      </form>
    </Form>
  );
}
