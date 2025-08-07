
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { KeyRound } from "lucide-react";

export default function UsuariosPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
            <KeyRound className="h-6 w-6" />
            <CardTitle>Gerenciamento de Usuários</CardTitle>
        </div>
        <CardDescription>
          Esta área é destinada ao gerenciamento de usuários do sistema. (Em desenvolvimento)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>A funcionalidade de gerenciamento de usuários será implementada aqui.</p>
      </CardContent>
    </Card>
  );
}
