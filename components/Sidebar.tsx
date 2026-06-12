"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Package, Tags, Truck, ShoppingCart,
  ArrowLeftRight, BarChart3, Settings, ChevronLeft, ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/produtos", icon: Package, label: "Produtos" },
  { href: "/categorias", icon: Tags, label: "Categorias" },
  { href: "/fornecedores", icon: Truck, label: "Fornecedores" },
  { href: "/vendas", icon: ShoppingCart, label: "Vendas" },
  { href: "/movimentos", icon: ArrowLeftRight, label: "Movimentos" },
  { href: "/relatorios", icon: BarChart3, label: "Relatórios" },
  { href: "/configuracoes", icon: Settings, label: "Configurações" },
];

function NavItem({
  item, active, collapsed,
}: {
  item: typeof navItems[0];
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
        collapsed && "justify-center px-2",
        active
          ? "bg-primary/10 text-primary"
          : "text-theme-secondary hover:text-theme-primary hover:bg-theme-hover",
      )}
    >
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-primary" />
      )}
      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200",
        active ? "bg-primary/15" : "",
      )}>
        <Icon size={collapsed ? 18 : 18} strokeWidth={active ? 2.5 : 1.5} />
      </div>
      {!collapsed && (
        <span className="text-sm font-medium">{item.label}</span>
      )}
    </Link>
  );
}

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { data: session } = useSession();

  const { data: profile } = useQuery<any>({
    queryKey: ["user-profile-sidebar"],
    queryFn: () => axios.get("/api/auth/profile").then((r) => r.data),
    enabled: !!session?.user,
    staleTime: 60000,
  });

  const avatarUrl = profile?.avatar || "";
  const userName = profile?.name || session?.user?.name || "Usuário";
  const userInitial = userName.charAt(0).toUpperCase();
  const userRole = profile?.role === "admin" ? "Admin" : "Usuário";

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className={cn(
        className,
        "relative flex flex-col bg-theme-card border-r border-theme overflow-hidden",
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 pt-5 pb-4">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles size={16} className="text-on-primary" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-theme-primary">
                  Ponto das Ofertas
                </h1>
                <p className="text-[10px] text-theme-muted font-medium tracking-wide">Sistema de Gestão</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-theme-muted hover:text-theme-primary hover:bg-theme-hover transition-all"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className="flex flex-col gap-0.5 px-2 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname.includes(item.href);
            return (
              <NavItem key={item.href} item={item} active={active} collapsed={collapsed} />
            );
          })}
        </nav>

        <div className="mx-2 mb-3 mt-2 p-2.5 rounded-lg bg-theme-container">
          <Link href="/configuracoes" className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-theme">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                  {userInitial}
                </div>
              )}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-theme-primary truncate">
                  {userName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-medium text-theme-muted uppercase tracking-wider">
                    {userRole}
                  </span>
                </div>
              </div>
            )}
          </Link>
        </div>
      </div>
    </motion.aside>
  );
}
