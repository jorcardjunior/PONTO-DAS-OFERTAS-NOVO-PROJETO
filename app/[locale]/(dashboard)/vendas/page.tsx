'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, X, DollarSign, ShoppingBag, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { money } from '@/lib/utils';
import MarketplaceIcon, { MARKETPLACES } from '@/components/MarketplaceIcon';

export default function VendasPage() {
  const [modal, setModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: salesData } = useQuery<any>({
    queryKey: ['sales'],
    queryFn: () => axios.get('/api/sales').then(r => r.data),
  });

  const sales = salesData?.sales || [];
  const stats = salesData?.stats;
  const totalRevenue = stats?._sum?.total || 0;
  const totalCost = stats?._sum?.cost || 0;
  const totalQty = sales.reduce((a: number, s: any) => a + s.quantity, 0);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-theme-primary">Vendas</h1>
        <button onClick={() => setModal(true)} className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <Plus size={16} /> Registrar Venda
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Receita Total', value: money(totalRevenue), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Vendas Realizadas', value: sales.length.toString(), icon: ShoppingBag, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Unidades Vendidas', value: totalQty.toString(), icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        ].map((k, i) => (
          <div key={i} className="bg-theme-card rounded-xl border border-theme p-5 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg ${k.bg} flex items-center justify-center`}>
              <k.icon size={20} className={k.color} />
            </div>
            <div>
              <div className="text-xs text-theme-secondary">{k.label}</div>
              <div className="text-xl font-bold text-theme-primary">{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-theme-card rounded-xl border border-theme overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-theme-container">
            <tr>
              <th className="p-4 text-xs font-semibold text-theme-secondary uppercase">Data</th>
              <th className="p-4 text-xs font-semibold text-theme-secondary uppercase">Produto</th>
              <th className="p-4 text-xs font-semibold text-theme-secondary uppercase">Canal</th>
              <th className="p-4 text-xs font-semibold text-theme-secondary uppercase">Qtd</th>
              <th className="p-4 text-xs font-semibold text-theme-secondary uppercase">Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.slice(0, 50).map((s: any) => (
              <tr key={s.id} className="border-t border-theme hover:bg-theme-hover">
                <td className="p-4 text-sm text-theme-secondary">{new Date(s.date).toLocaleDateString('pt-BR')}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {s.product?.image ? <img src={s.product.image} className="w-9 h-9 rounded-lg object-cover" /> : <div className="w-9 h-9 rounded-lg bg-theme-container" />}
                    <span className="font-medium text-sm text-theme-primary">{s.product?.name || '—'}</span>
                  </div>
                </td>
                <td className="p-4"><MarketplaceIcon marketplace={s.channel} size={18} /></td>
                <td className="p-4 text-sm text-theme-primary">{s.quantity}</td>
                <td className="p-4 text-sm font-semibold text-emerald-600">{money(s.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sales.length === 0 && (
        <div className="text-center py-16 text-theme-muted">
          <ShoppingBag size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Nenhuma venda registrada</p>
        </div>
      )}

      {modal && <QuickSaleForm onClose={() => setModal(false)} />}
    </div>
  );
}

function QuickSaleForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery<any[]>({
    queryKey: ['products'],
    queryFn: () => axios.get('/api/products').then(r => r.data),
  });

  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');
  const [channel, setChannel] = useState('Shopee');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const selectedProduct = products.find((p: any) => p.id === productId);
  const total = (parseInt(quantity) || 0) * (parseFloat(price) || 0);
  const profit = selectedProduct ? total - ((parseInt(quantity) || 0) * selectedProduct.cost) : 0;

  const mutation = useMutation({
    mutationFn: () => axios.post('/api/sales', {
      productId, quantity: parseInt(quantity), price: parseFloat(price),
      total, channel, date,
    }),
    onSuccess: () => {
      toast.success('Venda registrada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onClose();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error || 'Erro ao registrar venda. Verifique o estoque.';
      toast.error(msg);
    },
  });

  const inStockProducts = products.filter((p: any) => p.stock > 0);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="venda-modal-title" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose} onKeyDown={e => e.key === 'Escape' && onClose()}>
      <div className="bg-theme-card rounded-2xl max-w-md w-full shadow-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 id="venda-modal-title" className="text-lg font-bold text-theme-primary">Registrar Venda</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-theme-secondary uppercase">Produto</label>
            <select className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary" value={productId} onChange={e => { setProductId(e.target.value); const p = products.find((x: any) => x.id === e.target.value); if (p) setPrice(p.price.toString()); }}>
              <option value="">Selecione...</option>
              {inStockProducts.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name} ({p.stock} un) — {money(p.price)}</option>
              ))}
            </select>
          </div>
          {selectedProduct && (
            <div className="flex items-center gap-3 p-3 bg-theme-container rounded-xl">
              {selectedProduct.image ? <img src={selectedProduct.image} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-theme-container" />}
              <div>
                <div className="text-sm font-medium text-theme-primary">{selectedProduct.name}</div>
                <div className="text-xs text-theme-muted">{selectedProduct.description?.substring(0, 60)}</div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-theme-secondary uppercase">Quantidade</label>
              <input type="number" min="1" className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary" value={quantity} onChange={e => setQuantity(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-theme-secondary uppercase">Preço (R$)</label>
              <input type="number" step="0.01" className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary" value={price} onChange={e => setPrice(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-theme-secondary uppercase">Canal</label>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                {MARKETPLACES.map((m) => (
                  <MarketplaceIcon key={m} marketplace={m} selected={channel === m} onClick={() => setChannel(m)} size={18} />
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-theme-secondary uppercase">Data</label>
              <input type="date" className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>
          <div className="p-4 bg-theme-container rounded-xl space-y-1">
            <div className="flex justify-between text-sm"><span className="text-theme-secondary">Total</span><span className="font-semibold text-emerald-600">{money(total)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-theme-secondary">Lucro</span><span className={`font-semibold ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{money(profit)}</span></div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={onClose} className="px-4 py-2 border border-theme rounded-lg text-sm font-medium text-theme-secondary hover:bg-theme-hover">Cancelar</button>
            <button onClick={() => mutation.mutate()} disabled={mutation.isPending || !productId || !quantity || !price} className="px-4 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
              {mutation.isPending ? 'Salvando...' : 'Confirmar Venda'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
