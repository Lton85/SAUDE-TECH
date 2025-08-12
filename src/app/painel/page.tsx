
"use client";

import { useState, useEffect } from 'react';
import { HeartPulse, User, Stethoscope } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { AnimatePresence, motion } from 'framer-motion';
import { getEmpresa } from '@/services/empresaService';
import type { Empresa } from '@/types/empresa';
import { cn } from '@/lib/utils';

interface Call {
  id?: string;
  senha: string;
  departamentoNome: string;
  pacienteNome: string;
  profissionalNome: string;
  atendimentoId?: string;
}

const emptyCall: Call = { senha: '----', departamentoNome: 'Aguardando...', pacienteNome: 'Aguardando paciente...', profissionalNome: 'Aguardando profissional...' };

const HistoryItem = ({ call }: { call: Call }) => (
    <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center p-4 bg-slate-800/50 rounded-lg text-center"
    >
        <p className="text-4xl lg:text-5xl font-bold text-amber-300">{call.senha}</p>
        <p className="text-xl lg:text-2xl font-semibold text-white/80 truncate w-full">{call.departamentoNome}</p>
    </motion.div>
);

export default function PainelPage() {
  const [callHistory, setCallHistory] = useState<Call[]>([]);
  const [razaoSocial, setRazaoSocial] = useState<string>('UNIDADE BÁSICA DE SAÚDE');
  const [time, setTime] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [empresaConfig, setEmpresaConfig] = useState<Empresa | null>(null);

  const currentCall = callHistory[0] || emptyCall;
  const lastCalls = callHistory.slice(1); // Last 4 calls for the history panel

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if(!isClient) return;
    
    const fetchEmpresaConfig = async () => {
        try {
            const empresaData = await getEmpresa();
            setEmpresaConfig(empresaData);
            if (empresaData && empresaData.razaoSocial) {
                setRazaoSocial(empresaData.razaoSocial.toUpperCase());
            }
        } catch (error) {
            console.error("Erro ao buscar dados da empresa:", error);
            // Mantém os valores padrão em caso de erro
        }
    };

    fetchEmpresaConfig();

    setTime(new Date()); 
    const timeInterval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timeInterval);
  }, [isClient]);

  useEffect(() => {
    if(!isClient) return;

    const q = query(collection(db, "chamadas"), orderBy("timestamp", "desc"), limit(5));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const newCalls = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Call));
        
        // Play sound if the latest call is new
        if (callHistory.length > 0 && newCalls.length > 0 && callHistory[0].id !== newCalls[0].id) {
            try {
                const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
                audio.play().catch(error => {
                    // Autoplay was prevented. This is expected before user interaction.
                    // We can console.log for debugging but it's not a critical error.
                    console.warn("Audio play prevented: ", error);
                });
            } catch (error) {
                console.error("Error creating or playing audio:", error);
            }
        }
        
        setCallHistory(newCalls.length > 0 ? newCalls : [emptyCall]);

    }, (error) => {
        console.error("Firebase snapshot error:", error);
        setCallHistory([emptyCall]);
    });

    return () => unsubscribe();
  }, [isClient, callHistory]);
  
  if (!isClient) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-slate-900 font-headline text-white overflow-hidden">
         <div className="w-full h-full bg-slate-800/50 rounded-lg animate-pulse"></div>
       </div>
    );
  }

  const formattedDate = time 
    ? (() => {
        const dateString = time.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
        const parts = dateString.split(' de ');
        return `${parts[0]} de ${parts[1].toUpperCase()} de ${parts[2]}`;
      })()
    : "";

  const showHistory = empresaConfig?.exibirUltimasSenhas ?? true;

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white font-headline select-none">
        <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 lg:p-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentCall.id || 'empty'}
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.9 }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="w-full h-full flex flex-col justify-between bg-slate-950/50 rounded-2xl shadow-2xl p-4 md:p-8"
                    >
                        <div className="text-center flex-1 flex flex-col justify-center">
                            <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold text-amber-400 uppercase tracking-widest">Senha</h2>
                            <p className="font-display font-extrabold text-white tracking-tighter my-2 md:my-4 text-8xl md:text-[12rem] lg:text-[18rem] xl:text-[22rem] 2xl:text-[26rem] leading-none drop-shadow-[0_5px_15px_rgba(0,255,255,0.2)] text-cyan-400">{currentCall.senha}</p>
                            <p className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white/90">{currentCall.departamentoNome}</p>
                        </div>

                        {(currentCall.pacienteNome || currentCall.profissionalNome) && (currentCall.pacienteNome !== '' || currentCall.profissionalNome !== '') && (
                            <div className="flex justify-between items-center border-t-2 border-slate-700/50 pt-4 md:pt-6 mt-4 md:mt-6">
                                {currentCall.pacienteNome && currentCall.pacienteNome !== '' && (
                                    <div className="text-left">
                                        <h3 className="flex items-center gap-2 text-xl md:text-2xl lg:text-3xl font-bold text-amber-400 uppercase"><User className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7"/>Paciente</h3>
                                        <p className="text-2xl md:text-3xl lg:text-4xl font-medium text-white truncate">{currentCall.pacienteNome}</p>
                                    </div>
                                )}
                                {currentCall.profissionalNome && currentCall.profissionalNome !== '' && (
                                    <div className="text-right">
                                        <h3 className="flex items-center justify-end gap-2 text-xl md:text-2xl lg:text-3xl font-bold text-amber-400 uppercase"><Stethoscope className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7"/>Profissional</h3>
                                        <p className="text-2xl md:text-3xl lg:text-4xl font-medium text-white truncate">{currentCall.profissionalNome}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
            
            {showHistory && (
            <aside className={cn(
                "w-full md:w-80 lg:w-96 bg-black/30 p-4 flex flex-col transition-all duration-300",
                 lastCalls.length === 0 ? "md:w-0 md:p-0" : "md:w-80 lg:w-96"
            )}>
                <h3 className="text-3xl font-bold text-amber-400 uppercase text-center mb-4">Últimas Senhas</h3>
                 <AnimatePresence>
                    <div className="flex flex-col gap-4 overflow-hidden">
                        {lastCalls.map((call) => (
                            <HistoryItem key={call.id} call={call} />
                        ))}
                    </div>
                </AnimatePresence>
            </aside>
            )}

        </div>
        
        <footer className="bg-black/50 text-gray-300 p-3 md:p-4 flex justify-between items-center text-base md:text-lg font-sans">
            <div className="flex items-center gap-3">
                <HeartPulse className="h-6 w-6 md:h-7 md:h-7 text-cyan-400" />
                <span className="font-bold">SAÚDE FÁCIL | {razaoSocial}</span>
            </div>
            {time ? (
                <div className="text-right">
                    <p className="font-bold">{formattedDate} | {time.toLocaleTimeString('pt-BR')}</p>
                </div>
            ) : (
                <div className="h-6 w-48 bg-gray-700/80 rounded-md animate-pulse"></div>
            )}
        </footer>
    </div>
  );
}
