

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, UserPlus } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { Paciente } from "@/types/paciente";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


interface NewPatientDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onPatientCreated: (paciente: Paciente) => void;
}

const formSchema = z.object({
  nome: z.string().min(3, { message: "O nome completo é obrigatório." }),
  mae: z.string().min(3, { message: "O nome da mãe é obrigatório." }),
  pai: z.string().min(3, { message: "O nome do pai é obrigatório." }),
  cns: z.string().min(15, { message: "O CNS deve ter 15 dígitos." }).max(15, { message: "O CNS deve ter 15 dígitos." }),
  cpf: z.string().min(11, { message: "O CPF deve ter 11 dígitos." }).max(14, { message: "O CPF deve ter até 14 caracteres."}),
  nascimento: z.date({ required_error: "A data de nascimento é obrigatória."}),
  sexo: z.enum(['Masculino', 'Feminino'], { required_error: "O sexo é obrigatório."}),
  estadoCivil: z.enum(['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável'], { required_error: "O estado civil é obrigatório."}),
  raca: z.enum(['Branca', 'Preta', 'Parda', 'Amarela', 'Indígena', 'Não declarada'], { required_error: "A raça/cor é obrigatória."}),
  endereco: z.string().min(5, { message: "O endereço é obrigatório." }),
  nacionalidade: z.string().min(3, { message: "A nacionalidade é obrigatória." }),
  email: z.string().email({ message: "Digite um e-mail válido." }).optional().or(z.literal('')),
  telefone: z.string().optional(),
  observacoes: z.string().optional(),
});

export function NewPatientDialog({ isOpen, onOpenChange, onPatientCreated }: NewPatientDialogProps) {
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nome: "",
            mae: "",
            pai: "",
            cns: "",
            cpf: "",
            endereco: "",
            nacionalidade: "Brasileira",
            email: "",
            telefone: "",
            observacoes: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        const newPatient: Paciente = {
            id: Math.floor(10000 + Math.random() * 90000).toString(),
            ...values,
            nascimento: format(values.nascimento, 'dd/MM/yyyy'),
            idade: `${new Date().getFullYear() - values.nascimento.getFullYear()}a`,
            situacao: 'Ativo',
            historico: {
                criadoEm: new Date().toISOString(),
                criadoPor: 'Recepção',
                alteradoEm: new Date().toISOString(),
                alteradoPor: 'Recepção',
            }
        };
        
        onPatientCreated(newPatient);
        toast({
            title: "Paciente Cadastrado!",
            description: `O paciente ${newPatient.nome} foi adicionado com sucesso.`,
            className: "bg-green-500 text-white"
        });
        onOpenChange(false);
        form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus />
            Cadastrar Novo Paciente
          </DialogTitle>
           <DialogDescription>
            Preencha os campos abaixo para adicionar um novo paciente ao sistema. Campos com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="max-h-[60vh] overflow-y-auto pr-2">
                <Tabs defaultValue="info-gerais" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="info-gerais">Informações Gerais</TabsTrigger>
                        <TabsTrigger value="info-complementares">Informações complementares</TabsTrigger>
                    </TabsList>
                    <TabsContent value="info-gerais" className="bg-card p-4 rounded-md border">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="nome"
                                render={({ field }) => (
                                    <FormItem>
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
                                    <FormItem>
                                        <FormLabel>Nº do CNS *</FormLabel>
                                        <FormControl>
                                            <Input className="bg-muted/40" placeholder="000 0000 0000 0000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
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
                                            <FormLabel>Nome do Pai *</FormLabel>
                                            <FormControl>
                                                <Input className="bg-muted/40" placeholder="Digite o nome do pai" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                             <FormField
                                control={form.control}
                                name="nascimento"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
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
                                                    format(field.value, "PPP", { locale: ptBR})
                                                ) : (
                                                    <span>Selecione uma data</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
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
                            
                            <FormField
                                control={form.control}
                                name="estadoCivil"
                                render={({ field }) => (
                                    <FormItem>
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
                                    <FormItem>
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
                                    <FormItem>
                                        <FormLabel>Nacionalidade *</FormLabel>
                                        <FormControl>
                                            <Input className="bg-muted/40" placeholder="Ex: Brasileira" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endereco"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Endereço *</FormLabel>
                                        <FormControl>
                                            <Input className="bg-muted/40" placeholder="Ex: Rua, Número, Bairro, Cidade - Estado" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                           
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
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
                                    <FormItem>
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
                                    <FormItem className="md:col-span-2">
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
                <DialogFooter className="mt-4">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button type="submit">Salvar Paciente</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    
    
