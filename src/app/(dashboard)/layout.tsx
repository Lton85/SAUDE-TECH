
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
  Settings,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
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
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/atendimento", label: "Fila de Atendimento", icon: Clock },
  { href: "/cadastros", label: "Cadastros", icon: Users },
  { href: "/triagem", label: "Departamentos", icon: ClipboardList },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
  { href: "/painel", label: "Abrir Painel", icon: Tv2, target: "_blank" as const },
];

const AppSidebar = () => {
    const { state } = useSidebar();
    
    return (
        <Sidebar collapsible="icon">
          <SidebarHeader className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <HeartPulse className="h-8 w-8 text-primary" />
              <div className="duration-200 group-data-[collapsible=icon]:opacity-0">
                  <h1 className="text-xl font-bold font-headline">Saúde Fácil</h1>
              </div>
            </Link>
             <SidebarTrigger className="hidden md:flex h-7 w-7">
                {state === 'expanded' ? <PanelLeftClose /> : <PanelLeftOpen />}
             </SidebarTrigger>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={usePathname() === "/" ? usePathname() === item.href : usePathname().startsWith(item.href)}
                    tooltip={{children: item.label, side: "right"}}
                  >
                    <Link href={item.href} {...(item.target && { target: item.target })}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
    );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getPageTitle = () => {
    // Check for exact match or child routes for title
    const currentItem = menuItems.find(item => item.href !== '/' && pathname.startsWith(item.href));
    if (currentItem) return currentItem.label;

    // Handle root dashboard page
    if (pathname === "/") return "Dashboard";
    
    // Fallback title
    return "Saúde Fácil";
  }

  return (
    <SidebarProvider>
      <div className="flex">
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 items-center gap-4 border-b bg-card px-6 sticky top-0 z-30">
            <SidebarTrigger className="md:hidden"/>
            <h1 className="flex-1 text-lg font-semibold md:text-xl font-headline">
              {getPageTitle()}
            </h1>
          </header>
          <main className="flex-1 p-2">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
