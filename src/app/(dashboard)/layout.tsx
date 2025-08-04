"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  ClipboardList,
  Clock,
  Tv2,
  HeartPulse,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const menuItems = [
  { href: "/", label: "Início", icon: Home, target: "_self" },
  { href: "/cadastros", label: "Cadastros", icon: Users, target: "_self" },
  { href: "/triagem", label: "Departamentos", icon: ClipboardList, target: "_self" },
  { href: "/atendimento", label: "Fila de Atendimento", icon: Clock, target: "_self" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === '/atendimento') {
      return "Fila de Atendimento";
    }

    const currentPath = "/" + (pathname.split('/')[1] || "");
    const currentItem = menuItems.find(item => item.href === currentPath);
    
    if (currentItem) {
      return currentItem.label;
    }
    
    if (pathname === "/") return "Dashboard";

    return "Saúde Fácil";
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/" className="flex items-center gap-2">
            <HeartPulse className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold font-headline">Saúde Fácil</h1>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
               <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={item.href === "/" ? pathname === item.href : pathname.startsWith(item.href)}
                >
                  <Link href={item.href} target={item.target}>
                    <item.icon />
                    {item.label}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
             <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith('/painel')}
                >
                  <Link href={'/painel'} target={'_blank'}>
                    <Tv2 />
                    {'Abrir Painel'}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card px-6 sticky top-0 z-30">
          <SidebarTrigger className="md:hidden"/>
          <h1 className="flex-1 text-lg font-semibold md:text-xl font-headline">
            {getPageTitle()}
          </h1>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
