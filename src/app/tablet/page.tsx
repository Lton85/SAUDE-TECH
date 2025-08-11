
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { FilaDeEsperaItem } from "@/types/fila";
import { addPreCadastroToFila } from "@/services/filaDeEsperaService";
import { cn } from "@/lib/utils";
import { NotificationDialog, NotificationType } from "@/components/ui/notification-dialog";
import { getEmpresa } from "@/services/empresaService";
import type { Empresa } from "@/types/empresa";

interface GeneratedTicket {
    senha: string;
    tipo: FilaDeEsperaItem['classificacao'];
}

const notificationColors: { [key: string]: string } = {
    Normal: 'bg-green-600',
    Preferencial: 'bg-blue-600',
    Urgência: 'bg-red-600',
    Outros: 'bg-amber-500',
};

const borderColors: { [key: string]: string } = {
    Normal: "group-hover:border-green-400 bg-green-500/10 border-green-500/30",
    Preferencial: "group-hover:border-blue-400 bg-blue-500/10 border-blue-500/30",
    Urgência: "group-hover:border-red-400 bg-red-500/10 border-red-500/30",
    Outros: "group-hover:border-amber-400 bg-amber-500/10 border-amber-500/30",
};

const textColors: { [key: string]: string } = {
    Normal: "text-green-400",
    Preferencial: "text-blue-400",
    Urgência: "text-red-400",
    Outros: "text-amber-400",
};

const classificationOrder: FilaDeEsperaItem['classificacao'][] = ["Normal", "Preferencial", "Urgência", "Outros"];

export default function TabletPage() {
    const [isLoading, setIsLoading] = useState<FilaDeEsperaItem['classificacao'] | null>(null);
    const [classificacoes, setClassificacoes] = useState<string[]>([]);
    const [isFetchingConfig, setIsFetchingConfig] = useState(true);
    const [generatedTicket, setGeneratedTicket] = useState<GeneratedTicket | null>(null);
    const [notification, setNotification] = useState<{ type: NotificationType; title: string; message: string; } | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            setIsFetchingConfig(true);
            try {
                const empresaData = await getEmpresa();
                let activeClassificacoes: string[];

                if (empresaData?.classificacoesAtendimento?.length) {
                    activeClassificacoes = empresaData.classificacoesAtendimento;
                } else {
                    // Fallback para as classificações padrão se não estiver configurado
                    activeClassificacoes = ["Normal", "Preferencial", "Urgência", "Outros"];
                }

                // Sort the active classifications based on the predefined order
                const sortedClassificacoes = classificationOrder.filter(c => activeClassificacoes.includes(c));
                setClassificacoes(sortedClassificacoes);

            } catch (error) {
                setNotification({
                    type: 'error',
                    title: `Erro ao carregar configurações`,
                    message: (error as Error).message,
                });
                 // Fallback on error
                 setClassificacoes(["Normal", "Preferencial", "Urgência", "Outros"]);
            } finally {
                setIsFetchingConfig(false);
            }
        };
        fetchConfig();
    }, []);

    useEffect(() => {
        if (generatedTicket) {
            const timer = setTimeout(() => {
                setGeneratedTicket(null);
            }, 5000); // Fica na tela por 5 segundos
            return () => clearTimeout(timer);
        }
    }, [generatedTicket]);

    const handleSelection = async (type: FilaDeEsperaItem['classificacao']) => {
        setIsLoading(type);
        setGeneratedTicket(null);
        try {
            const senha = await addPreCadastroToFila(type);
            setGeneratedTicket({ senha, tipo: type });
        } catch (error) {
             setNotification({
                type: 'error',
                title: `Erro ao gerar senha`,
                message: (error as Error).message,
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
    
    if (isFetchingConfig) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-8 text-center overflow-hidden">
                <Loader2 className="h-16 w-16 animate-spin text-amber-400" />
                <p className="mt-4 text-4xl md:text-5xl text-slate-200">
                    Carregando configurações...
                </p>
            </div>
        )
    }

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-slate-900 p-8 text-center overflow-hidden">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-12 w-full"
            >
                <h1 className="font-display text-6xl md:text-8xl font-black text-amber-400 tracking-tighter uppercase">
                    RETIRE SUA SENHA
                </h1>
                <p className="mt-4 text-2xl md:text-3xl text-slate-200">
                    Escolha o tipo de atendimento:
                </p>
            </motion.div>

            <div className="flex flex-wrap justify-center items-center gap-8 w-full max-w-7xl">
                {classificacoes.map((tipo, index) => (
                     <motion.div 
                        key={tipo} 
                        custom={index} 
                        initial="hidden" 
                        animate="visible" 
                        variants={cardVariants}
                        className="w-full sm:w-64 md:w-72" // Define a fixed width for the cards
                     >
                        <Card 
                            className={cn(
                                "group w-full h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer aspect-square",
                                borderColors[tipo]
                            )}
                            onClick={() => handleSelection(tipo as FilaDeEsperaItem['classificacao'])}
                        >
                            <CardContent className="flex flex-col items-center justify-center p-8 md:p-10 h-full">
                                {isLoading === tipo ? <Loader2 className={cn("h-12 w-12 animate-spin", textColors[tipo])} /> : <h2 className={cn("text-3xl md:text-4xl font-bold", textColors[tipo])}>{tipo.toUpperCase()}</h2>}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
            
            <AnimatePresence>
                {generatedTicket && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    >
                        <div className={cn("text-white p-12 rounded-lg shadow-2xl max-w-2xl text-center border-4 border-white/50", notificationColors[generatedTicket.tipo])}>
                            <h3 className="text-4xl font-bold">SENHA GERADA</h3>
                             <p className="mt-4 text-9xl font-display font-extrabold tracking-tighter">
                                {generatedTicket.senha}
                            </p>
                            <p className="mt-4 text-2xl font-semibold">
                                Atendimento {generatedTicket.tipo}
                            </p>
                            <p className="mt-2 text-lg">
                                Aguarde ser chamado no painel.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

             {notification && (
                <NotificationDialog
                    type={notification.type}
                    title={notification.title}
                    message={notification.message}
                    onOpenChange={() => setNotification(null)}
                />
            )}
        </div>
    );
}
