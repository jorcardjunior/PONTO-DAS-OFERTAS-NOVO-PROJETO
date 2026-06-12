"use client";

import { Store } from "lucide-react";

interface MarketplaceIconProps {
  marketplace: string;
  size?: number;
  className?: string;
  selected?: boolean;
  onClick?: () => void;
}

const marketplaceConfig: Record<string, { label: string; color: string; bg: string }> = {
  Shopee: { label: "Shopee", color: "#ee4d2d", bg: "bg-orange-50" },
  "Mercado Livre": { label: "Mercado Livre", color: "#fff", bg: "bg-yellow-400" },
  Amazon: { label: "Amazon", color: "#ff9900", bg: "bg-black" },
  "Loja Física": { label: "Loja Física", color: "#6366f1", bg: "bg-indigo-50" },
};

function ShopeeIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#ee4d2d" />
      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial">S</text>
    </svg>
  );
}

function MercadoLivreIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#ffe600" />
      <text x="12" y="16" textAnchor="middle" fill="#333" fontSize="8" fontWeight="bold" fontFamily="Arial">ML</text>
    </svg>
  );
}

function AmazonIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#000" />
      <text x="12" y="16" textAnchor="middle" fill="#ff9900" fontSize="10" fontWeight="bold" fontFamily="Arial">AZ</text>
    </svg>
  );
}

function LojaFisicaIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#6366f1" />
      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial">LF</text>
    </svg>
  );
}

export const MARKETPLACES = ["Shopee", "Mercado Livre", "Amazon", "Loja Física"] as const;

export function getMarketplaceColor(marketplace: string): string {
  return marketplaceConfig[marketplace]?.color || "#64748b";
}

export function getMarketplaceBg(marketplace: string): string {
  return marketplaceConfig[marketplace]?.bg || "bg-slate-100";
}

export default function MarketplaceIcon({ marketplace, size = 20, className = "", selected, onClick }: MarketplaceIconProps) {
  const iconSize = size;

  const icon = (() => {
    switch (marketplace) {
      case "Shopee": return <ShopeeIcon size={iconSize} />;
      case "Mercado Livre": return <MercadoLivreIcon size={iconSize} />;
      case "Amazon": return <AmazonIcon size={iconSize} />;
      case "Loja Física": return <LojaFisicaIcon size={iconSize} />;
      default: return (
        <div className="w-5 h-5 rounded bg-theme-container flex items-center justify-center">
          <Store size={12} className="text-theme-muted" />
        </div>
      );
    }
  })();

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
          selected
            ? "ring-2 ring-purple-500 bg-purple-500/10 text-purple-600"
            : "bg-theme-container text-theme-secondary hover:bg-theme-hover"
        } ${className}`}
      >
        {icon}
        <span>{marketplace === "Loja Física" ? "Física" : marketplace}</span>
      </button>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium bg-theme-container text-theme-secondary ${className}`}>
      {icon}
      {marketplace === "Loja Física" ? "Física" : marketplace}
    </span>
  );
}
