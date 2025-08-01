"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock } from "lucide-react";

const initialSessions = [
  { patient: "João da Silva", doctor: "Dr. Ricardo Alves", room: "Sala 01", startTime: new Date(Date.now() - 5 * 60 * 1000) },
  { patient: "Maria Oliveira", doctor: "Dra. Ana Costa", room: "Sala 02", startTime: new Date(Date.now() - 12 * 60 * 1000) },
  { patient: "Carlos Pereira", doctor: "Dr. Lucas Martins", room: "Sala 03", startTime: new Date(Date.now() - 25 * 60 * 1000) },
];

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function SessionCard({ session }: { session: typeof initialSessions[0] }) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const updateElapsedTime = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - session.startTime.getTime()) / 1000);
      setElapsedTime(diff);
    };

    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 1000);
    return () => clearInterval(interval);
  }, [session.startTime]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{session.patient}</CardTitle>
        <CardDescription>{session.doctor} - {session.room}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-2 text-2xl font-bold font-mono text-primary-foreground bg-primary/90 p-4 rounded-b-lg">
        <Clock className="h-6 w-6" />
        <span>{formatDuration(elapsedTime)}</span>
      </CardContent>
    </Card>
  );
}

export default function AtendimentoPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Render skeleton or null on the server
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted-foreground/20 rounded w-3/4"></div>
                <div className="h-4 bg-muted-foreground/20 rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent className="h-16 bg-muted/50 rounded-b-lg"></CardContent>
            </Card>
          ))}
        </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {initialSessions.map((session, index) => (
        <SessionCard key={index} session={session} />
      ))}
       {initialSessions.length === 0 && (
          <Card className="col-span-full flex items-center justify-center p-8 border-dashed">
            <p className="text-muted-foreground">Nenhum atendimento em andamento.</p>
          </Card>
        )}
    </div>
  );
}
