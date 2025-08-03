"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Enfermeiro } from "@/types/enfermeiro";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  nome: z.string().min(3, { message: "O nome completo é obrigatório." }),
  coren: z.string().min(4, { message: "O COREN é obrigatório." }),
  turno: z.enum(['Manhã', 'Tarde', 'Noite'], { required_error: "O turno é obrigatório." }),
});

type EnfermeiroFormValues = z.infer<typeof formSchema>;

interface EnfermeiroFormProps {
  onSubmit: (values: EnfermeiroFormValues) => void;
  enfermeiro?: Partial<Enfermeiro> | null;
  isSubmitting: boolean;
}

export function EnfermeiroForm({ onSubmit, enfermeiro, isSubmitting }: EnfermeiroFormProps) {
  const form = useForm<EnfermeiroFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      coren: "",
      turno: "Manhã",
    },
  });

  React.useEffect(() => {
    if (enfermeiro) {
      form.reset({
        nome: enfermeiro.nome || "",
        coren: enfermeiro.coren || "",
        turno: enfermeiro.turno as "Manhã" | "Tarde" | "Noite" || "Manhã",
      });
    } else {
        form.reset({
            nome: "",
            coren: "",
            turno: "Manhã",
        });
    }
  }, [enfermeiro, form]);

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
                <Input placeholder="Nome do(a) Enfermeiro(a)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="coren"
          render={({ field }) => (
            <FormItem>
              <FormLabel>COREN</FormLabel>
              <FormControl>
                <Input placeholder="000000/SP" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="turno"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Turno</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o turno" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Manhã">Manhã</SelectItem>
                  <SelectItem value="Tarde">Tarde</SelectItem>
                  <SelectItem value="Noite">Noite</SelectItem>
                </SelectContent>
              </Select>
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
