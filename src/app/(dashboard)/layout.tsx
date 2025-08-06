
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
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
  Search,
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
import { Input } from "@/components/ui/input";

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
    const [searchTerm, setSearchTerm] = React.useState("");

    const filteredMenuItems = React.useMemo(() => {
        if (!searchTerm) {
            return menuItems;
        }
        return menuItems.filter(item => 
            item.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);
    
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
            <div className="p-2 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:py-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                    <Input 
                        placeholder="Pesquisar..."
                        className="pl-10 group-data-[collapsible=icon]:hidden"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                     <div className="items-center justify-center group-data-[collapsible=icon]:flex hidden">
                        <Search className="h-5 w-5 text-muted-foreground" />
                    </div>
                </div>
            </div>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
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
    const currentItem = menuItems.find(item => item.href !== '/' && pathname.startsWith(item.href));
    if (currentItem) return currentItem.label;
    if (pathname === "/") return "Dashboard";
    return "Saúde Fácil";
  }

  return (
    <SidebarProvider>
      <div className="flex">
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-12 items-center gap-4 border-b bg-card px-6 sticky top-0 z-30">
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
