"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Enfermeiro } from "@/types/enfermeiro";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { DialogFooter } from "../ui/dialog";

const formSchema = z.object({
  nome: z.string().min(3, { message: "O nome completo é obrigatório." }),
  cns: z.string().min(15, { message: "O CNS é obrigatório." }),
  coren: z.string().min(4, { message: "O COREN é obrigatório." }),
  especialidade: z.string().min(3, { message: "A especialidade é obrigatória." }),
  sexo: z.enum(['Masculino', 'Feminino'], { required_error: "O sexo é obrigatório."}),
  cpf: z.string().min(11, { message: "O CPF é obrigatório." }),
  dataNascimento: z.string().refine((val) => /^\d{2}\/\d{2}\/\d{4}$/.test(val), {
    message: "A data deve estar no formato DD/MM/AAAA.",
  }),
  telefone: z.string().min(10, { message: "O telefone é obrigatório." }),
  turno: z.enum(['Manhã', 'Tarde', 'Noite'], { required_error: "O turno é obrigatório." }),
  situacao: z.enum(['Ativo', 'Inativo'], { required_error: "A situação é obrigatória." }),
});

type EnfermeiroFormValues = z.infer<typeof formSchema>;

interface EnfermeiroFormProps {
  onSubmit: (values: EnfermeiroFormValues) => void;
  enfermeiro?: Partial<Enfermeiro> | null;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function EnfermeiroForm({ onSubmit, enfermeiro, isSubmitting, onCancel }: EnfermeiroFormProps) {
  const form = useForm<EnfermeiroFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      cns: "",
      coren: "",
      especialidade: "",
      sexo: undefined,
      cpf: "",
      dataNascimento: "",
      telefone: "",
      turno: "Manhã",
      situacao: "Ativo",
    },
  });
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, fieldChange: (value: string) => void) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    if (value.length > 5) {
      value = `${value.slice(0, 5)}/${value.slice(5, 9)}`;
    }
    fieldChange(value);
  };


  React.useEffect(() => {
    if (enfermeiro) {
      form.reset({
        nome: enfermeiro.nome || "",
        cns: enfermeiro.cns || "",
        coren: enfermeiro.coren || "",
        especialidade: enfermeiro.especialidade || "",
        sexo: enfermeiro.sexo || undefined,
        cpf: enfermeiro.cpf || "",
        dataNascimento: enfermeiro.dataNascimento || "",
        telefone: enfermeiro.telefone || "",
        turno: enfermeiro.turno || "Manhã",
        situacao: enfermeiro.situacao || "Ativo",
      });
    } else {
        form.reset({
            nome: "",
            cns: "",
            coren: "",
            especialidade: "",
            sexo: undefined,
            cpf: "",
            dataNascimento: "",
            telefone: "",
            turno: "Manhã",
            situacao: "Ativo",
        });
    }
  }, [enfermeiro, form]);
  
  const formId = "enfermeiro-form";

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem className="md:col-span-3">
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
                name="sexo"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Sexo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Selecione o sexo" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Feminino">Feminino</SelectItem>
                    </SelectContent>
                    </Select>
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
                    <Input placeholder="Ex: UTI" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                  name="dataNascimento"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-end">
                      <FormLabel>Data de Nascimento</FormLabel>
                      <div className="relative">
                        <FormControl>
                           <Input
                              placeholder="DD/MM/AAAA"
                              {...field}
                               onChange={(e) => handleDateChange(e, field.onChange)}
                               maxLength={10}
                            />
                        </FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3"
                              aria-label="Abrir calendário"
                            >
                              <CalendarIcon className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value && /^\d{2}\/\d{2}\/\d{4}$/.test(field.value) ? parse(field.value, 'dd/MM/yyyy', new Date()) : undefined}
                              onSelect={(date) => field.onChange(date ? format(date, 'dd/MM/yyyy') : '')}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(00) 00000-0000" {...field} />
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
      </form>
       <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
      </DialogFooter>
    </Form>
  );
}
