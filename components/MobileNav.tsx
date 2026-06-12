"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileNav({ className }: { className?: string }) {
  const pathname = usePathname();

  const items = [
    { href: "/dashboard", icon: "dashboard", label: "Início" },
    { href: "/produtos", icon: "inventory_2", label: "Produtos" },
    { href: "/movimentos", icon: "swap_horiz", label: "Mover" },
    { href: "/vendas", icon: "shopping_cart", label: "Vendas" },
    { href: "/menu", icon: "menu", label: "Menu" },
  ];

  return (
    <nav className={`${className} fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface border-t border-outline-variant h-16 pb-safe shadow-sm`}>
      {items.map((item) => {
        const active = pathname.includes(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center px-3 py-1 transition-colors ${
              active ? "text-primary" : "text-on-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-[10px] font-medium uppercase mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
