"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  nome: z.string().min(3, { message: "O nome completo é obrigatório." }),
  mae: z.string().min(3, { message: "O nome da mãe é obrigatório." }),
  pai: z.string().optional(),
  cns: z.string().min(15, { message: "O CNS deve ter pelo menos 15 dígitos." }),
  cpf: z.string().min(11, { message: "O CPF é obrigatório." }),
  nascimento: z.string().refine((val) => /^\d{2}\/\d{2}\/\d{4}$/.test(val), {
    message: "A data deve estar no formato DD/MM/AAAA.",
  }),
  sexo: z.enum(['Masculino', 'Feminino'], { required_error: "O sexo é obrigatório."}),
  estadoCivil: z.enum(['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável'], { required_error: "O estado civil é obrigatório."}),
  raca: z.enum(['Branca', 'Preta', 'Parda', 'Amarela', 'Indígena', 'Não declarada'], { required_error: "A raça/cor é obrigatória."}),
  cep: z.string().min(8, { message: "O CEP é obrigatório." }),
  endereco: z.string().min(3, { message: "O endereço é obrigatório." }),
  numero: z.string().min(1, { message: "O número é obrigatório." }),
  bairro: z.string().min(2, { message: "O bairro é obrigatório." }),
  cidade: z.string().min(2, { message: "A cidade é obrigatória." }),
  uf: z.string().length(2, { message: "Selecione uma UF." }),
  nacionalidade: z.string().min(3, { message: "A nacionalidade é obrigatória." }),
  email: z.string().email({ message: "Digite um e-mail válido." }).optional().or(z.literal('')),
  telefone: z.string().optional(),
  observacoes: z.string().optional(),
});

type PatientFormValues = z.infer<typeof formSchema>;

interface PatientFormProps {
  onSubmit: (values: PatientFormValues) => void;
  defaultValues?: Partial<PatientFormValues>;
  isSubmitting: boolean;
}

const ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export function PatientForm({ onSubmit, defaultValues, isSubmitting }: PatientFormProps) {
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      mae: "",
      pai: "",
      cns: "",
      cpf: "",
      nascimento: "",
      sexo: undefined,
      estadoCivil: undefined,
      raca: undefined,
      cep: "",
      endereco: "",
      numero: "",
      bairro: "",
      cidade: "",
      uf: "",
      nacionalidade: "Brasileira",
      email: "",
      telefone: "",
      observacoes: "",
    },
  });

  React.useEffect(() => {
    if (defaultValues) {
        form.reset({
            nome: defaultValues.nome || "",
            mae: defaultValues.mae || "",
            pai: defaultValues.pai || "",
            cns: defaultValues.cns || "",
            cpf: defaultValues.cpf || "",
            nascimento: defaultValues.nascimento || "",
            sexo: defaultValues.sexo,
            estadoCivil: defaultValues.estadoCivil,
            raca: defaultValues.raca,
            cep: defaultValues.cep || "",
            endereco: defaultValues.endereco || "",
            numero: defaultValues.numero || "",
            bairro: defaultValues.bairro || "",
            cidade: defaultValues.cidade || "",
            uf: defaultValues.uf || "",
            nacionalidade: defaultValues.nacionalidade || "Brasileira",
            email: defaultValues.email || "",
            telefone: defaultValues.telefone || "",
            observacoes: defaultValues.observacoes || "",
        });
    }
  }, [defaultValues, form]);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="max-h-[60vh] overflow-y-auto pr-4 space-y-4">
          <Tabs defaultValue="info-gerais" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="info-gerais">Informações Gerais</TabsTrigger>
              <TabsTrigger value="info-complementares">Informações complementares</TabsTrigger>
            </TabsList>
            <TabsContent value="info-gerais" className="bg-card p-4 rounded-md border">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem className="md:col-span-8">
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input className="bg-muted/40" placeholder="Digite o nome completo do paciente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cns"
                  render={({ field }) => (
                    <FormItem className="md:col-span-4">
                      <FormLabel>Nº do CNS *</FormLabel>
                      <FormControl>
                        <Input className="bg-muted/40" placeholder="000 0000 0000 0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="md:col-span-12 grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mae"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Mãe *</FormLabel>
                        <FormControl>
                          <Input className="bg-muted/40" placeholder="Digite o nome da mãe do paciente" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pai"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Pai</FormLabel>
                        <FormControl>
                          <Input className="bg-muted/40" placeholder="Digite o nome do pai" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="md:col-span-12 grid md:grid-cols-3 gap-4 items-end">
                  <FormField
                    control={form.control}
                    name="nascimento"
                    render={({ field }) => (
                      <FormItem className="flex flex-col justify-end">
                        <FormLabel>Data de Nascimento *</FormLabel>
                         <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal bg-muted/40",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(parse(field.value, 'dd/MM/yyyy', new Date()), "PPP", { locale: ptBR })
                                ) : (
                                  <span>Escolha uma data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? parse(field.value, 'dd/MM/yyyy', new Date()) : undefined}
                              onSelect={(date) => field.onChange(date ? format(date, 'dd/MM/yyyy') : '')}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sexo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sexo *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-muted/40">
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
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF *</FormLabel>
                        <FormControl>
                          <Input className="bg-muted/40" placeholder="000.000.000-00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="estadoCivil"
                  render={({ field }) => (
                    <FormItem className="md:col-span-4">
                      <FormLabel>Estado Civil *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-muted/40">
                            <SelectValue placeholder="Selecione o estado civil" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Solteiro(a)">Solteiro(a)</SelectItem>
                          <SelectItem value="Casado(a)">Casado(a)</SelectItem>
                          <SelectItem value="Divorciado(a)">Divorciado(a)</SelectItem>
                          <SelectItem value="Viúvo(a)">Viúvo(a)</SelectItem>
                          <SelectItem value="União Estável">União Estável</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="raca"
                  render={({ field }) => (
                    <FormItem className="md:col-span-4">
                      <FormLabel>Raça/Cor *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-muted/40">
                            <SelectValue placeholder="Selecione a raça/cor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Branca">Branca</SelectItem>
                          <SelectItem value="Preta">Preta</SelectItem>
                          <SelectItem value="Parda">Parda</SelectItem>
                          <SelectItem value="Amarela">Amarela</SelectItem>
                          <SelectItem value="Indígena">Indígena</SelectItem>
                          <SelectItem value="Não declarada">Não declarada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nacionalidade"
                  render={({ field }) => (
                    <FormItem className="md:col-span-4">
                      <FormLabel>Nacionalidade *</FormLabel>
                      <FormControl>
                        <Input className="bg-muted/40" placeholder="Ex: Brasileira" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="md:col-span-12 grid grid-cols-12 gap-4">
                    <FormField
                      control={form.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem className="col-span-12 sm:col-span-2">
                          <FormLabel>CEP *</FormLabel>
                          <FormControl>
                            <Input className="bg-muted/40" placeholder="00000-000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endereco"
                      render={({ field }) => (
                        <FormItem className="col-span-12 sm:col-span-8">
                          <FormLabel>Endereço (Rua) *</FormLabel>
                          <FormControl>
                            <Input className="bg-muted/40" placeholder="Ex: Av. Paulista" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="numero"
                      render={({ field }) => (
                        <FormItem className="col-span-12 sm:col-span-2">
                          <FormLabel>Nº *</FormLabel>
                          <FormControl>
                            <Input className="bg-muted/40" placeholder="000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                        control={form.control}
                        name="bairro"
                        render={({ field }) => (
                            <FormItem className="col-span-12 sm:col-span-5">
                            <FormLabel>Bairro *</FormLabel>
                            <FormControl>
                                <Input className="bg-muted/40" placeholder="Ex: Bela Vista" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                      control={form.control}
                      name="uf"
                      render={({ field }) => (
                        <FormItem className="col-span-12 sm:col-span-2">
                          <FormLabel>UF *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-muted/40">
                                <SelectValue placeholder="UF" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ufs.map(uf => (
                                <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                        control={form.control}
                        name="cidade"
                        render={({ field }) => (
                            <FormItem className="col-span-12 sm:col-span-5">
                            <FormLabel>Cidade *</FormLabel>
                            <FormControl>
                                <Input className="bg-muted/40" placeholder="Ex: São Paulo" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="md:col-span-6">
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input className="bg-muted/40" placeholder="paciente@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem className="md:col-span-6">
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input className="bg-muted/40" placeholder="(00) 00000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem className="md:col-span-12">
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea className="bg-muted/40" placeholder="Alguma observação sobre o paciente..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
            <TabsContent value="info-complementares" className="bg-card p-4 rounded-md border">
              <p className="text-center text-muted-foreground">Nenhuma informação complementar necessária no momento.</p>
            </TabsContent>
          </Tabs>
        </div>
        <div className="mt-4 pt-4 border-t flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Salvando..." : "Salvar Paciente"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
