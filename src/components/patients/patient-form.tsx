
"use client";

import { useFormContext } from "react-hook-form";
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
import { Checkbox } from "../ui/checkbox";
import type { PatientFormValues } from "./patient-dialog";

interface PatientFormProps {
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

export function PatientForm({ isEditMode }: PatientFormProps) {
  const [cities, setCities] = React.useState<string[]>([]);
  const [isCitiesLoading, setIsCitiesLoading] = React.useState(false);
  const nameInputRef = React.useRef<HTMLInputElement>(null);
  
  const form = useFormContext<PatientFormValues>();

  const selectedUf = form.watch('uf');
  
  React.useEffect(() => {
    // Only focus if it's a new patient form (no ID)
    if (!isEditMode) {
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isEditMode]);
  
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
              </div>
            </div>
        </div>
  );
}

const SituacaoCheckbox = ({ isEditMode }: { isEditMode: boolean }) => {
    const form = useFormContext<PatientFormValues>();

    if (!isEditMode) return null;

    return (
        <div className="flex-1 flex justify-start">
             <FormField
                control={form.control}
                name="situacao"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-start space-x-3 space-y-0">
                        <FormControl>
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>
                                Cadastro Ativo
                            </FormLabel>
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
};

PatientForm.SituacaoCheckbox = SituacaoCheckbox;
