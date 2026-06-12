'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { TrendingUp, DollarSign, Target, ShoppingBag, Package, AlertTriangle, CheckCircle, XCircle, Building2, Phone, Mail, MapPin, Smartphone } from 'lucide-react';
import { money } from '@/lib/utils';

export default function DashboardPage() {
  const { data: store } = useQuery<any>({
    queryKey: ['store'],
    queryFn: () => axios.get('/api/store').then(r => r.data),
  });

  const { data: products = [] } = useQuery<any[]>({
    queryKey: ['products'],
    queryFn: () => axios.get('/api/products').then(r => r.data),
  });

  const { data: salesData } = useQuery<any>({
    queryKey: ['sales'],
    queryFn: () => axios.get('/api/sales').then(r => r.data),
  });

  const sales = salesData?.sales || [];
  const stats = salesData?.stats;
  const storeName = store?.name;

  const totalRevenue = stats?._sum?.total || 0;
  const totalCost = stats?._sum?.cost || 0;
  const totalProfit = totalRevenue - totalCost;
  const roi = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
  const avgTicket = sales.length > 0 ? totalRevenue / sales.length : 0;
  const totalStock = products.reduce((a: number, p: any) => a + p.stock, 0);
  const stockValue = products.reduce((a: number, p: any) => a + p.stock * p.cost, 0);

  const critical = products.filter((p: any) => p.stock <= 0).length;
  const warning = products.filter((p: any) => p.stock > 0 && p.stock <= p.minStock).length;
  const healthy = products.filter((p: any) => p.stock > p.minStock).length;

  const lowStock = products
    .filter((p: any) => p.stock <= p.minStock)
    .sort((a: any, b: any) => a.stock - b.stock)
    .slice(0, 5);

  if (!salesData) {
    return <div className="p-6 animate-pulse space-y-4"><div className="h-8 bg-slate-200 rounded w-1/3" /><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"><div className="h-28 bg-slate-100 rounded-xl" /><div className="h-28 bg-slate-100 rounded-xl" /><div className="h-28 bg-slate-100 rounded-xl" /><div className="h-28 bg-slate-100 rounded-xl" /></div></div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Store Header */}
      {store?.id && (
        <div className="bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-pink-600/10 rounded-xl border border-purple-500/20 p-5">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                <Building2 size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-theme-primary">{store.name}</h1>
                {store.cnpj && (
                  <p className="text-xs text-theme-muted">CNPJ: {store.cnpj}</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-theme-secondary">
              {store.phone && (
                <span className="flex items-center gap-1.5 bg-theme-container px-3 py-1.5 rounded-lg">
                  <Phone size={12} className="text-purple-500" /> {store.phone}
                </span>
              )}
              {store.whatsapp && (
                <span className="flex items-center gap-1.5 bg-theme-container px-3 py-1.5 rounded-lg">
                  <Smartphone size={12} className="text-emerald-500" /> {store.whatsapp}
                </span>
              )}
              {store.email && (
                <span className="flex items-center gap-1.5 bg-theme-container px-3 py-1.5 rounded-lg">
                  <Mail size={12} className="text-blue-500" /> {store.email}
                </span>
              )}
              {store.city && store.state && (
                <span className="flex items-center gap-1.5 bg-theme-container px-3 py-1.5 rounded-lg">
                  <MapPin size={12} className="text-red-500" /> {store.city}, {store.state}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {!store?.id && (
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-theme-primary">Dashboard</h1>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Receita do Mês', value: money(totalRevenue), sub: `${sales.length} vendas`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Lucro Líquido', value: money(totalProfit), sub: `ROI: ${roi.toFixed(1)}%`, icon: TrendingUp, color: totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600', bg: totalProfit >= 0 ? 'bg-emerald-100' : 'bg-red-100' },
          { label: 'Ticket Médio', value: money(avgTicket), sub: 'Por venda', icon: Target, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Valor em Estoque', value: money(stockValue), sub: `${totalStock} unidades`, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        ].map((k, i) => (
          <div key={i} className="bg-theme-card rounded-xl border border-theme p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-theme-secondary uppercase tracking-wider">{k.label}</span>
              <div className={`w-10 h-10 rounded-lg ${k.bg} flex items-center justify-center`}>
                <k.icon size={18} className={k.color} />
              </div>
            </div>
            <div className="text-2xl font-bold text-theme-primary">{k.value}</div>
            <div className="text-xs text-theme-muted mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Saudável', count: healthy, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Em Atenção', count: warning, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Crítico', count: critical, icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
        ].map((s, i) => (
          <div key={i} className="bg-theme-card rounded-xl border border-theme p-4 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg ${s.bg} flex items-center justify-center`}>
              <s.icon size={20} className={s.color} />
            </div>
            <div>
              <div className="text-xs text-theme-secondary">{s.label}</div>
              <div className="text-xl font-bold text-theme-primary">{s.count}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-theme-card rounded-xl border border-theme p-5 shadow-sm">
          <h3 className="font-semibold text-sm text-theme-secondary mb-4">Vendas Recentes</h3>
          {sales.slice(0, 5).length === 0 ? (
            <div className="text-center py-8 text-theme-muted text-sm">Nenhuma venda registrada</div>
          ) : (
            <div className="space-y-2">
              {sales.slice(0, 5).map((s: any) => (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg bg-theme-container">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate text-theme-primary">{s.product?.name || '—'}</div>
                    <div className="text-xs text-theme-muted">{s.channel} · {new Date(s.date).toLocaleDateString('pt-BR')}</div>
                  </div>
                  <div className="text-sm font-semibold text-emerald-600">{money(s.total)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-theme-card rounded-xl border border-theme p-5 shadow-sm">
          <h3 className="font-semibold text-sm text-theme-secondary mb-4">Produtos em Baixa</h3>
          {lowStock.length === 0 ? (
            <div className="text-center py-8 text-theme-muted text-sm">Tudo saudável!</div>
          ) : (
            <div className="space-y-2">
              {lowStock.map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-theme-container">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate text-theme-primary">{p.name}</div>
                    <div className="text-xs text-theme-muted">SKU: {p.sku}</div>
                  </div>
                  <div className={`text-sm font-semibold ${p.stock <= 0 ? 'text-red-600' : 'text-amber-600'}`}>
                    {p.stock} un
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Store Footer Bar */}
      {store?.id && (
        <div className="flex items-center justify-between px-5 py-3 bg-theme-card rounded-xl border border-theme text-xs text-theme-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Building2 size={12} /> {store.name}
            </span>
            {store.cnpj && <span>CNPJ: {store.cnpj}</span>}
          </div>
          <div className="flex items-center gap-4">
            {store.city && store.state && <span>{store.city} · {store.state}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
