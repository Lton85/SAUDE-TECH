
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Star, AlertTriangle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import type { FilaDeEsperaItem } from "@/types/fila";
import { addPreCadastroToFila } from "@/services/filaDeEsperaService";

export default function TabletPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState<'Normal' | 'Preferencial' | 'Urgência' | null>(null);

    const handleSelection = async (type: FilaDeEsperaItem['classificacao']) => {
        setIsLoading(type);
        try {
            const senha = await addPreCadastroToFila(type);
            toast({
                title: `Senha Gerada: ${senha}`,
                description: `Sua senha do tipo ${type} foi gerada. Aguarde ser chamado.`,
                className: "bg-green-500 text-white"
            });
        } catch (error) {
             toast({
                title: `Erro ao gerar senha`,
                description: (error as Error).message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(null);
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: "easeOut"
            }
        })
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-8 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                <h1 className="font-display text-6xl md:text-8xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tighter">
                    Retire sua senha
                </h1>
                <p className="mt-2 text-xl md:text-2xl text-muted-foreground">
                    Escolha o serviço desejado
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants}>
                    <Card 
                        className="group w-full h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer bg-card"
                        onClick={() => handleSelection('Normal')}
                    >
                        <CardContent className="flex flex-col items-center justify-center p-8 md:p-12 aspect-square">
                            {isLoading === 'Normal' ? <Loader2 className="h-10 w-10 animate-spin text-green-600" /> : <ArrowRight className="h-10 w-10 text-green-600 dark:text-green-400" />}
                            <h2 className="mt-6 text-2xl md:text-4xl font-bold text-green-700 dark:text-green-300">NORMAL</h2>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants}>
                     <Card 
                        className="group w-full h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer bg-card"
                        onClick={() => handleSelection('Preferencial')}
                    >
                        <CardContent className="flex flex-col items-center justify-center p-8 md:p-12 aspect-square">
                           {isLoading === 'Preferencial' ? <Loader2 className="h-10 w-10 animate-spin text-blue-600" /> : <Star className="h-10 w-10 text-blue-600 dark:text-blue-400" />}
                            <h2 className="mt-6 text-2xl md:text-4xl font-bold text-blue-700 dark:text-blue-300">PREFERENCIAL</h2>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants}>
                     <Card 
                        className="group w-full h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer bg-card"
                        onClick={() => handleSelection('Urgência')}
                    >
                        <CardContent className="flex flex-col items-center justify-center p-8 md:p-12 aspect-square">
                            {isLoading === 'Urgência' ? <Loader2 className="h-10 w-10 animate-spin text-red-600" /> : <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />}
                            <h2 className="mt-6 text-2xl md:text-4xl font-bold text-red-700 dark:text-red-300">URGÊNCIA</h2>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
