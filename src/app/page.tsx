
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { login, checkAuth } from '@/services/authService';
import { Loader2, LogIn } from 'lucide-react';
import { NotificationDialog, NotificationType } from '@/components/ui/notification-dialog';
import { CustomLogo } from '@/components/ui/custom-logo';

export default function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [codigoCliente, setCodigoCliente] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [notification, setNotification] = useState<{ type: NotificationType; title: string; message: string; } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
        if (checkAuth()) {
            router.replace('/atendimento');
        } else {
            setIsCheckingAuth(false);
        }
    };
    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(usuario, senha, codigoCliente);
      // O redirecionamento é feito dentro do serviço de login agora
    } catch (error) {
      setNotification({
        type: 'error',
        title: 'Erro de Autenticação',
        message: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-2">
                <CustomLogo className="h-14 w-14 text-primary" />
            </div>
          <CardTitle className="text-2xl">Saúde Tech</CardTitle>
          <CardDescription>Acesse sua conta para continuar</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="codigoCliente">Código do Cliente</Label>
                <Input
                id="codigoCliente"
                value={codigoCliente}
                onChange={(e) => setCodigoCliente(e.target.value)}
                placeholder="Digite o código do cliente"
                required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="usuario">Usuário</Label>
                <Input
                id="usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Digite seu usuário"
                required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                required
                />
            </div>
            </CardContent>
            <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                Entrar
            </Button>
            </CardFooter>
        </form>
      </Card>
      {notification && (
        <NotificationDialog
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onOpenChange={() => setNotification(null)}
        />
      )}
    </div>
  );
}
