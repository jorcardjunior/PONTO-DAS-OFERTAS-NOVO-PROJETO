'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, X, ArrowDown, ArrowUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MovimentosPage() {
  const [modal, setModal] = useState<{ open: boolean; product?: any }>({ open: false });
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery<any[]>({
    queryKey: ['products'],
    queryFn: () => axios.get('/api/products').then(r => r.data),
  });

  const { data: movements = [] } = useQuery<any[]>({
    queryKey: ['movements'],
    queryFn: () => axios.get('/api/movements').then(r => r.data),
  });

  const totalIn = movements.filter((m: any) => m.type === 'IN').reduce((a: number, m: any) => a + m.quantity, 0);
  const totalOut = movements.filter((m: any) => m.type === 'OUT').reduce((a: number, m: any) => a + m.quantity, 0);

  const [search, setSearch] = useState('');
  const filtered = search
    ? movements.filter((m: any) => (m.product?.name || '').toLowerCase().includes(search.toLowerCase()) || (m.reason || '').toLowerCase().includes(search))
    : movements;

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <h1 className="text-2xl font-bold text-theme-primary">Movimentações</h1>
        <button onClick={() => setModal({ open: true })} className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <Plus size={16} /> Novo Ajuste
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-theme-card rounded-xl border border-theme p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
            <ArrowDown size={20} className="text-emerald-600" />
          </div>
          <div>
            <div className="text-xs text-theme-secondary">Entradas</div>
            <div className="text-xl font-bold text-theme-primary">{totalIn} un</div>
          </div>
        </div>
        <div className="bg-theme-card rounded-xl border border-theme p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
            <ArrowUp size={20} className="text-red-600" />
          </div>
          <div>
            <div className="text-xs text-theme-secondary">Saídas</div>
            <div className="text-xl font-bold text-theme-primary">{totalOut} un</div>
          </div>
        </div>
      </div>

      <div className="relative">
        <input type="text" placeholder="Buscar movimentação..." className="w-full p-2.5 pl-9 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="bg-theme-card rounded-xl border border-theme overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-theme-container">
            <tr>
              <th className="p-4 text-xs font-semibold text-theme-secondary uppercase">Data</th>
              <th className="p-4 text-xs font-semibold text-theme-secondary uppercase">Produto</th>
              <th className="p-4 text-xs font-semibold text-theme-secondary uppercase">Tipo</th>
              <th className="p-4 text-xs font-semibold text-theme-secondary uppercase">Qtd</th>
              <th className="p-4 text-xs font-semibold text-theme-secondary uppercase">Motivo</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m: any) => (
              <tr key={m.id} className="border-t border-theme hover:bg-theme-hover">
                <td className="p-4 text-sm text-theme-secondary">{new Date(m.date).toLocaleDateString('pt-BR')}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {m.product?.image ? <img src={m.product.image} className="w-9 h-9 rounded-lg object-cover" /> : <div className="w-9 h-9 rounded-lg bg-theme-container" />}
                    <span className="font-medium text-sm text-theme-primary">{m.product?.name || '—'}</span>
                  </div>
                </td>
                <td className="p-4">
                  {m.type === 'IN' ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">Entrada</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Saída</span>
                  )}
                </td>
                <td className="p-4 text-sm font-semibold text-theme-primary">{m.type === 'IN' ? '+' : '-'}{m.quantity}</td>
                <td className="p-4 text-sm text-theme-muted">{m.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-theme-muted">
          <p className="text-lg font-medium text-theme-primary">Nenhuma movimentação</p>
        </div>
      )}

      {modal.open && <StockAdjustModal onClose={() => setModal({ open: false, product: undefined })} />}
    </div>
  );
}

function StockAdjustModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery<any[]>({
    queryKey: ['products'],
    queryFn: () => axios.get('/api/products').then(r => r.data),
  });

  const [productId, setProductId] = useState('');
  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('');

  const selectedProduct = products.find((p: any) => p.id === productId);

  const mutation = useMutation({
    mutationFn: () => axios.post('/api/movements', {
      productId, type, quantity: parseInt(quantity), reason: reason || 'Ajuste manual',
    }),
    onSuccess: () => {
      toast.success('Movimentação registrada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onClose();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error || 'Erro ao registrar movimentação';
      toast.error(msg);
    },
  });

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="mov-modal-title" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose} onKeyDown={e => e.key === 'Escape' && onClose()}>
      <div className="bg-theme-card rounded-2xl max-w-md w-full shadow-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 id="mov-modal-title" className="text-lg font-bold text-theme-primary">Ajuste de Estoque</h2>
          <button onClick={onClose} className="text-theme-secondary"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-theme-secondary uppercase">Produto</label>
            <select className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary" value={productId} onChange={e => setProductId(e.target.value)}>
              <option value="">Selecione...</option>
              {products.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name} ({p.stock} un)</option>
              ))}
            </select>
          </div>
          {selectedProduct && (
            <div className="p-3 bg-theme-container rounded-xl text-sm text-theme-secondary">
              Estoque atual: <strong className="text-theme-primary">{selectedProduct.stock}</strong>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-theme-secondary uppercase">Tipo</label>
              <select className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary" value={type} onChange={e => setType(e.target.value as any)}>
                <option value="IN">Entrada (+)</option>
                <option value="OUT">Saída (-)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-theme-secondary uppercase">Quantidade</label>
              <input type="number" min="1" className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary" value={quantity} onChange={e => setQuantity(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-theme-secondary uppercase">Motivo</label>
            <input className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary" placeholder="Ex: Reposição, Perda..." value={reason} onChange={e => setReason(e.target.value)} />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button onClick={onClose} className="px-4 py-2 border border-theme rounded-lg text-sm font-medium text-theme-secondary hover:bg-theme-hover">Cancelar</button>
            <button onClick={() => mutation.mutate()} disabled={mutation.isPending || !productId || !quantity} className="px-4 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
              {mutation.isPending ? 'Salvando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
