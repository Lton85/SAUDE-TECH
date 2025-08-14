
"use client";

import Link from "next/link";
import * as React from "react";
import {
  Home,
  Users,
  ClipboardList,
  Clock,
  Tv2,
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
  Tablet,
  Lock,
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
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getEmpresa, onEmpresaSnapshot } from "@/services/empresaService";
import type { Empresa } from "@/types/empresa";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { ExitConfirmationDialog } from "@/components/ui/exit-dialog";
import { logout, getCurrentUser } from "@/services/authService";
import { useRouter } from "next/navigation";
import { getAtendimentosPendentes } from "@/services/filaDeEsperaService";
import { NotificationDialog, NotificationType } from "@/components/ui/notification-dialog";
import { CustomLogo } from "@/components/ui/custom-logo";


// Import page components dynamically
const DashboardPage = React.lazy(() => import('./page'));
const AtendimentosPage = React.lazy(() => import('./atendimento/page'));
const CadastrosPage = React.lazy(() => import('./cadastros/page'));
const ProdutividadePage = React.lazy(() => import('./produtividade/page'));
const RelatoriosPage = React.lazy(() => import('./relatorios/page'));
const EmpresaPage = React.lazy(() => import('./empresa/page'));
const UsuariosPage = React.lazy(() => import('./usuarios/page'));
const ConfiguracoesPage = React.lazy(() => import('./configuracoes/page'));


export const allMenuItems = [
  { id: "/", href: "/", label: "Início", icon: Home, component: DashboardPage, permissionRequired: false },
  { 
    id: "/atendimento", 
    href: "/atendimento", 
    label: "Atendimentos", 
    icon: Clock, 
    component: AtendimentosPage, 
    permissionRequired: true,
    subItems: [
      { id: '/atendimento/pendentes', label: 'Senhas Pendentes', permissionRequired: true },
      { id: '/atendimento/em-triagem', label: 'Em Triagem', permissionRequired: true },
      { id: '/atendimento/fila-atendimento', label: 'Fila de Atendimento', permissionRequired: true },
      { id: '/atendimento/em-andamento', label: 'Em Andamento', permissionRequired: true },
      { id: '/atendimento/finalizados', label: 'Finalizados', permissionRequired: true },
    ]
  },
  { id: "painel", href: "/painel", label: "Abrir Painel", icon: Tv2, component: null, target: "_blank", permissionRequired: true },
  { id: "tablet", href: "/tablet", label: "Tablet", icon: Tablet, component: null, target: "_blank", permissionRequired: true },
  { 
    id: "/cadastros", 
    href: "/cadastros", 
    label: "Cadastros", 
    icon: Users, 
    component: CadastrosPage, 
    permissionRequired: true,
    subItems: [
      { id: '/cadastros/pacientes', label: 'Pacientes', permissionRequired: true },
      { id: '/cadastros/profissionais', label: 'Profissionais', permissionRequired: true },
      { id: '/cadastros/departamentos', label: 'Departamentos', permissionRequired: true },
    ]
  },
  { id: "/produtividade", href: "/produtividade", label: "Produtividade", icon: BarChart3, component: ProdutividadePage, permissionRequired: true },
  { id: "/relatorios", href: "/relatorios", label: "Relatórios", icon: ClipboardList, component: RelatoriosPage, permissionRequired: true },
  { id: "/empresa", href: "/empresa", label: "Empresa", icon: Building, component: EmpresaPage, permissionRequired: true },
  { id: "/usuarios", href: "/usuarios", label: "Usuários", icon: KeyRound, component: UsuariosPage, permissionRequired: true },
  { id: "/configuracoes", href: "/configuracoes", label: "Configurações", icon: Settings, component: ConfiguracoesPage, permissionRequired: true },
  { id: "sair", href: "#", label: "Sair do Sistema", icon: LogOut, component: null, permissionRequired: false },
];

export type Tab = (typeof allMenuItems)[number] & { 
    notificationCount?: number; 
    hasPermission?: boolean;
    subItems?: Omit<Tab, 'icon'|'component'|'subItems'>[];
};

const AppSidebar = ({ onMenuItemClick, activeContentId, menuItems, onNotification, empresa }: { onMenuItemClick: (item: Tab) => void; activeContentId: string; menuItems: Tab[]; onNotification: (notification: { type: NotificationType; title: string; message: string; }) => void; empresa: Empresa | null; }) => {
    const { state } = useSidebar();
    const [searchTerm, setSearchTerm] = React.useState("");
    const [isExitDialogOpen, setIsExitDialogOpen] = React.useState(false);
    const router = useRouter();
    const [userName, setUserName] = React.useState<string | null>(null);

    React.useEffect(() => {
        const user = getCurrentUser();
        if (user) {
            setUserName(user.nome);
        }
    }, []);

    const handleOpenInNewTab = async (url: string) => {
        if (url === '/painel') {
            try {
                await clearPainel();
                window.open(url, "_blank");
            } catch (error) {
                onNotification({
                    type: "error",
                    title: "Erro ao abrir o painel",
                    message: "Não foi possível limpar o painel antes de abrir.",
                });
            }
        } else {
            window.open(url, "_blank");
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
        if (!item.hasPermission) return;
        
        if (item.target === '_blank' && item.href) {
            handleOpenInNewTab(item.href);
        } else if (item.id === 'sair') {
            handleExit();
        } else {
            onMenuItemClick(item);
        }
    };
    
    return (
        <>
            <Sidebar collapsible="icon">
              <SidebarHeader className="flex flex-col items-center justify-center text-center p-4 gap-2">
                 <Link href="/" className="flex flex-col items-center w-full" onClick={(e) => {
                    e.preventDefault();
                    const homeItem = allMenuItems.find(item => item.id === "/");
                    if (homeItem) {
                      handleButtonClick(homeItem as Tab);
                    }
                }}
>
                    <CustomLogo className="h-12 w-12 text-primary" />
                    <div className="duration-200 group-data-[collapsible=icon]:hidden w-full">
                        <h1 className="text-xl font-bold font-headline mt-1">SAÚDE TECH</h1>
                    </div>
                </Link>
                <SidebarTrigger className="hidden md:flex h-7 w-7" />
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
                  {filteredMenuItems.map((item) => {
                    if (!item.hasPermission) {
                        return null; // Don't render if no permission
                    }
                    return (
                        <SidebarMenuItem key={item.id}>
                            <SidebarMenuButton
                                onClick={() => handleButtonClick(item)}
                                isActive={activeContentId === item.id}
                                tooltip={{children: item.label, side: "right"}}
                            >
                                <item.icon />
                                <span>{item.label}</span>
                                {item.notificationCount && item.notificationCount > 0 && (
                                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
                                        {item.notificationCount}
                                    </span>
                                )}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                  })}
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


const MainContent = ({ openTabs, activeTab, activeContentId, onTabClick, onTabClose, onMenuItemClick, empresa, isLoadingEmpresa }: { 
    openTabs: Tab[];
    activeTab: string;
    activeContentId: string;
    onTabClick: (tabId: string) => void;
    onTabClose: (tabId: string) => void;
    onMenuItemClick: (item: Tab) => void;
    empresa: Empresa | null;
    isLoadingEmpresa: boolean;
}) => {
  const router = useRouter();

  const activeComponentInfo = allMenuItems.find(item => item.id === activeContentId);

  const renderComponent = () => {
    if (!activeComponentInfo || !activeComponentInfo.component) {
        return React.createElement(DashboardPage, {onCardClick: onMenuItemClick});
    }

    const props: any = {};
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
                  <h1 className="text-lg font-semibold text-primary truncate">{empresa?.razaoSocial || "Saúde Tech"}</h1>
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
  const [notification, setNotification] = React.useState<{ type: NotificationType; title: string; message: string; } | null>(null);
  const [empresa, setEmpresa] = React.useState<Empresa | null>(null);
  const [isLoadingEmpresa, setIsLoadingEmpresa] = React.useState(true);
  
  React.useEffect(() => {
    setIsLoadingEmpresa(true);
    const unsubscribe = onEmpresaSnapshot(
      (data) => {
        setEmpresa(data);
        setIsLoadingEmpresa(false);
      },
      (error) => {
        console.error("Failed to fetch empresa data", error);
        setIsLoadingEmpresa(false);
      }
    );
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
        if (currentUser.usuario === 'master') {
             const itemsWithPermission = allMenuItems.map(item => ({ ...item, hasPermission: true }));
            setUserMenuItems(itemsWithPermission);
            return;
        }

        const userPermissions = new Set(currentUser.permissoes || []);

        const menuItemsWithPermissions = allMenuItems.map(item => {
            let hasPermission = false;
            if (!item.permissionRequired) {
                hasPermission = true;
            } else if (item.subItems) {
                // Parent item has permission if any sub-item has permission
                hasPermission = item.subItems.some(sub => userPermissions.has(sub.id));
            } else {
                hasPermission = userPermissions.has(item.id);
            }
            return { ...item, hasPermission };
        });
        
        setUserMenuItems(menuItemsWithPermissions);
    }
}, []);


  // Effect to check for pending appointments and update notifications
    React.useEffect(() => {
        const unsubscribe = getAtendimentosPendentes((pendentes) => {
            const sortedPendentes = pendentes.sort((a, b) => {
                if (a.chegadaEm && b.chegadaEm) {
                    return a.chegadaEm.toDate().getTime() - b.chegadaEm.toDate().getTime();
                }
                return 0;
            });

            setUserMenuItems(prevItems => prevItems.map(item => {
                if (item.id === '/atendimento') {
                    return { ...item, notificationCount: sortedPendentes.length };
                }
                return item;
            }));
        }, (error) => {
            console.error("Failed to get pending appointments for notification:", error);
        });

        return () => unsubscribe();
    }, []);

  const handleOpenInNewTab = async (url: string) => {
    if (url === '/painel') {
        try {
            await clearPainel();
            window.open(url, "_blank");
        } catch (error) {
            setNotification({
                type: "error",
                title: "Erro ao abrir o painel",
                message: "Não foi possível limpar o painel antes de abrir.",
            });
        }
    } else {
        window.open(url, "_blank");
    }
  };

  const handleMenuItemClick = (item: Tab) => {
    // Lista de IDs que correspondem aos cards de acesso rápido
    const quickAccessCardIds = ["/atendimento", "painel", "tablet", "/cadastros", "/produtividade", "/relatorios"];

    // Verifica a permissão SOMENTE se o item NÃO for um card de acesso rápido
    if (!item.hasPermission && !quickAccessCardIds.includes(item.id)) return;

    if (item.target === '_blank' && item.href) {
        handleOpenInNewTab(item.href);
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

  const handleTabClose = (tabIdToClose: string) => {
    // Prevent closing the home tab if it's the only one
    if (tabIdToClose === '/' && openTabs.length === 1) return;

    let newActiveId = activeContentId;
    const closingTabIndex = openTabs.findIndex(t => t.id === tabIdToClose);

    // If the closed tab was the active one, find a new active tab
    if (activeContentId === tabIdToClose) {
        if (closingTabIndex > 0) {
            // Sane fallback to the tab on the left
            newActiveId = openTabs[closingTabIndex - 1].id;
        } else {
            // Sane fallback to the home tab if the first tab is closed
            newActiveId = '/';
        }
    }

    const newTabs = openTabs.filter(tab => tab.id !== tabIdToClose);
    
    setOpenTabs(newTabs);
    setActiveTab(newActiveId);
    setActiveContentId(newActiveId);
  }


  return (
    <SidebarProvider>
      <div className="flex">
        <AppSidebar onMenuItemClick={handleMenuItemClick} activeContentId={activeContentId} menuItems={userMenuItems} onNotification={setNotification} empresa={empresa} />
        <MainContent 
            openTabs={openTabs.filter(tab => tab.id !== '/')} 
            activeTab={activeTab}
            activeContentId={activeContentId}
            onTabClick={handleTabClick}
            onTabClose={handleTabClose}
            onMenuItemClick={handleMenuItemClick}
            empresa={empresa}
            isLoadingEmpresa={isLoadingEmpresa}
        />
        {notification && (
          <NotificationDialog
            type={notification.type}
            title={notification.title}
            message={notification.message}
            onOpenChange={() => setNotification(null)}
          />
        )}
      </div>
    </SidebarProvider>
  );
}
