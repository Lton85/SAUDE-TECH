
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
import type { Empresa, Classificacao } from "@/types/empresa";

interface GeneratedTicket {
    senha: string;
    tipo: FilaDeEsperaItem['classificacao'];
    tipoNome: string;
}

const getColors = (classId: string) => {
    switch (classId) {
        case 'Normal': return {
            notification: 'bg-green-600',
            border: "border-green-400/30 bg-green-900/20 hover:border-green-400/60",
            text: "text-green-400",
            description: "text-green-400/70"
        };
        case 'Preferencial': return {
            notification: 'bg-blue-600',
            border: "border-blue-400/30 bg-blue-900/20 hover:border-blue-400/60",
            text: "text-blue-400",
            description: "text-blue-400/70"
        };
        case 'Urgencia': return {
            notification: 'bg-red-600',
            border: "border-red-400/30 bg-red-900/20 hover:border-red-400/60",
            text: "text-red-400",
            description: "text-red-400/70"
        };
        default: return { 
            notification: 'bg-slate-600',
            border: "border-slate-400/30 bg-slate-900/20 hover:border-slate-400/60",
            text: "text-slate-400",
            description: "text-slate-400/70"
        };
    }
};

const infoSizeClasses = {
  pequeno: "text-5xl md:text-7xl",
  medio: "text-6xl md:text-8xl",
  grande: "text-7xl md:text-9xl",
};
const subtitleSizeClasses = {
  pequeno: "text-3xl md:text-4xl",
  medio: "text-4xl md:text-5xl",
  grande: "text-5xl md:text-6xl",
};
const cardSizeClasses = {
  pequeno: "text-2xl md:text-3xl",
  medio: "text-3xl md:text-4xl",
  grande: "text-4xl md:text-5xl",
};


export default function TabletPage() {
    const [isLoading, setIsLoading] = useState<FilaDeEsperaItem['classificacao'] | null>(null);
    const [config, setConfig] = useState<{
        activeClassifications: Classificacao[];
        infoSize: 'pequeno' | 'medio' | 'grande';
        cardSize: 'pequeno' | 'medio' | 'grande';
    }>({
        activeClassifications: [],
        infoSize: 'medio',
        cardSize: 'medio',
    });

    const [isFetchingConfig, setIsFetchingConfig] = useState(true);
    const [generatedTicket, setGeneratedTicket] = useState<GeneratedTicket | null>(null);
    const [notification, setNotification] = useState<{ type: NotificationType; title: string; message: string; } | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            setIsFetchingConfig(true);
            try {
                const empresaData = await getEmpresa();
                const active = empresaData?.classificacoes?.length 
                    ? empresaData.classificacoes.filter(c => c.ativa) 
                    : [];
                
                setConfig({
                    activeClassifications: active,
                    infoSize: empresaData?.tabletInfoSize || 'medio',
                    cardSize: empresaData?.tabletCardSize || 'medio'
                });

            } catch (error) {
                setNotification({
                    type: 'error',
                    title: `Erro ao carregar configurações`,
                    message: (error as Error).message,
                });
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
            }, 5000); 
            return () => clearTimeout(timer);
        }
    }, [generatedTicket]);

    const handleSelection = async (classificacao: Classificacao) => {
        setIsLoading(classificacao.id);
        setGeneratedTicket(null);
        try {
            const senha = await addPreCadastroToFila(classificacao, config.activeClassifications);
            setGeneratedTicket({ senha, tipo: classificacao.id, tipoNome: classificacao.nome });
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
                 <h1 className={cn("font-display font-black text-amber-400 tracking-tighter uppercase", infoSizeClasses[config.infoSize])}>
                    RETIRE SUA SENHA
                </h1>
                <p className={cn("mt-4 text-slate-300 font-normal", subtitleSizeClasses[config.infoSize])}>
                    Escolha o tipo de atendimento:
                </p>
            </motion.div>

            <div className="flex justify-center items-stretch gap-8 w-full max-w-7xl">
                {config.activeClassifications.map((classificacao, index) => {
                     const colors = getColors(classificacao.id);
                     return (
                     <motion.div 
                        key={classificacao.id} 
                        custom={index} 
                        initial="hidden" 
                        animate="visible" 
                        variants={cardVariants}
                        className="w-full"
                     >
                        <Card 
                            className={cn(
                                "group w-full h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer aspect-square",
                                colors.border
                            )}
                            onClick={() => handleSelection(classificacao)}
                        >
                            <CardContent className="flex flex-col items-center justify-center p-4 h-full">
                                {isLoading === classificacao.id ? (
                                    <Loader2 className={cn("h-12 w-12 animate-spin", colors.text)} />
                                ) : (
                                    <>
                                        <h2 className={cn("font-bold uppercase", colors.text, cardSizeClasses[config.cardSize])}>
                                            {classificacao.nome}
                                        </h2>
                                        {classificacao.descricao && (
                                            <p className={cn(
                                                "text-xs md:text-sm font-normal mt-2", 
                                                colors.description
                                            )}>
                                                {classificacao.descricao}
                                            </p>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )})}
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
                        <div className={cn("text-white p-12 rounded-lg shadow-2xl max-w-2xl text-center border-4 border-white/50", getColors(generatedTicket.tipo).notification)}>
                            <h3 className="text-4xl font-bold">SENHA GERADA</h3>
                             <p className="mt-4 text-9xl font-display font-extrabold tracking-tighter">
                                {generatedTicket.senha}
                            </p>
                            <p className="mt-4 text-2xl font-semibold">
                                Atendimento {generatedTicket.tipoNome}
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
