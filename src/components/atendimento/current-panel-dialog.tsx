
"use client"

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Tv2, User, Stethoscope } from "lucide-react";
import { getChamadasRealtime, Chamada } from "@/services/chamadasService";
import { motion, AnimatePresence } from "framer-motion";

const emptyCall: Chamada = { senha: '----', departamentoNome: 'Aguardando...', pacienteNome: '', profissionalNome: '' };

const HistoryItem = ({ call }: { call: Chamada }) => (
    <motion.div
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center p-2 bg-slate-800/50 rounded-lg text-center"
    >
        <p className="text-xl font-bold text-amber-300">{call.senha}</p>
        <p className="text-xs text-white/80 truncate w-full">{call.departamentoNome}</p>
    </motion.div>
);

export function CurrentPanelDialog({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (isOpen: boolean) => void; }) {
    const [calls, setCalls] = useState<Chamada[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            const unsubscribe = getChamadasRealtime(
                (data) => {
                    setCalls(data);
                    setIsLoading(false);
                },
                (err) => {
                    setError(err);
                    setIsLoading(false);
                }
            );
            return () => unsubscribe();
        }
    }, [isOpen]);

    const latestCall = calls[0] || emptyCall;
    const historyCalls = calls.slice(1);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent 
                className="max-w-4xl bg-slate-900 border-slate-700 text-white" 
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-400">
                        <Tv2 />
                        Painel de Atendimento (Em Tempo Real)
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Esta é uma visualização ao vivo do que está sendo exibido no painel de senhas para a TV.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-96">
                            <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-96 text-red-400">
                            <p>Erro ao carregar dados: {error}</p>
                        </div>
                    ) : (
                        <div className="flex gap-4 h-[50vh]">
                            <main className="flex-1 flex flex-col items-center justify-center">
                                <div
                                    className="w-full h-full flex flex-col justify-between bg-slate-950/50 rounded-lg shadow-lg p-4"
                                >
                                    <div className="text-center flex-1 flex flex-col justify-center">
                                        <h2 className="text-4xl font-bold text-amber-400 uppercase tracking-widest">Senha</h2>
                                        <p className="font-display font-extrabold text-white my-2 text-8xl leading-none text-cyan-400">{latestCall.senha}</p>
                                        {latestCall.departamentoNome && (
                                            <p className="text-3xl font-semibold text-white/90">{latestCall.departamentoNome}</p>
                                        )}
                                    </div>

                                    {(latestCall.pacienteNome || latestCall.profissionalNome) && (
                                        <div className="flex justify-between items-center border-t-2 border-slate-700/50 pt-4 mt-4">
                                            {latestCall.pacienteNome && (
                                                <div className="text-left">
                                                    <h3 className="flex items-center gap-2 text-lg font-bold text-amber-400 uppercase"><User className="w-5 h-5"/>Paciente</h3>
                                                    <p className="text-xl font-medium text-white truncate">{latestCall.pacienteNome}</p>
                                                </div>
                                            )}
                                            {latestCall.profissionalNome && (
                                                <div className="text-right">
                                                    <h3 className="flex items-center justify-end gap-2 text-lg font-bold text-amber-400 uppercase"><Stethoscope className="w-5 h-5"/>Profissional</h3>
                                                    <p className="text-xl font-medium text-white truncate">{latestCall.profissionalNome}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </main>
                            
                            <aside className="w-48 bg-black/30 p-2 flex flex-col rounded-lg">
                                <h3 className="text-lg font-bold text-amber-400 uppercase text-center mb-2">Últimas</h3>
                                <AnimatePresence>
                                    <div className="flex flex-col gap-2 overflow-hidden">
                                        {historyCalls.map((call) => (
                                            <HistoryItem key={call.id} call={call} />
                                        ))}
                                    </div>
                                </AnimatePresence>
                            </aside>
                        </div>
                    )}
                </div>

                <DialogFooter className="sm:justify-end">
                    <Button type="button" className="bg-green-600 hover:bg-green-700" onClick={() => onOpenChange(false)}>
                        Fechar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
