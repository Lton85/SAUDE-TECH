
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function ConfiguracoesPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
            <Settings className="h-6 w-6" />
            <CardTitle>Configurações do Sistema</CardTitle>
        </div>
        <CardDescription>
          Ajuste as configurações gerais do sistema nesta área.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">
            A área de configurações será implementada aqui.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
