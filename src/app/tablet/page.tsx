
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { FilaDeEsperaItem } from "@/types/fila";
import { addPreCadastroToFila } from "@/services/filaDeEsperaService";
import { cn } from "@/lib/utils";
import { NotificationDialog, NotificationType } from "@/components/ui/notification-dialog";

interface GeneratedTicket {
    senha: string;
    tipo: FilaDeEsperaItem['classificacao'];
}

const notificationColors: { [key in FilaDeEsperaItem['classificacao']]: string } = {
    Normal: 'bg-green-600',
    Preferencial: 'bg-blue-600',
    Urgência: 'bg-red-600',
};

export default function TabletPage() {
    const [isLoading, setIsLoading] = useState<FilaDeEsperaItem['classificacao'] | null>(null);
    const [generatedTicket, setGeneratedTicket] = useState<GeneratedTicket | null>(null);
    const [notification, setNotification] = useState<{ type: NotificationType; title: string; message: string; } | null>(null);

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

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-slate-900 p-8 text-center overflow-hidden">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                <h1 className="font-display text-6xl md:text-8xl font-extrabold text-amber-400 tracking-tighter uppercase">
                    RETIRE SUA SENHA AQUI
                </h1>
                <p className="mt-2 text-3xl md:text-4xl text-slate-200">
                    Escolha o tipo de atendimento:
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants}>
                    <Card 
                        className="group w-full h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer bg-green-500/10 border-green-500/30"
                        onClick={() => handleSelection('Normal')}
                    >
                        <CardContent className="flex flex-col items-center justify-center p-8 md:p-12 aspect-square">
                            {isLoading === 'Normal' ? <Loader2 className="h-10 w-10 animate-spin text-green-400" /> : <h2 className="text-2xl md:text-4xl font-bold text-green-400">NORMAL</h2>}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants}>
                     <Card 
                        className="group w-full h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer bg-blue-500/10 border-blue-500/30"
                        onClick={() => handleSelection('Preferencial')}
                    >
                        <CardContent className="flex flex-col items-center justify-center p-8 md:p-12 aspect-square">
                           {isLoading === 'Preferencial' ? <Loader2 className="h-10 w-10 animate-spin text-blue-400" /> : (
                                <h2 className="text-2xl md:text-4xl font-bold text-blue-400">PREFERENCIAL</h2>
                           )}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants}>
                     <Card 
                        className="group w-full h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer bg-red-500/10 border-red-500/30"
                        onClick={() => handleSelection('Urgência')}
                    >
                        <CardContent className="flex flex-col items-center justify-center p-8 md:p-12 aspect-square">
                            {isLoading === 'Urgência' ? <Loader2 className="h-10 w-10 animate-spin text-red-400" /> : <h2 className="text-2xl md:text-4xl font-bold text-red-400">URGÊNCIA</h2>}
                        </CardContent>
                    </Card>
                </motion.div>
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
