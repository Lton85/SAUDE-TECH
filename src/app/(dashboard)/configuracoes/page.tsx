
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
           <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configurações Gerais</CardTitle>
                <CardDescription>Parâmetros principais do sistema.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parâmetro</TableHead>
                      <TableHead>Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Nome da Unidade</TableCell>
                      <TableCell>UBS Central</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell className="font-medium">Horário</TableCell>
                      <TableCell>08:00 - 17:00</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell className="font-medium">Admin E-mail</TableCell>
                      <TableCell>admin@saudefacil.com</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
           </Card>
        </div>
        <div className="md:col-span-2 flex items-center justify-center h-full border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">
                Outras configurações serão implementadas aqui.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
