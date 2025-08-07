
"use client";

import Link from "next/link";
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
  KeyRound,
  Loader2,
  LogOut,
  UserCircle,
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
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { clearPainel } from "@/services/chamadasService";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getEmpresa } from "@/services/empresaService";
import type { Empresa } from "@/types/empresa";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { ExitConfirmationDialog } from "@/components/ui/exit-dialog";
import { logout, getCurrentUser } from "@/services/authService";
import { useRouter } from "next/navigation";


// Import page components dynamically
const DashboardPage = React.lazy(() => import('./page'));
const AtendimentoPage = React.lazy(() => import('./atendimento/page'));
const CadastrosPage = React.lazy(() => import('./cadastros/page'));
const DepartamentosPage = React.lazy(() => import('./triagem/page'));
const RelatoriosPage = React.lazy(() => import('./relatorios/page'));
const EmpresaPage = React.lazy(() => import('./empresa/page'));
const UsuariosPage = React.lazy(() => import('./usuarios/page'));
const ConfiguracoesPage = React.lazy(() => import('./configuracoes/page'));


export const allMenuItems = [
  { id: "/", href: "/", label: "Início", icon: Home, component: DashboardPage, permissionRequired: false },
  { id: "/atendimento", href: "/atendimento", label: "Fila de Atendimento", icon: Clock, component: AtendimentoPage, permissionRequired: true },
  { id: "/cadastros", href: "/cadastros", label: "Cadastros", icon: Users, component: CadastrosPage, permissionRequired: true },
  { id: "/triagem", href: "/triagem", label: "Departamentos", icon: ClipboardList, component: DepartamentosPage, permissionRequired: true },
  { id: "/relatorios", href: "/relatorios", label: "Relatórios", icon: BarChart3, component: RelatoriosPage, permissionRequired: true },
  { id: "painel", href: "/painel", label: "Abrir Painel", icon: Tv2, component: null, target: "_blank", permissionRequired: true },
  { id: "/empresa", href: "/empresa", label: "Empresa", icon: Building, component: EmpresaPage, permissionRequired: true },
  { id: "/usuarios", href: "/usuarios", label: "Usuários", icon: KeyRound, component: UsuariosPage, permissionRequired: true },
  { id: "/configuracoes", href: "/configuracoes", label: "Configurações", icon: Settings, component: ConfiguracoesPage, permissionRequired: true },
  { id: "sair", href: "#", label: "Sair do Sistema", icon: LogOut, component: null, permissionRequired: false },
];

export type Tab = (typeof allMenuItems)[number];

const AppSidebar = ({ onMenuItemClick, activeContentId, menuItems }: { onMenuItemClick: (item: Tab) => void; activeContentId: string; menuItems: Tab[] }) => {
    const { state } = useSidebar();
    const [searchTerm, setSearchTerm] = React.useState("");
    const { toast } = useToast();
    const [isExitDialogOpen, setIsExitDialogOpen] = React.useState(false);
    const router = useRouter();
    const [userName, setUserName] = React.useState<string | null>(null);

    React.useEffect(() => {
        const user = getCurrentUser();
        if (user) {
            setUserName(user.nome);
        }
    }, []);

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
    
    const handleExit = () => {
        setIsExitDialogOpen(true);
    };

    const handleExitConfirm = () => {
        logout();
        router.push('/');
    };

    const filteredMenuItems = React.useMemo(() => {
        if (!searchTerm) {
            return menuItems;
        }
        return menuItems.filter(item => 
            item.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, menuItems]);
    
    const handleButtonClick = (item: Tab) => {
        if (item.id === 'painel') {
            handleOpenPainel();
        } else if (item.id === 'sair') {
            handleExit();
        } else {
            onMenuItemClick(item);
        }
    };
    
    return (
        <>
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
                            onClick={() => handleButtonClick(item)}
                            isActive={activeContentId === item.id}
                            tooltip={{children: item.label, side: "right"}}
                        >
                            <item.icon />
                            <span>{item.label}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarContent>
                <SidebarFooter>
                    <SidebarSeparator />
                     <div className="p-2 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:py-2 flex justify-center">
                        {state === 'expanded' ? (
                            userName ? (
                                <div className="flex items-center gap-2 text-xs text-sidebar-foreground/70 px-2 py-1 bg-sidebar-accent rounded-md">
                                    <UserCircle className="h-4 w-4" />
                                    <span>Usuário: <span className="font-semibold">{userName}</span></span>
                                </div>
                            ) : (
                                <Skeleton className="h-5 w-3/4" />
                            )
                        ) : (
                            <UserCircle className="h-5 w-5 text-sidebar-foreground/70" />
                        )}
                    </div>
                </SidebarFooter>
            </Sidebar>
            <ExitConfirmationDialog
                isOpen={isExitDialogOpen}
                onOpenChange={setIsExitDialogOpen}
                onConfirm={handleExitConfirm}
            />
        </>
    );
}

const DateTimeDisplay = () => {
    const [currentTime, setCurrentTime] = React.useState<Date | null>(null);

    React.useEffect(() => {
        // This useEffect runs only on the client
        setCurrentTime(new Date());
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []); // Empty dependency array ensures this runs once on mount

    if (!currentTime) {
        // Render a placeholder on the server and initial client render
        return <Skeleton className="h-5 w-48" />;
    }

    const formattedDate = format(currentTime, "eeee, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    const formattedTime = format(currentTime, "HH:mm:ss", { locale: ptBR });
    
    return (
        <div className="text-right">
            <p className="text-sm font-semibold capitalize">{formattedDate}</p>
            <p className="text-xs text-muted-foreground">{formattedTime}</p>
        </div>
    );
};


const MainContent = ({ openTabs, activeTab, activeContentId, onTabClick, onTabClose, onMenuItemClick }: { 
    openTabs: Tab[];
    activeTab: string;
    activeContentId: string;
    onTabClick: (tabId: string) => void;
    onTabClose: (tabId: string) => void;
    onMenuItemClick: (item: Tab) => void;
}) => {
  const [empresa, setEmpresa] = React.useState<Empresa | null>(null);
  const [isLoadingEmpresa, setIsLoadingEmpresa] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const fetchEmpresaData = async () => {
        setIsLoadingEmpresa(true);
        try {
            const data = await getEmpresa();
            setEmpresa(data);
        } catch (error) {
            console.error("Failed to fetch empresa data", error);
        } finally {
            setIsLoadingEmpresa(false);
        }
    };
    fetchEmpresaData();
  }, []);

  const handleEmpresaDataChange = (newData: Partial<Empresa>) => {
    setEmpresa(prev => prev ? { ...prev, ...newData } : null);
  };

  const activeComponentInfo = allMenuItems.find(item => item.id === activeContentId);

  const renderComponent = () => {
    if (!activeComponentInfo || !activeComponentInfo.component) {
        if (activeContentId === '/') {
             return React.createElement(DashboardPage, {onCardClick: onMenuItemClick});
        }
        return null;
    }
    const props: any = {};
    if (activeComponentInfo.id === '/empresa') {
        props.onEmpresaDataChange = handleEmpresaDataChange;
        props.empresaData = empresa;
    }
    if (activeComponentInfo.id === '/') {
        props.onCardClick = onMenuItemClick;
    }
    return React.createElement(activeComponentInfo.component, props);
  }

  return (
    <SidebarInset>
      <header className="sticky top-0 z-30 flex flex-col bg-card border-b">
         <div className="flex h-14 items-center justify-between gap-4 px-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden"/>
              {isLoadingEmpresa ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                  <h1 className="text-lg font-semibold text-primary truncate">{empresa?.razaoSocial || "Saúde Fácil"}</h1>
              )}
            </div>
             <DateTimeDisplay />
        </div>
        <nav className="flex-1 h-12 overflow-x-auto border-t">
            <AnimatePresence initial={false}>
                <div className="flex h-full items-end gap-1 px-2">
                    {openTabs.filter(t => t.id !== '/').map(tab => (
                        <motion.div
                            key={tab.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className={cn(
                                "flex items-center h-[calc(100%-4px)] px-4 py-2 rounded-t-md cursor-pointer",
                                activeTab === tab.id
                                    ? "bg-primary text-primary-foreground font-semibold"
                                    : "bg-muted/50 border-transparent hover:bg-muted"
                            )}
                            onClick={() => onTabClick(tab.id)}
                        >
                            <tab.icon className="mr-2 h-4 w-4 shrink-0" />
                            <span className="text-sm whitespace-nowrap">{tab.label}</span>
                             {tab.id !== '/' && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onTabClose(tab.id);
                                    }}
                                    className="ml-2 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </motion.div>
                    ))}
                </div>
            </AnimatePresence>
        </nav>
      </header>
      <main className="flex-1 p-4 bg-background">
        <React.Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div>}>
             {renderComponent()}
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

  const homeDefaultTab = allMenuItems.find(item => item.id === "/")!;
  const [openTabs, setOpenTabs] = React.useState<Tab[]>([homeDefaultTab]);
  const [activeTab, setActiveTab] = React.useState<string>("/");
  const [activeContentId, setActiveContentId] = React.useState<string>("/");
  const [userMenuItems, setUserMenuItems] = React.useState<Tab[]>([]);
  const { toast } = useToast();
  
  React.useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
        if (currentUser.usuario === 'master') {
            setUserMenuItems(allMenuItems);
        } else {
             const userPermissions = currentUser.permissoes || [];
             const allowedMenuItems = allMenuItems.filter(item => 
                !item.permissionRequired || userPermissions.includes(item.id)
            );
            setUserMenuItems(allowedMenuItems);
        }
    }
  }, []);

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

  const handleMenuItemClick = (item: Tab) => {
    if (item.id === 'painel') {
        handleOpenPainel();
        return;
    }
    
    if (item.id === '/') {
        setActiveContentId(item.id);
        setActiveTab(item.id); // Also set the active tab to home
        return;
    }
    
    if (!item.component) return;
    
    if (!openTabs.some(tab => tab.id === item.id)) {
        setOpenTabs(prev => [...prev, item]);
    }
    
    setActiveTab(item.id);
    setActiveContentId(item.id);
  }

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setActiveContentId(tabId);
  }

  const handleTabClose = (tabId: string) => {
    if (tabId === '/') return;

    const closingTabIndex = openTabs.findIndex(tab => tab.id === tabId);
    if (closingTabIndex === -1) return;

    let newActiveTab: Tab | undefined;
    if (activeContentId === tabId) {
        // Find the next logical tab to activate
        newActiveTab = openTabs[closingTabIndex - 1] || openTabs[closingTabIndex + 1];
        if (newActiveTab?.id === '/') {
            newActiveTab = openTabs.filter(t => t.id !== '/' && t.id !== tabId)[0];
        }
    }
    
    const newOpenTabs = openTabs.filter(tab => tab.id !== tabId);
    setOpenTabs(newOpenTabs);
    
    if (newActiveTab) {
        setActiveTab(newActiveTab.id);
        setActiveContentId(newActiveTab.id);
    } else if (newOpenTabs.length > 0 && activeContentId === tabId) {
        setActiveTab(homeDefaultTab.id);
        setActiveContentId(homeDefaultTab.id);
    } else if (newOpenTabs.length === 1 && newOpenTabs[0].id === '/') {
        setActiveTab(homeDefaultTab.id);
        setActiveContentId(homeDefaultTab.id);
    }
  }

  return (
    <SidebarProvider>
      <div className="flex">
        <AppSidebar onMenuItemClick={handleMenuItemClick} activeContentId={activeContentId} menuItems={userMenuItems} />
        <MainContent 
            openTabs={openTabs.filter(tab => tab.id !== '/')} 
            activeTab={activeTab}
            activeContentId={activeContentId}
            onTabClick={handleTabClick}
            onTabClose={handleTabClose}
            onMenuItemClick={handleMenuItemClick}
        />
      </div>
    </SidebarProvider>
  );
}
