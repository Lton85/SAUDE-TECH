
"use client";

import { useState, useEffect } from 'react';
import { HeartPulse, PlayCircle, User, Stethoscope, DoorOpen } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { AnimatePresence, motion } from 'framer-motion';
import { getEmpresa } from '@/services/empresaService';

interface Call {
  id?: string;
  senha: string;
  departamentoNome: string;
  pacienteNome: string;
  profissionalNome: string;
  atendimentoId?: string;
}

const emptyCall: Call = { senha: '----', departamentoNome: 'Aguardando...', pacienteNome: 'Aguardando paciente...', profissionalNome: 'Aguardando profissional...' };

export default function PainelPage() {
  const [currentCall, setCurrentCall] = useState<Call>(emptyCall);
  const [razaoSocial, setRazaoSocial] = useState<string>('UNIDADE BÁSICA DE SAÚDE');
  const [time, setTime] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if(!isClient) return;
    
    const fetchRazaoSocial = async () => {
        try {
            const empresaData = await getEmpresa();
            if (empresaData && empresaData.razaoSocial) {
                setRazaoSocial(empresaData.razaoSocial.toUpperCase());
            }
        } catch (error) {
            console.error("Erro ao buscar razão social:", error);
            // Mantém o valor padrão em caso de erro
        }
    };

    fetchRazaoSocial();

    setTime(new Date()); 
    const timeInterval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timeInterval);
  }, [isClient]);

  useEffect(() => {
    if(!isClient) return;

    const q = query(collection(db, "chamadas"), orderBy("timestamp", "desc"), limit(1));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const newCall = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Call;
        
        if (hasInteracted && currentCall.id !== newCall.id && newCall.id) {
            try {
                const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
                audio.play();
            } catch (error) {
                console.error("Error playing sound:", error);
            }
        }
        setCurrentCall(newCall);
      } else {
        setCurrentCall(emptyCall);
      }
    }, (error) => {
        console.error("Firebase snapshot error:", error);
        setCurrentCall(emptyCall);
    });

    return () => unsubscribe();
  }, [isClient, hasInteracted, currentCall.id]);
  
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

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white font-headline select-none">
        
        <main className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentCall.id || 'empty'}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.9 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="w-full h-full flex flex-col justify-between bg-slate-950/50 rounded-2xl shadow-2xl p-8"
                >
                    <div className="text-center flex-1 flex flex-col justify-center">
                        <h2 className="text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] font-bold text-amber-400 uppercase tracking-widest">Senha</h2>
                        <p className="font-display font-extrabold text-white tracking-tighter my-4 text-8xl md:text-9xl lg:text-[12rem] xl:text-[16rem] 2xl:text-[20rem] leading-none drop-shadow-[0_5px_15px_rgba(0,255,255,0.2)] text-cyan-400">{currentCall.senha}</p>
                        <p className="text-6xl md:text-7xl lg:text-9xl xl:text-[10rem] font-semibold text-white/90">{currentCall.departamentoNome}</p>
                    </div>

                    {(currentCall.pacienteNome || currentCall.profissionalNome) && (currentCall.pacienteNome !== '' || currentCall.profissionalNome !== '') && (
                        <div className="flex justify-between items-center border-t-2 border-slate-700/50 pt-6 mt-6">
                            {currentCall.pacienteNome && currentCall.pacienteNome !== '' && (
                                <div className="text-left">
                                    <h3 className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-amber-400 uppercase"><User className="w-6 h-6 md:w-7 md:h-7"/>Paciente</h3>
                                    <p className="text-3xl md:text-4xl font-medium text-white truncate">{currentCall.pacienteNome}</p>
                                </div>
                            )}
                            {currentCall.profissionalNome && currentCall.profissionalNome !== '' && (
                                <div className="text-right">
                                    <h3 className="flex items-center justify-end gap-2 text-2xl md:text-3xl font-bold text-amber-400 uppercase"><Stethoscope className="w-6 h-6 md:w-7 md:h-7"/>Profissional</h3>
                                    <p className="text-3xl md:text-4xl font-medium text-white truncate">{currentCall.profissionalNome}</p>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </main>
        
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

    