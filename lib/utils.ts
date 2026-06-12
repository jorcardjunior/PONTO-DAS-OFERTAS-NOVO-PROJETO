import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function money(v: number | null | undefined): string {
  if (v == null || isNaN(v)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}

export function pct(v: number | null | undefined): string {
  if (v == null || isNaN(v)) return "0,0%";
  return v.toFixed(1) + "%";
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("pt-BR");
}

export function getStockHealth(stock: number, minStock: number): "critical" | "warning" | "healthy" {
  if (stock <= 0) return "critical";
  if (stock <= minStock) return "warning";
  return "healthy";
}

export function getStockLabel(health: "critical" | "warning" | "healthy"): string {
  const labels = { critical: "Crítico", warning: "Atenção", healthy: "Saudável" };
  return labels[health];
}

export function getStockColor(health: "critical" | "warning" | "healthy"): string {
  const colors = { critical: "red", warning: "amber", healthy: "emerald" };
  return colors[health];
}
