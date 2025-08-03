"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  nome: z.string().min(3, { message: "O nome completo é obrigatório." }),
  crm: z.string().min(4, { message: "O CRM é obrigatório." }),
  especialidade: z.string().min(3, { message: "A especialidade é obrigatória." }),
});

type MedicoFormValues = z.infer<typeof formSchema>;

interface MedicoFormProps {
  onSubmit: (values: MedicoFormValues) => void;
  defaultValues?: Partial<MedicoFormValues>;
  isSubmitting: boolean;
}

export function MedicoForm({ onSubmit, defaultValues, isSubmitting }: MedicoFormProps) {
  const form = useForm<MedicoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: defaultValues?.nome || "",
      crm: defaultValues?.crm || "",
      especialidade: defaultValues?.especialidade || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
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
        <div className="flex justify-end gap-2 pt-4">
           <Button type="submit" disabled={isSubmitting}>
             {isSubmitting ? "Salvando..." : "Salvar"}
           </Button>
        </div>
      </form>
    </Form>
  );
}
