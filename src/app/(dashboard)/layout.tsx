
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/services/authService';
import { Loader2 } from 'lucide-react';
import DashboardClientLayout from './client-layout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const verifyAuth = () => {
      const user = getCurrentUser();
      if (!user) {
        router.replace('/');
      } else {
        setIsAuthenticated(true);
      }
    };
    verifyAuth();
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
