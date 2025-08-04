
"use client";

import { useState, useEffect } from 'react';
import { HeartPulse } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

interface Call {
  id?: string;
  ticket: string;
  room: string;
  patientName: string;
  doctor: string;
}

const emptyCall: Call = { ticket: '----', room: '-------', patientName: 'Aguardando paciente...', doctor: 'Aguardando profissional...' };

export default function PainelPage() {
  const [currentCall, setCurrentCall] = useState<Call>(emptyCall);
  const [isBlinking, setIsBlinking] = useState(false);
  const [time, setTime] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);

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
    if(!isClient) return;

    const q = query(collection(db, "chamadas"), orderBy("timestamp", "desc"), limit(1));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const calls = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Call));
      
      if (calls.length > 0) {
        const newCall = calls[0];

        // Only trigger animation if it's a new call
        if (newCall.id !== currentCall.id) {
          setCurrentCall(newCall);
          
          setIsBlinking(true);
          try {
            const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
            audio.play();
          } catch (error) {
            console.error("Error playing sound:", error);
          }
          setTimeout(() => setIsBlinking(false), 2500);
        }
      } else {
        setCurrentCall(emptyCall);
      }
    });

    return () => unsubscribe();
  }, [currentCall.id, isClient]);

  if (!isClient) {
    return (
       <div className="flex flex-col h-screen bg-blue-900 text-white font-headline select-none">
            <main className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-pulse">
                <div className="h-16 bg-yellow-300/20 rounded w-1/4 mx-auto mb-4"></div>
                <div className="h-64 bg-white/20 rounded w-3/4 my-4"></div>
                <div className="h-10 bg-white/20 rounded w-1/3 mx-auto mt-4"></div>
                <div className="flex-grow"></div>
                <div className="flex justify-between w-full mt-8">
                    <div className="w-1/3 h-20 bg-white/20 rounded"></div>
                    <div className="w-1/3 h-20 bg-white/20 rounded"></div>
                </div>
            </main>
            <footer className="bg-black text-gray-300 p-4 flex justify-between items-center text-lg">
                <div className="h-6 bg-gray-700/50 rounded w-1/4"></div>
                <div className="h-6 bg-gray-700/50 rounded w-1/4"></div>
            </footer>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-blue-900 text-white font-headline select-none">
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className={`w-full transition-all duration-300 ${isBlinking ? 'animate-pulse' : ''}`}>
                <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold text-yellow-400 uppercase tracking-widest">Senha</h2>
                <p className="text-[12rem] md:text-[16rem] lg:text-[22rem] leading-none font-black text-white tracking-tighter my-2 drop-shadow-lg">{currentCall.ticket}</p>
                <p className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white/90">{currentCall.room}</p>
            </div>
            
            <div className="flex-grow"></div>

            <div className="flex flex-col items-center justify-center w-full mt-8 text-center">
                <div className="mb-6">
                    <h3 className="text-2xl md:text-3xl font-bold text-yellow-400 uppercase">Paciente</h3>
                    <p className="text-3xl md:text-4xl font-medium text-white truncate">{currentCall.patientName}</p>
                </div>
                 <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-yellow-400 uppercase">Profissional</h3>
                    <p className="text-3xl md:text-4xl font-medium text-white truncate">{currentCall.doctor}</p>
                </div>
            </div>
        </main>
        <footer className="bg-black text-gray-300 p-3 md:p-4 flex justify-between items-center text-base md:text-lg font-sans">
            <div className="flex items-center gap-3">
                <HeartPulse className="h-6 w-6 md:h-7 md:w-7 text-blue-400" />
                <span className="font-bold">UNIDADE BÁSICA DE SAÚDE</span>
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
