"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";
import { EDUGUIA_ROUTES } from "@/lib/auth/eduguia-routes";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  ClipboardList,
  TrendingUp,
  Wrench,
  Menu,
  ChevronLeft,
  LogOut,
  User,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface AppShellProps {
  children: React.ReactNode;
  /** Prefijo para rutas (ej. "/dashboard" para área protegida). */
  basePath?: string;
  navigation?: NavItem[];
  brandTitle?: string;
  brandSubtitle?: string;
  brandLogo?: string;
  /** Tras cerrar sesión (EDUGUIA: /eduguia, campus: /campus/login). */
  logoutPath?: string;
}

export function AppShell({
  children,
  basePath = "/dashboard",
  navigation: navigationOverride,
  brandTitle = "EDUGUIA",
  brandSubtitle = "Plataforma de Inclusión",
  brandLogo = "/logo.jpeg",
  logoutPath = EDUGUIA_ROUTES.login,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { t } = useLanguage();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push(logoutPath);
      router.refresh();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setLoggingOut(false);
    }
  };

  const navigation =
    navigationOverride ??
    [
      { name: t("nav.dashboard"), href: basePath || "/", icon: LayoutDashboard },
      { name: t("nav.assessment"), href: basePath ? `${basePath}/assessment` : "/assessment", icon: ClipboardList },
      { name: t("nav.progress"), href: basePath ? `${basePath}/progress` : "/progress", icon: TrendingUp },
      { name: t("nav.toolkit"), href: basePath ? `${basePath}/toolkit` : "/toolkit", icon: Wrench },
      ...(basePath
        ? [{ name: t("nav.profile"), href: `${basePath}/profile`, icon: User }]
        : []),
    ];

  const NavContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex h-full flex-col">
      <div className={cn(
        "flex items-center gap-3 border-b border-sidebar-border px-4 py-4",
        collapsed && !mobile && "justify-center px-2"
      )}>
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-sidebar-primary">
          <Image src={brandLogo} alt={brandTitle} fill className="object-contain p-0.5" sizes="40px" priority />
        </div>
        {(!collapsed || mobile) && (
          <div className="min-w-0">
            <h1 className="font-semibold text-sidebar-foreground">{brandTitle}</h1>
            <p className="text-xs text-sidebar-foreground/70">{brandSubtitle}</p>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 px-2 py-4">
        <nav aria-label="Main navigation">
          <ul className="space-y-1" role="list">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => mobile && setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                      collapsed && !mobile && "justify-center px-2"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {(!collapsed || mobile) && (
                      <span>{item.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </ScrollArea>

      <div className="border-t border-sidebar-border p-2 space-y-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            void handleLogout();
            if (mobile) setMobileOpen(false);
          }}
          disabled={loggingOut}
          className={cn(
            "w-full text-sidebar-foreground/80 hover:bg-red-500/15 hover:text-red-200",
            collapsed && !mobile ? "justify-center px-2" : "justify-start gap-2"
          )}
          aria-label={t("nav.logout")}
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          {(!collapsed || mobile) && (
            <span>{loggingOut ? t("nav.loggingOut") : t("nav.logout")}</span>
          )}
        </Button>

        {!mobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
            />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden border-r border-sidebar-border bg-sidebar md:flex md:flex-col md:transition-all md:duration-300",
          collapsed ? "md:w-16" : "md:w-64"
        )}
        aria-label="Sidebar"
      >
        <NavContent />
      </aside>

      {/* Mobile Header & Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <div className="flex flex-1 flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <div className="flex items-center gap-2">
              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded">
                <Image src={brandLogo} alt={brandTitle} fill className="object-contain" sizes="32px" priority />
              </div>
              <span className="font-semibold">{brandTitle}</span>
            </div>
          </header>

          <main id="main-content" className="flex-1 overflow-auto bg-background" tabIndex={-1}>
            {children}
          </main>
        </div>

        <SheetContent side="left" className="w-64 bg-sidebar p-0">
          <NavContent mobile />
        </SheetContent>
      </Sheet>
    </div>
  );
}
