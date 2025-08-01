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
  SidebarFooter,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const menuItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/cadastros", label: "Cadastros", icon: Users },
  { href: "/triagem", label: "Triagem", icon: ClipboardList },
  { href: "/atendimento", label: "Atendimento", icon: Clock },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard";
    const current = menuItems.find(item => pathname.startsWith(item.href) && item.href !== '/');
    if (current) return current.label;
    if (pathname.startsWith("/cadastros")) return "Cadastros";
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
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                >
                  <Link href={item.href}>
                    <item.icon />
                    {item.label}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <SidebarMenu>
             <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/painel" target="_blank">
                    <Tv2 />
                    Abrir Painel
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>
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
