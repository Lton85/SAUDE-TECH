"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Stethoscope } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Medico } from "@/types/medico";


interface NewMedicoDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onMedicoCreated: (medico: Omit<Medico, 'id'>) => void;
}

const formSchema = z.object({
  nome: z.string().min(3, { message: "O nome completo é obrigatório." }),
  crm: z.string().min(4, { message: "O CRM é obrigatório." }),
  especialidade: z.string().min(3, { message: "A especialidade é obrigatória." }),
});

export function NewMedicoDialog({ isOpen, onOpenChange, onMedicoCreated }: NewMedicoDialogProps) {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nome: "",
            crm: "",
            especialidade: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        const newMedico: Omit<Medico, 'id'> = { ...values };
        onMedicoCreated(newMedico);
        onOpenChange(false);
        form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope />
            Cadastrar Novo Médico
          </DialogTitle>
           <DialogDescription>
            Preencha os campos abaixo para adicionar um novo médico ao sistema.
          </DialogDescription>
        </DialogHeader>
        
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
                <DialogFooter className="mt-4">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button type="submit">Salvar Médico</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
