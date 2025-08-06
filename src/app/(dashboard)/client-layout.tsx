
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
  Building,
  X,
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
import { clearPainel } from "@/services/chamadasService";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Import page components dynamically
const DashboardPage = React.lazy(() => import('./page'));
const AtendimentoPage = React.lazy(() => import('./atendimento/page'));
const CadastrosPage = React.lazy(() => import('./cadastros/page'));
const DepartamentosPage = React.lazy(() => import('./triagem/page'));
const RelatoriosPage = React.lazy(() => import('./relatorios/page'));
const EmpresaPage = React.lazy(() => import('./empresa/page'));
const ConfiguracoesPage = React.lazy(() => import('./configuracoes/page'));


const menuItems = [
  { id: "/", href: "/", label: "Início", icon: Home, component: DashboardPage },
  { id: "/atendimento", href: "/atendimento", label: "Fila de Atendimento", icon: Clock, component: AtendimentoPage },
  { id: "/cadastros", href: "/cadastros", label: "Cadastros", icon: Users, component: CadastrosPage },
  { id: "/triagem", href: "/triagem", label: "Departamentos", icon: ClipboardList, component: DepartamentosPage },
  { id: "/relatorios", href: "/relatorios", label: "Relatórios", icon: BarChart3, component: RelatoriosPage },
  { id: "/empresa", href: "/empresa", label: "Empresa", icon: Building, component: EmpresaPage },
  { id: "/configuracoes", href: "/configuracoes", label: "Configurações", icon: Settings, component: ConfiguracoesPage },
  { id: "painel", href: "/painel", label: "Abrir Painel", icon: Tv2, component: null },
];

type Tab = (typeof menuItems)[number];

const AppSidebar = ({ onMenuItemClick }: { onMenuItemClick: (item: Tab) => void; }) => {
    const { state } = useSidebar();
    const [searchTerm, setSearchTerm] = React.useState("");
    const { toast } = useToast();

    const handleOpenPainel = async () => {
        try {
            await clearPainel();
            window.open("/painel", "_blank");
        } catch (error) {
            toast({
                title: "Erro ao abrir o painel",
                description: "Não foi possível limpar o painel antes de abrir.",
                variant: "destructive",
            });
        }
    };

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
                <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                        onClick={item.id === 'painel' ? handleOpenPainel : () => onMenuItemClick(item)}
                        tooltip={{children: item.label, side: "right"}}
                    >
                        <item.icon />
                        <span>{item.label}</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
    );
}

const MainContent = ({ openTabs, activeTab, onTabClick, onTabClose }: { 
    openTabs: Tab[];
    activeTab: string;
    onTabClick: (tabId: string) => void;
    onTabClose: (tabId: string) => void;
}) => {
  const activeComponent = menuItems.find(item => item.id === activeTab)?.component;

  return (
    <SidebarInset>
      <header className="flex h-12 items-center gap-4 border-b bg-card px-2 sticky top-0 z-30">
        <SidebarTrigger className="md:hidden"/>
        <nav className="flex-1 h-full overflow-x-auto">
            <AnimatePresence initial={false}>
                <div className="flex h-full items-end gap-1">
                    {openTabs.map(tab => (
                        <motion.div
                            key={tab.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className={cn(
                                "flex items-center h-[calc(100%-4px)] px-3 rounded-t-md border-b-2 cursor-pointer",
                                activeTab === tab.id
                                    ? "bg-primary/10 border-primary text-primary font-semibold"
                                    : "bg-muted/50 border-transparent hover:bg-muted"
                            )}
                            onClick={() => onTabClick(tab.id)}
                        >
                            <tab.icon className="mr-2 h-4 w-4 shrink-0" />
                            <span className="text-sm whitespace-nowrap">{tab.label}</span>
                            
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onTabClose(tab.id);
                                    }}
                                    className="ml-2 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                           
                        </motion.div>
                    ))}
                </div>
            </AnimatePresence>
        </nav>
      </header>
      <main className="flex-1 p-2 bg-background">
        <React.Suspense fallback={<div className="p-4">Carregando...</div>}>
            {activeComponent && React.createElement(activeComponent)}
        </React.Suspense>
      </main>
    </SidebarInset>
  );
}


export default function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [openTabs, setOpenTabs] = React.useState<Tab[]>([]);
  const [activeTab, setActiveTab] = React.useState<string>("/");

  const handleMenuItemClick = (item: Tab) => {
    // If 'Início' is clicked, reset to the main dashboard view
    if (item.id === '/') {
        setOpenTabs([]);
        setActiveTab('/');
        return;
    }
    // If tab is not open, add it
    if (!openTabs.some(tab => tab.id === item.id)) {
        setOpenTabs(prev => [...prev, item]);
    }
    // Set the clicked tab as active
    setActiveTab(item.id);
  }

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  }

  const handleTabClose = (tabId: string) => {
    const closingTabIndex = openTabs.findIndex(tab => tab.id === tabId);
    if (closingTabIndex === -1) return;

    // Set new active tab before removing the old one
    if (activeTab === tabId) {
        // Find the next available tab to activate.
        // Prefer the tab to the left (previous), if not, the one to the right.
        const newActiveTab = openTabs[closingTabIndex - 1] || openTabs[closingTabIndex + 1];
        if (newActiveTab) {
            setActiveTab(newActiveTab.id);
        } else {
            // If no other tabs, go back to home/dashboard view
            setActiveTab('/');
        }
    }
    
    // Remove the closed tab
    setOpenTabs(prev => prev.filter(tab => tab.id !== tabId));
  }

  return (
    <SidebarProvider>
      <div className="flex">
        <AppSidebar onMenuItemClick={handleMenuItemClick} />
        <MainContent 
            openTabs={openTabs} 
            activeTab={activeTab}
            onTabClick={handleTabClick}
            onTabClose={handleTabClose}
        />
      </div>
    </SidebarProvider>
  );
}
