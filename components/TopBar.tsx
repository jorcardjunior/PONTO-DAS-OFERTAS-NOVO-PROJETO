"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { LogOut, Sun, Moon, Monitor, User } from "lucide-react";
import { useTheme, type ThemeMode } from "@/lib/ThemeContext";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/produtos": "Produtos",
  "/categorias": "Categorias",
  "/fornecedores": "Fornecedores",
  "/vendas": "Vendas",
  "/movimentos": "Movimentações",
  "/relatorios": "Relatórios",
  "/configuracoes": "Configurações",
  "/checkout": "Checkout",
  "/planos": "Planos",
  "/onboarding": "Onboarding",
  "/termos": "Termos",
  "/menu": "Menu",
};

const themeIcons: Record<ThemeMode, typeof Sun> = {
  dark: Moon,
  light: Sun,
  normal: Monitor,
};

export function TopBar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const ThemeIcon = themeIcons[theme];

  // Extrai o path relativo ignorando o locale
  const segments = pathname?.split("/") || [];
  const relativePath = "/" + (segments.slice(2).join("/") || "");
  const pageTitle = pageTitles[relativePath] || "Dashboard";

  const { data: session } = useSession();

  const { data: profile } = useQuery<any>({
    queryKey: ["user-profile"],
    queryFn: () => axios.get("/api/auth/profile").then((r) => r.data),
    enabled: !!session?.user,
    staleTime: 60000,
  });

  const avatarUrl = profile?.avatar || "";
  const userName = profile?.name || session?.user?.name || "Usuário";
  const userEmail = profile?.email || session?.user?.email || "";
  const userInitial = userName.charAt(0).toUpperCase();

  const { data: alerts } = useQuery<any>({
    queryKey: ["low-stock-alerts"],
    queryFn: () => axios.get("/api/products/low-stock").then((r) => r.data),
    refetchInterval: 30000, // Re-fetch a cada 30s
  });

  const totalAlerts = alerts?.total || 0;
  const hasCritical = (alerts?.critical || 0) > 0;

  // Fecha dropdowns ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full h-14 px-6 flex items-center justify-between bg-theme-surface border-b border-theme transition-colors">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-theme-primary">{pageTitle}</h2>
      </div>
      <div className="flex items-center gap-3">
        {/* Notificações de Estoque */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className={`relative p-2 rounded-full transition-colors ${
              hasCritical
                ? "text-red-500 hover:bg-red-50"
                : totalAlerts > 0
                ? "text-amber-500 hover:bg-amber-50"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined text-sm">notifications</span>
            {totalAlerts > 0 && (
              <span
                className={`absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white ${
                  hasCritical ? "bg-red-500" : "bg-amber-500"
                }`}
              >
                {totalAlerts > 9 ? "9+" : totalAlerts}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-theme-card rounded-xl border border-theme shadow-xl overflow-hidden z-50">
              <div className="p-3 border-b border-theme">
                <h3 className="text-sm font-bold text-theme-primary">Alertas de Estoque</h3>
              </div>
              {alerts?.products?.length > 0 ? (
                <div className="max-h-72 overflow-y-auto">
                  {alerts.products.map((p: any) => (
                    <Link
                      key={p.id}
                      href={`/produtos`}
                      onClick={() => setNotifOpen(false)}
                      className="flex items-center gap-3 p-3 hover:bg-theme-hover transition-colors border-b border-theme last:border-0"
                    >
                      {p.image ? (
                        <img src={p.image} className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-theme-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-xs text-theme-muted">inventory_2</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-theme-primary">{p.name}</p>
                        <p className="text-xs text-theme-muted">SKU: {p.sku}</p>
                      </div>
                      <div
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          p.stock <= 0
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {p.stock} un
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-theme-muted">
                  <span className="material-symbols-outlined text-2xl block mb-1">check_circle</span>
                  Tudo saudável!
                </div>
              )}
              <div className="p-2 border-t border-theme">
                <Link
                  href={`/produtos`}
                  onClick={() => setNotifOpen(false)}
                  className="block w-full text-center text-xs text-blue-400 hover:underline py-1"
                >
                  Ver todos os produtos
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Alternador de Tema */}
        <button
          onClick={() => {
            const modes: ThemeMode[] = ["dark", "light", "normal"];
            const idx = modes.indexOf(theme);
            setTheme(modes[(idx + 1) % modes.length]);
          }}
          className="relative p-2 rounded-full text-theme-muted hover:bg-theme-container-high transition-colors"
          title={`Tema: ${theme === "dark" ? "Escuro" : theme === "light" ? "Claro" : "Normal"}`}
        >
          <ThemeIcon size={16} />
        </button>

        {/* Menu do Usuário */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold hover:opacity-80 transition-opacity cursor-pointer overflow-hidden"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center">
                {userInitial}
              </div>
            )}
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-theme-card rounded-xl border border-theme shadow-xl overflow-hidden z-50">
              <div className="p-3 border-b border-theme">
                <p className="text-sm font-bold text-theme-primary">{userName}</p>
                <p className="text-xs text-theme-muted">{userEmail}</p>
              </div>
              <Link
                href="/configuracoes"
                onClick={() => setUserMenuOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-theme-primary hover:bg-theme-hover transition-colors"
              >
                <User size={15} />
                Configurações
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/pt/login" })}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors font-medium"
              >
                <LogOut size={15} />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
