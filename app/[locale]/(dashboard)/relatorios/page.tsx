'use client';

import { useState, useMemo } from 'react';
import {
  TrendingUp, DollarSign, Target, ShoppingBag, Info, FileDown,
  BarChart3, PieChart, Package, ArrowUpRight, ArrowDownRight,
  Activity, RefreshCw, Building2, Phone, Mail, MapPin, Smartphone,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { money, pct } from '@/lib/utils';import { AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const CHANNEL_COLORS: Record<string, string> = {
  Shopee: '#ee4d2d',
  'Mercado Livre': '#ffe600',
  Amazon: '#ff9900',
  'Loja Física': '#6366f1',
};

export default function RelatoriosPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const { data: store } = useQuery<any>({
    queryKey: ['store'],
    queryFn: () => axios.get('/api/store').then(r => r.data),
    staleTime: 60000,
  });

  const { data: products = [] } = useQuery<any[]>({
    queryKey: ['products'],
    queryFn: () => axios.get('/api/products').then(r => r.data),
    refetchInterval: 30000,
  });

  const { data: salesData, isFetching } = useQuery<any>({
    queryKey: ['sales'],
    queryFn: () => axios.get('/api/sales').then(r => r.data),
    refetchInterval: 15000,
  });

  const sales = salesData?.sales || [];
  const stats = salesData?.stats;

  const totalRevenue = stats?._sum?.total || 0;
  const totalCost = stats?._sum?.cost || 0;
  const totalProfit = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const roi = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
  const avgTicket = sales.length > 0 ? totalRevenue / sales.length : 0;
  const stockValue = products.reduce((a: number, p: any) => a + p.stock * p.cost, 0);
  const critical = products.filter((p: any) => p.stock <= 0).length;
  const totalProducts = products.length;

  // Filtra vendas por período
  const now = new Date();
  const periodMap = { '7d': 7, '30d': 30, '90d': 90 };
  const days = periodMap[period];
  const cutoff = new Date(now.getTime() - days * 86400000);
  const filteredSales = sales.filter((s: any) => new Date(s.date) >= cutoff);

  // --- Gráfico 1: Receita por dia (Line Chart) ---
  const dailyRevenue = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of filteredSales) {
      const day = new Date(s.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      map.set(day, (map.get(day) || 0) + s.total);
    }
    return Array.from(map.entries())
      .map(([date, revenue]) => ({ date, receita: revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredSales]);

  // --- Gráfico 2: Vendas por canal (Pie Chart) ---
  const channelData = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of filteredSales) {
      const ch = s.channel || 'Loja Física';
      map.set(ch, (map.get(ch) || 0) + s.total);
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value, color: CHANNEL_COLORS[name] || '#64748b' }))
      .sort((a, b) => b.value - a.value);
  }, [filteredSales]);

  // --- Gráfico 3: Top produtos (Bar Chart) ---
  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const s of filteredSales) {
      const key = s.product?.id || 'unknown';
      const existing = map.get(key) || { name: s.product?.name || '—', qty: 0, revenue: 0 };
      existing.qty += s.quantity;
      existing.revenue += s.total;
      map.set(key, existing);
    }
    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)
      .map((p, i) => ({ ...p, cor: `hsl(${i * 35}, 70%, 50%)` }));
  }, [filteredSales]);

  // --- Gráfico 4: Vendas ao longo do tempo com área ---
  const totalSalesCount = filteredSales.length;

  // KPIs com variação
  const prevCutoff = new Date(cutoff.getTime() - days * 86400000);
  const prevSales = sales.filter((s: any) => {
    const d = new Date(s.date);
    return d >= prevCutoff && d < cutoff;
  });
  const prevRevenue = prevSales.reduce((a: number, s: any) => a + s.total, 0);
  const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

  function exportCSV(headers: string[], data: string[][], filename: string, prefixLines?: string[]) {
    const prefix = prefixLines ? [...prefixLines, ''] : [];
    const csv = [...prefix, headers.join(';'), ...data.map(r => r.join(';'))].join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  function storePrefix() {
    const lines: string[] = [];
    if (store?.name) lines.push(`Loja: ${store.name}`);
    if (store?.cnpj) lines.push(`CNPJ: ${store.cnpj}`);
    if (store?.phone) lines.push(`Telefone: ${store.phone}`);
    if (store?.email) lines.push(`Email: ${store.email}`);
    if (store?.city && store?.state) lines.push(`Cidade: ${store.city} - ${store.state}`);
    if (lines.length > 0) lines.push('');
    return lines;
  }

  function exportStockReport() {
    const headers = ['Nome', 'SKU', 'Categoria', 'Custo', 'Preço', 'Qtd', 'Min', 'Valor Estoque'];
    const data = products.map((p: any) => [p.name, p.sku, p.category?.name || '', p.cost.toString(), p.price.toString(), p.stock.toString(), p.minStock.toString(), (p.stock * p.cost).toFixed(2)]);
    exportCSV(headers, data, 'estoque.csv', storePrefix());
  }

  function exportSalesReport() {
    const headers = ['Data', 'Produto', 'Canal', 'Qtd', 'Preço', 'Total', 'Custo', 'Lucro'];
    const data = filteredSales.map((s: any) => [new Date(s.date).toLocaleDateString('pt-BR'), s.product?.name || '', s.channel, s.quantity.toString(), s.price.toString(), s.total.toFixed(2), s.cost.toFixed(2), (s.total - s.cost).toFixed(2)]);
    exportCSV(headers, data, 'vendas.csv', storePrefix());
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-theme-card border border-theme rounded-xl p-3 shadow-xl text-sm">
          <p className="text-theme-primary font-medium mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color }} className="font-semibold">
              {p.name}: {p.name === 'qty' ? `${p.value} un` : money(p.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">
            {store?.name ? `${store.name} — ` : ''}Relatórios Executivos
          </h1>
          <p className="text-xs text-theme-muted mt-1">
            {filteredSales.length} vendas nos últimos {days} dias · Atualizado em tempo real
            {store?.cnpj && ` · CNPJ: ${store.cnpj}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Seletor de período */}
          <div className="flex bg-theme-container rounded-lg p-0.5">
            {(['7d', '30d', '90d'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  period === p
                    ? 'bg-purple-500/20 text-purple-600 shadow-sm'
                    : 'text-theme-secondary hover:text-theme-primary'
                }`}
              >
                {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : '90 dias'}
              </button>
            ))}
          </div>
          {isFetching && <RefreshCw size={14} className="animate-spin text-theme-muted" />}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Receita Total', value: money(totalRevenue),
            change: revenueChange, icon: DollarSign,
            color: 'text-emerald-500', bg: 'from-emerald-500/10 to-emerald-500/5',
          },
          {
            label: 'Lucro Líquido', value: money(totalProfit),
            change: margin, icon: TrendingUp,
            color: totalProfit >= 0 ? 'text-emerald-500' : 'text-red-500',
            bg: totalProfit >= 0 ? 'from-emerald-500/10 to-emerald-500/5' : 'from-red-500/10 to-red-500/5',
          },
          {
            label: 'Margem Média', value: `${margin.toFixed(1)}%`,
            change: roi, icon: Target,
            color: margin >= 20 ? 'text-amber-500' : margin >= 10 ? 'text-blue-500' : 'text-red-500',
            bg: 'from-amber-500/10 to-amber-500/5',
          },
          {
            label: 'Ticket Médio', value: money(avgTicket),
            change: 0, icon: ShoppingBag,
            color: 'text-blue-500', bg: 'from-blue-500/10 to-blue-500/5',
          },
        ].map((k, i) => (
          <div key={i} className="bg-theme-card rounded-xl border border-theme p-5 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-theme-secondary uppercase tracking-wider">{k.label}</span>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${k.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <k.icon size={18} className={k.color} />
              </div>
            </div>
            <div className="text-2xl font-bold text-theme-primary">{k.value}</div>
            {k.change !== 0 && (
              <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${k.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {k.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(k.change).toFixed(1)}% vs período anterior
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Linha 1: Gráfico de Receita + Canal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-theme-card rounded-xl border border-theme p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-theme-secondary flex items-center gap-2">
              <Activity size={14} className="text-purple-500" />
              Receita Diária
            </h3>
            {dailyRevenue.length > 0 && (
              <span className="text-xs text-theme-muted">
                Total: {money(dailyRevenue.reduce((a, d) => a + d.receita, 0))}
              </span>
            )}
          </div>
          <div className="h-72">
            {dailyRevenue.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyRevenue} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="receitaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" opacity={0.4} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `R$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="receita" stroke="#a855f7" strokeWidth={2} fill="url(#receitaGrad)" dot={false} activeDot={{ r: 4, fill: '#a855f7' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-theme-muted text-sm">
                {dailyRevenue.length === 1 ? 'Apenas 1 dia com dados' : 'Nenhuma venda no período'}
              </div>
            )}
          </div>
        </div>

        <div className="bg-theme-card rounded-xl border border-theme p-5 shadow-sm">
          <h3 className="font-semibold text-sm text-theme-secondary flex items-center gap-2 mb-4">
            <PieChart size={14} className="text-purple-500" />
            Vendas por Canal
          </h3>
          <div className="h-72 flex items-center justify-center">
            {channelData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {channelData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value: string) => (
                      <span className="text-xs text-theme-secondary">{value}</span>
                    )}
                  />
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-theme-muted text-sm text-center">
                <PieChart size={32} className="mx-auto mb-2 opacity-40" />
                Nenhum dado
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Linha 2: Top Produtos + Estoques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-theme-card rounded-xl border border-theme p-5 shadow-sm">
          <h3 className="font-semibold text-sm text-theme-secondary flex items-center gap-2 mb-4">
            <BarChart3 size={14} className="text-purple-500" />
            Top Produtos por Receita
          </h3>
          <div className="h-72">
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" opacity={0.3} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `R$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]} maxBarSize={20}>
                    {topProducts.map((entry, i) => (
                      <Cell key={i} fill={entry.cor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-theme-muted text-sm">
                <BarChart3 size={32} className="mr-2 opacity-40" />
                Nenhum dado
              </div>
            )}
          </div>
        </div>

        <div className="bg-theme-card rounded-xl border border-theme p-5 shadow-sm">
          <h3 className="font-semibold text-sm text-theme-secondary flex items-center gap-2 mb-4">
            <Package size={14} className="text-purple-500" />
            Status do Estoque
          </h3>
          <div className="h-72 flex flex-col justify-center gap-4 px-4">
            {[
              {
                label: 'Produtos Cadastrados', value: totalProducts,
                sub: `Valor total: ${money(stockValue)}`,
                color: 'text-blue-500', progress: 100,
              },
              {
                label: 'Saudável', value: products.filter((p: any) => p.stock > p.minStock).length,
                sub: `${((products.filter((p: any) => p.stock > p.minStock).length / Math.max(totalProducts, 1)) * 100).toFixed(0)}% do total`,
                color: 'text-emerald-500', progress: (products.filter((p: any) => p.stock > p.minStock).length / Math.max(totalProducts, 1)) * 100,
              },
              {
                label: 'Em Atenção', value: products.filter((p: any) => p.stock > 0 && p.stock <= p.minStock).length,
                sub: 'Estoque abaixo do mínimo',
                color: 'text-amber-500', progress: (products.filter((p: any) => p.stock > 0 && p.stock <= p.minStock).length / Math.max(totalProducts, 1)) * 100,
              },
              {
                label: 'Crítico', value: critical,
                sub: 'Estoque zerado',
                color: 'text-red-500', progress: (critical / Math.max(totalProducts, 1)) * 100,
              },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-theme-secondary">{item.label}</span>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
                    <span className="text-xs text-theme-muted ml-2">{item.sub}</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-theme-container rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${item.color.replace('text-', 'bg-')}`}
                    style={{ width: `${Math.min(item.progress, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Exportar Relatórios */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">          {[
          { icon: Package, title: 'Estoque', desc: 'Quantidades, valores e margens completas.', action: exportStockReport, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { icon: BarChart3, title: 'Vendas', desc: `${filteredSales.length} vendas nos últimos ${days} dias, por canal e produto.`, action: exportSalesReport, color: 'text-amber-600', bg: 'bg-amber-100' },
          { icon: PieChart, title: 'Financeiro', desc: 'Receita, custos, lucro, ROI completo.', action: () => {
            const headers = ['Indicador', 'Valor'];
            const data = [
              ['Receita', totalRevenue.toFixed(2)], ['Custo', totalCost.toFixed(2)],
              ['Lucro', totalProfit.toFixed(2)], ['Margem', margin.toFixed(1) + '%'],
              ['ROI', roi.toFixed(1) + '%'], ['Ticket Médio', avgTicket.toFixed(2)],
              ['Vendas Período', filteredSales.length.toString()],
              ['Valor Estoque', stockValue.toFixed(2)], ['Itens Críticos', critical.toString()],
            ];
            exportCSV(headers, data, 'financeiro.csv', storePrefix());
          }, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        ].map((r, i) => (
          <div key={i} className="bg-theme-card rounded-xl border border-theme p-5 shadow-sm">
            <div className={`w-11 h-11 rounded-xl ${r.bg} flex items-center justify-center mb-4`}>
              <r.icon size={18} className={r.color} />
            </div>
            <h3 className="font-semibold mb-1 text-theme-primary">{r.title}</h3>
            <p className="text-xs text-theme-secondary mb-4 leading-relaxed">{r.desc}</p>
            <button onClick={r.action} className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
              <FileDown size={14} /> Exportar CSV
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
