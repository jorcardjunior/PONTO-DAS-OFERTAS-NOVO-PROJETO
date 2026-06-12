"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useTheme } from "@/lib/ThemeContext";

const navItems = [
  { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/produtos", icon: "inventory_2", label: "Produtos" },
  { href: "/categorias", icon: "tags", label: "Categorias" },
  { href: "/fornecedores", icon: "local_shipping", label: "Fornecedores" },
  { href: "/vendas", icon: "shopping_cart", label: "Vendas" },
  { href: "/movimentos", icon: "swap_horiz", label: "Movimentos" },
  { href: "/relatorios", icon: "analytics", label: "Relatórios" },
  { href: "/configuracoes", icon: "settings", label: "Configurações" },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDark = theme === "dark";
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

  return (
    <aside className={`${className} flex-col py-6 bg-theme-surface border-r border-theme transition-colors`}>
      <div className="px-6 mb-8">
        <h1 className={`text-lg font-bold ${isDark ? 'text-purple-400' : 'text-primary'}`}>
          Ponto das Ofertas
        </h1>
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const active = pathname.includes(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? isDark
                    ? "bg-purple-500/20 text-purple-300 font-semibold"
                    : "bg-primary-container text-on-primary-container font-semibold"
                  : "text-theme-secondary hover:bg-theme-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-sm">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full flex items-center justify-center font-bold ${
              isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
            }`}>
              {userInitial}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-theme-primary">{userName}</p>
          <p className="text-xs text-theme-muted">v1.0.4</p>
        </div>
      </div>
    </aside>
  );
}
