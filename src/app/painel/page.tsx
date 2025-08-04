"use client";

import { useState, useEffect } from 'react';
import { HeartPulse } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

interface Call {
  id?: string;
  ticket: string;
  room: string;
  doctor: string;
}

const emptyCall: Call = { ticket: '----', room: '-------', doctor: '-------' };

export default function PainelPage() {
  const [currentCall, setCurrentCall] = useState<Call>(emptyCall);
  const [callHistory, setCallHistory] = useState<Call[]>([]);
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

    const q = query(collection(db, "chamadas"), orderBy("timestamp", "desc"), limit(5));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const calls = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Call));
      
      if (calls.length > 0) {
        const newCall = calls[0];

        // Only trigger animation if it's a new call
        if (newCall.id !== currentCall.id) {
          setCurrentCall(newCall);
          setCallHistory(calls.slice(1)); // The rest are history

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
        setCallHistory([]);
      }
    });

    return () => unsubscribe();
  }, [currentCall.id, isClient]);

  if (!isClient) {
    return (
      <div className="flex h-screen font-headline select-none animate-pulse">
        <main className="flex flex-[3] flex-col items-center justify-center bg-blue-900/90 p-8">
          <div className="w-full text-center">
            <div className="h-24 bg-yellow-300/20 rounded w-3/4 mx-auto"></div>
            <div className="h-80 bg-white/20 rounded w-full my-4"></div>
          </div>
          <div className="flex w-full items-center justify-between">
            <div className="h-16 bg-white/20 rounded w-1/3"></div>
            <div className="h-16 bg-white/20 rounded w-1/3"></div>
          </div>
        </main>
        <aside className="flex flex-[1] flex-col bg-gray-800/90 p-8">
          <div className="h-10 bg-gray-300/20 rounded w-3/4 mx-auto mb-8"></div>
          <div className="flex flex-col gap-6 text-center flex-grow">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg bg-gray-700/50 h-24"></div>
            ))}
          </div>
          <div className="mt-auto flex items-center justify-between pt-8 border-t border-gray-700/50">
            <div className="h-9 w-48 bg-gray-700/50 rounded"></div>
            <div className="flex flex-col items-end">
              <div className="h-9 w-36 bg-gray-700/50 rounded-md"></div>
              <div className="h-6 w-48 bg-gray-700/50 rounded-md mt-2"></div>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="flex h-screen font-headline select-none">
      <main className="flex flex-[3] flex-col items-center justify-center bg-blue-900 p-8 shadow-2xl">
        <div className={`w-full text-center transition-all duration-300 ${isBlinking ? 'animate-pulse' : ''}`}>
          <h2 className="text-8xl lg:text-9xl font-bold text-yellow-300">SENHA</h2>
          <p className="text-[15rem] md:text-[20rem] lg:text-[25rem] leading-none font-black text-white tracking-tighter my-4 drop-shadow-lg">{currentCall.ticket}</p>
        </div>
        <div className="flex w-full items-center justify-between text-5xl lg:text-7xl font-bold text-white">
          <span>{currentCall.room}</span>
          <span className="truncate">{currentCall.doctor}</span>
        </div>
      </main>
      <aside className="flex flex-[1] flex-col bg-gray-800 p-8 border-l-4 border-gray-700">
        <h3 className="text-3xl lg:text-4xl font-bold mb-8 text-center text-gray-300">ÚLTIMAS CHAMADAS</h3>
        <div className="flex flex-col gap-6 text-center flex-grow">
          {callHistory.map((call, index) => (
            <div key={index} className="p-4 rounded-lg bg-gray-700/80 shadow-md">
              <p className="text-4xl lg:text-5xl font-bold text-yellow-300/90">{call.ticket}</p>
              <p className="text-xl lg:text-2xl text-gray-400">{call.room}</p>
            </div>
          ))}
           {callHistory.length === 0 && (
            <div className="flex-grow flex items-center justify-center">
              <p className="text-gray-500">Aguardando chamadas...</p>
            </div>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between text-gray-400 pt-8 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <HeartPulse className="h-9 w-9 text-blue-400" />
            <span className="text-2xl font-bold">Saúde Fácil</span>
          </div>
          <div className="flex flex-col items-end">
            {time ? (
                <>
                    <p className="text-3xl font-mono font-bold">{time.toLocaleTimeString('pt-BR')}</p>
                    <p className="text-lg">{time.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
                </>
            ) : (
                <>
                    <div className="h-9 w-36 bg-gray-700/80 rounded-md animate-pulse"></div>
                    <div className="h-6 w-48 bg-gray-700/80 rounded-md mt-2 animate-pulse"></div>
                </>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
