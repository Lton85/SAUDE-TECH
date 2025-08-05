
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

const formSchema = z.object({
  nome: z.string().min(3, { message: "O nome completo é obrigatório." }),
  mae: z.string().optional(),
  pai: z.string().optional(),
  cns: z.string().min(15, { message: "O CNS deve ter pelo menos 15 dígitos." }),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  nascimento: z.string().optional(),
  sexo: z.enum(['Masculino', 'Feminino', '']).optional(),
  estadoCivil: z.enum(['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável', '']).optional(),
  cep: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  email: z.string().email({ message: "Digite um e-mail válido." }).optional().or(z.literal('')),
  telefone: z.string().optional(),
  observacoes: z.string().optional(),
  situacao: z.enum(['Ativo', 'Inativo']).optional(),
});

type PatientFormValues = z.infer<typeof formSchema>;

interface PatientFormProps {
  onSubmit: (values: PatientFormValues) => void;
  defaultValues?: Partial<PatientFormValues & { id?: string }>;
  isSubmitting: boolean;
  isEditMode: boolean;
}

const ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

interface IbgeCityResponse {
    id: number;
    nome: string;
}

export function PatientForm({ onSubmit, defaultValues, isSubmitting, isEditMode }: PatientFormProps) {
  const [cities, setCities] = React.useState<string[]>([]);
  const [isCitiesLoading, setIsCitiesLoading] = React.useState(false);
  const nameInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      mae: "",
      pai: "",
      cns: "",
      cpf: "",
      rg: "",
      nascimento: "",
      sexo: undefined,
      estadoCivil: undefined,
      cep: "",
      endereco: "",
      numero: "",
      bairro: "",
      cidade: "",
      uf: "",
      email: "",
      telefone: "",
      observacoes: "",
      situacao: "Ativo",
    },
  });

  const selectedUf = form.watch('uf');

  React.useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...defaultValues,
        uf: defaultValues.uf || "",
        cidade: defaultValues.cidade || "",
        situacao: defaultValues.situacao || "Ativo",
      });
      // Only focus if it's a new patient form (no ID)
      if (!defaultValues.id) {
        const timer = setTimeout(() => {
          nameInputRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [defaultValues, form]);
  
  React.useEffect(() => {
    const fetchCities = async () => {
        if (!selectedUf) {
            setCities([]);
            return;
        }
        setIsCitiesLoading(true);
        try {
            const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`);
            const data: IbgeCityResponse[] = await response.json();
            setCities(data.map(city => city.nome).sort());
        } catch (error) {
            console.error("Erro ao buscar cidades:", error);
            setCities([]);
        } finally {
            setIsCitiesLoading(false);
        }
    };
    fetchCities();
  }, [selectedUf]);

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length !== 8) {
      return;
    }
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        form.setValue('endereco', data.logradouro);
        form.setValue('bairro', data.bairro);
        form.setValue('uf', data.uf, { shouldValidate: true });
        // Give time for cities to load before setting city value
        setTimeout(() => {
            form.setValue('cidade', data.localidade);
        }, 500);
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="max-h-[60vh] overflow-y-auto pr-4 space-y-4">
           <div className="bg-card p-4 rounded-md border space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem className="md:col-span-8">
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          ref={nameInputRef}
                          className="bg-muted/40"
                          placeholder="Digite o nome completo do paciente"
                        />
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
                        <FormLabel>Nome da Mãe</FormLabel>
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
                <div className="md:col-span-12 grid md:grid-cols-5 gap-4 items-end">
                  <FormField
                    control={form.control}
                    name="nascimento"
                    render={({ field }) => (
                      <FormItem className="flex flex-col justify-end">
                        <FormLabel>Data de Nascimento</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              className="bg-muted/40 pr-10"
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
                    name="sexo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sexo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                          <Input className="bg-muted/40" placeholder="000.000.000-00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RG</FormLabel>
                        <FormControl>
                          <Input className="bg-muted/40" placeholder="00.000.000-0" {...field} />
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
                        <FormLabel>Estado Civil</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-muted/40">
                              <SelectValue placeholder="Selecione" />
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
                </div>
                
                 <div className="md:col-span-12 grid grid-cols-12 gap-4">
                    <FormField
                      control={form.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem className="col-span-12 sm:col-span-2">
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input className="bg-muted/40" placeholder="00000-000" {...field} onBlur={handleCepBlur} />
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
                          <FormLabel>Endereço (Rua)</FormLabel>
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
                          <FormLabel>Nº</FormLabel>
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
                            <FormLabel>Bairro</FormLabel>
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
                          <FormLabel>UF</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
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
                            <FormLabel>Cidade</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={isCitiesLoading || cities.length === 0}>
                                <FormControl>
                                <SelectTrigger className="bg-muted/40">
                                    <SelectValue placeholder={isCitiesLoading ? "Carregando..." : (selectedUf ? "Selecione a cidade" : "Selecione um estado")} />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {cities.map(city => (
                                    <SelectItem key={city} value={city}>{city}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
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
                 {isEditMode && (
                   <FormField
                    control={form.control}
                    name="situacao"
                    render={({ field }) => (
                      <FormItem className="md:col-span-4">
                        <FormLabel>Situação do Cadastro</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-muted/40">
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
                 )}
              </div>
            </div>
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
