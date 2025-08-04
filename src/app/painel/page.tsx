
"use client";

import { useState, useEffect } from 'react';
import { HeartPulse, PlayCircle, User, Stethoscope, DoorOpen } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Call {
  id?: string;
  senha: string;
  departamentoNome: string;
  pacienteNome: string;
  profissionalNome: string;
}

const emptyCall: Call = { senha: '----', departamentoNome: 'Aguardando...', pacienteNome: 'Aguardando paciente...', profissionalNome: 'Aguardando profissional...' };

export default function PainelPage() {
  const [callHistory, setCallHistory] = useState<Call[]>([]);
  const [time, setTime] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const currentCall = callHistory[0] || emptyCall;
  const previousCalls = callHistory.slice(1, 5);


  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if(!isClient) return;

    setTime(new Date()); 
    const timeInterval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timeInterval);
  }, [isClient]);

  useEffect(() => {
    if(!isClient || !hasInteracted) return;

    const q = query(collection(db, "chamadas"), orderBy("timestamp", "desc"), limit(5));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newCalls = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Call));
      
       const latestCall = newCalls.length > 0 ? newCalls[0] : emptyCall;
       const currentLatestCall = callHistory.length > 0 ? callHistory[0] : emptyCall;

        if (latestCall.id !== currentLatestCall.id && latestCall.id) {
            try {
                const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
                audio.play();
            } catch (error) {
                console.error("Error playing sound:", error);
            }
        }
      
      setCallHistory(newCalls);

    }, (error) => {
        console.error("Firebase snapshot error:", error);
        setCallHistory([emptyCall]);
    });

    return () => unsubscribe();
  }, [isClient, hasInteracted, callHistory]);
  
  const handleInteraction = () => {
    setHasInteracted(true);
  };

  if (!isClient) {
    return (
       <div className="flex h-screen bg-slate-900 font-headline text-white overflow-hidden">
            <div className="flex-1 p-8 flex flex-col items-center justify-center animate-pulse">
                <div className="w-full h-1/2 bg-slate-800/50 rounded-lg"></div>
                <div className="w-full h-1/4 bg-slate-800/50 rounded-lg mt-8"></div>
            </div>
            <div className="w-1/3 bg-slate-950/50 p-8 space-y-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-slate-800/50 rounded-lg"></div>
                ))}
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white font-headline select-none">
        
        {!hasInteracted && (
             <div className="absolute inset-0 z-50 bg-black/70 flex flex-col items-center justify-center backdrop-blur-sm">
                <div className="text-center">
                    <h1 className="text-5xl font-bold text-white mb-4">Bem-vindo ao Painel</h1>
                    <p className="text-xl text-white/80 mb-8">Clique para iniciar e habilitar as notificações sonoras.</p>
                    <button
                        onClick={handleInteraction}
                        className="flex items-center gap-3 bg-amber-400 text-slate-900 font-bold text-xl px-8 py-4 rounded-full shadow-lg hover:bg-amber-300 transition-all transform hover:scale-105"
                    >
                        <PlayCircle className="h-8 w-8" />
                        Iniciar Painel
                    </button>
                </div>
            </div>
        )}

        <main className="flex flex-1 overflow-hidden">
            {/* Main Call Section */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12">
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={currentCall.id || 'empty'}
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.9 }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="w-full h-full flex flex-col justify-center bg-slate-950/50 rounded-2xl shadow-2xl p-8"
                    >
                        <div className="text-center flex-1 flex flex-col justify-center">
                            <h2 className="text-5xl md:text-6xl font-bold text-amber-400 uppercase tracking-widest">Senha</h2>
                            <p className="font-black text-white tracking-tighter my-4 text-8xl md:text-9xl lg:text-[12rem] xl:text-[16rem] 2xl:text-[20rem] leading-none drop-shadow-[0_5px_15px_rgba(0,255,255,0.2)] text-cyan-400">{currentCall.senha}</p>
                            <p className="text-5xl md:text-7xl font-semibold text-white/90 uppercase">{currentCall.departamentoNome}</p>
                        </div>

                         <div className="flex justify-between items-center border-t-2 border-slate-700/50 pt-6 mt-6">
                            <div className="text-left">
                                <h3 className="flex items-center gap-2 text-xl md:text-2xl font-bold text-amber-400 uppercase"><User className="w-5 h-5"/>Paciente</h3>
                                <p className="text-2xl md:text-3xl font-medium text-white truncate">{currentCall.pacienteNome}</p>
                            </div>
                            <div className="text-right">
                                <h3 className="flex items-center justify-end gap-2 text-xl md:text-2xl font-bold text-amber-400 uppercase"><Stethoscope className="w-5 h-5"/>Profissional</h3>
                                <p className="text-2xl md:text-3xl font-medium text-white truncate">{currentCall.profissionalNome}</p>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
            
            {/* History Section */}
            <aside className="w-full md:w-1/3 lg:w-1/4 bg-slate-950/50 h-full flex flex-col p-4">
                <h3 className="text-2xl font-bold text-center text-amber-400 p-4">ÚLTIMAS CHAMADAS</h3>
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
                    <AnimatePresence>
                        {previousCalls.map((call, index) => (
                            <motion.div
                                key={call.id}
                                layout
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className={cn(
                                    "p-4 rounded-lg shadow-md border-l-4",
                                    call.id === currentCall.id ? "bg-amber-400/10 border-amber-400" : "bg-slate-800/60 border-slate-600"
                                )}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-4xl font-bold text-cyan-400">{call.senha}</span>
                                    <span className="text-lg font-semibold uppercase">{call.departamentoNome}</span>
                                </div>
                                <p className="text-lg text-white/80 truncate mt-2">{call.pacienteNome}</p>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </aside>
        </main>
        
        <footer className="bg-black/50 text-gray-300 p-3 md:p-4 flex justify-between items-center text-base md:text-lg font-sans">
            <div className="flex items-center gap-3">
                <HeartPulse className="h-6 w-6 md:h-7 md:w-7 text-cyan-400" />
                <span className="font-bold">SAÚDE FÁCIL | UNIDADE BÁSICA DE SAÚDE</span>
            </div>
            {time ? (
                <div className="text-right">
                    <p className="font-bold">{time.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })} - {time.toLocaleTimeString('pt-BR')}</p>
                </div>
            ) : (
                <div className="h-6 w-48 bg-gray-700/80 rounded-md animate-pulse"></div>
            )}
        </footer>
    </div>
  );
}
