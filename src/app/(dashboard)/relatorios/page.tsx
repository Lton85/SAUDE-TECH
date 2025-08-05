
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function RelatoriosPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6" />
            <CardTitle>Relatórios</CardTitle>
        </div>
        <CardDescription>
          Área dedicada à visualização e extração de relatórios do sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">
                A funcionalidade de relatórios será implementada aqui.
            </p>
      </CardContent>
    </Card>
  );
}
