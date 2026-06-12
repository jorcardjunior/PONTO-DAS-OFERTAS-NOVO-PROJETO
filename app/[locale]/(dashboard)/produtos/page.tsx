'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Edit2, Trash2, Eye, Package, Search, X, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { money } from '@/lib/utils';
import MarketplaceIcon, { MARKETPLACES } from '@/components/MarketplaceIcon';

export default function ProdutosPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; editId?: string }>({ open: false });
  const [detail, setDetail] = useState<any>(null);
  const [stockModal, setStockModal] = useState<{ open: boolean; product?: any }>({ open: false });

  const { data: products = [] } = useQuery<any[]>({
    queryKey: ['products'],
    queryFn: () => axios.get('/api/products').then(r => r.data),
  });

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['categories'],
    queryFn: () => axios.get('/api/categories').then(r => r.data),
  });

  const { data: suppliers = [] } = useQuery<any[]>({
    queryKey: ['suppliers'],
    queryFn: () => axios.get('/api/suppliers').then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/products/${id}`),
    onSuccess: () => {
      toast.success('Produto excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => toast.error('Erro ao excluir produto'),
  });

  const filtered = search
    ? products.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search))
    : products;

  function getStockHealth(p: any) {
    if (p.stock <= 0) return 'critical';
    if (p.stock <= p.minStock) return 'warning';
    return 'healthy';
  }

  function getStockBadge(p: any) {
    const h = getStockHealth(p);
    if (h === 'critical') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Crítico</span>;
    if (h === 'warning') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Atenção</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Saudável</span>;
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" />
          <input type="text" placeholder="Buscar produto, SKU..." className="pl-9 pr-4 py-2 bg-theme-container border border-theme rounded-lg text-sm w-64 text-theme-primary focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={() => setModal({ open: true })} className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <Plus size={16} /> Novo Produto
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-theme-muted">
          <Package size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium text-theme-primary">Nenhum produto cadastrado</p>
          <button onClick={() => setModal({ open: true })} className="mt-4 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Cadastrar Primeiro Produto</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p: any) => {
            const margin = p.price > 0 ? ((p.price - p.cost) / p.price * 100) : 0;
            return (
              <div key={p.id} className="bg-theme-card rounded-xl border border-theme overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group" onClick={() => setDetail(p)}>
                <div className="aspect-square bg-theme-container flex items-center justify-center relative overflow-hidden">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <ImageIcon size={40} className="text-theme-muted" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <div className="flex gap-1">
                      <button onClick={e => { e.stopPropagation(); setDetail(p); }} className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-blue-600"><Eye size={14} /></button>
                      <button onClick={e => { e.stopPropagation(); setModal({ open: true, editId: p.id }); }} className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-blue-600"><Edit2 size={14} /></button>
                      <button onClick={e => { e.stopPropagation(); setStockModal({ open: true, product: p }); }} className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-blue-600"><Package size={14} /></button>
                      <button onClick={e => { e.stopPropagation(); if (confirm(`Excluir ${p.name}?`)) deleteMutation.mutate(p.id); }} className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-red-600"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1.5 mb-2">{getStockBadge(p)}</div>
                  <h3 className="font-medium text-sm truncate text-theme-primary">{p.name}</h3>
                  <div className="text-xs text-theme-muted mb-2">{p.category?.name || 'Sem categoria'}</div>
                  <div className="w-full h-1.5 bg-theme-container rounded-full overflow-hidden mb-2">
                    <div className={`h-full rounded-full transition-all ${getStockHealth(p) === 'critical' ? 'bg-red-500' : getStockHealth(p) === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${p.minStock > 0 ? Math.min((p.stock / p.minStock) * 100, 100) : 100}%` }} />
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-lg font-bold text-purple-500">{money(p.price)}</div>
                      <div className="text-xs text-theme-muted">Custo {money(p.cost)} · Margem {margin.toFixed(0)}%</div>
                    </div>
                    <div className="text-sm font-semibold text-theme-primary">{p.stock} un</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {detail && <ProductDetail product={detail} onClose={() => setDetail(null)} onEdit={(id: string) => { setDetail(null); setModal({ open: true, editId: id }); }} onStock={(p: any) => { setDetail(null); setStockModal({ open: true, product: p }); }} />}
      {(modal.open) && <ProductForm editId={modal.editId} categories={categories} suppliers={suppliers} onClose={() => setModal({ open: false, editId: undefined })} />}
      {stockModal.open && stockModal.product && <StockAdjustForm product={stockModal.product} onClose={() => setStockModal({ open: false, product: undefined })} />}
    </div>
  );
}

function ProductDetail({ product, onClose, onEdit, onStock }: { product: any; onClose: () => void; onEdit: (id: string) => void; onStock: (p: any) => void }) {
  const margin = product.price > 0 ? ((product.price - product.cost) / product.price * 100) : 0;
  const details = product.details || {};

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="detail-modal-title" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose} onKeyDown={e => e.key === 'Escape' && onClose()}>
      <div className="bg-theme-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        {product.image && <img src={product.image} alt={product.name} className="w-full max-h-72 object-cover" />}
        <div className="p-6 space-y-4">
          <h2 id="detail-modal-title" className="text-xl font-bold text-theme-primary">{product.name}</h2>
          <div className="flex flex-wrap gap-2 items-center">
            <code className="px-2 py-0.5 bg-theme-container rounded text-xs font-mono text-theme-secondary">{product.sku}</code>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${product.stock <= 0 ? 'bg-red-100 text-red-700' : product.stock <= product.minStock ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {product.stock <= 0 ? 'Crítico' : product.stock <= product.minStock ? 'Atenção' : 'Saudável'}
            </span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{product.marketplace || '—'}</span>
          </div>
          <p className="text-sm text-theme-secondary">{product.description || 'Sem descrição.'}</p>
          {Object.keys(details).length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-theme-muted uppercase tracking-wider mb-2">Especificações</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(details).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2 p-2 bg-theme-container rounded-lg text-sm">
                    <span className="text-theme-muted font-medium w-20">{k}</span>
                    <span className="font-semibold text-theme-primary">{v as string}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Preço', value: money(product.price), color: 'text-blue-600' },
              { label: 'Custo', value: money(product.cost) },
              { label: 'Margem', value: margin.toFixed(1) + '%', color: margin >= 30 ? 'text-emerald-600' : margin >= 15 ? 'text-amber-600' : 'text-red-600' },
              { label: 'Estoque', value: product.stock + ' un', color: product.stock <= 0 ? 'text-red-600' : product.stock <= product.minStock ? 'text-amber-600' : 'text-emerald-600' },
            ].map((s, i) => (
              <div key={i} className="p-3 bg-theme-container rounded-xl text-center">
                <div className="text-xs text-theme-muted">{s.label}</div>
                <div className={`text-lg font-bold ${s.color || 'text-theme-primary'}`}>{s.value}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="p-3 bg-theme-container rounded-xl text-center">
              <div className="text-xs text-theme-muted">Categoria</div>
              <div className="font-semibold text-sm text-theme-primary">{product.category?.name || '—'}</div>
            </div>
            <div className="p-3 bg-theme-container rounded-xl text-center">
              <div className="text-xs text-theme-muted">Fornecedor</div>
              <div className="font-semibold text-sm text-theme-primary">{product.supplier?.name || '—'}</div>
            </div>
            <div className="p-3 bg-theme-container rounded-xl text-center">
              <div className="text-xs text-theme-muted">Est. Mínimo</div>
              <div className="font-semibold text-sm text-theme-primary">{product.minStock} un</div>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-theme">
            <button onClick={() => onEdit(product.id)} className="px-4 py-2 border border-theme rounded-lg text-sm font-medium text-theme-secondary hover:bg-theme-hover">Editar</button>
            <button onClick={() => onStock(product)} className="px-4 py-2 border border-theme rounded-lg text-sm font-medium text-theme-secondary hover:bg-theme-hover">Ajustar Estoque</button>
            <button onClick={onClose} className="px-4 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white rounded-lg text-sm font-semibold">Fechar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductForm({ editId, categories, suppliers, onClose }: { editId?: string; categories: any[]; suppliers: any[]; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { data: products = [] } = useQuery<any[]>({ queryKey: ['products'], queryFn: () => axios.get('/api/products').then(r => r.data) });
  const editProduct = editId ? products.find((p: any) => p.id === editId) : null;

  const [form, setForm] = useState({
    name: editProduct?.name || '',
    sku: editProduct?.sku || '',
    description: editProduct?.description || '',
    price: editProduct?.price?.toString() || '',
    cost: editProduct?.cost?.toString() || '',
    stock: editProduct?.stock?.toString() || '0',
    minStock: editProduct?.minStock?.toString() || '5',
    image: editProduct?.image || '',
    marketplace: editProduct?.marketplace || 'Shopee',
    categoryId: editProduct?.categoryId || '',
    supplierId: editProduct?.supplierId || '',
    details: editProduct?.details ? JSON.stringify(editProduct.details, null, 2) : '{}',
  });

  const mutation = useMutation({
    mutationFn: async () => {
      let parsedDetails = {};
      try { parsedDetails = JSON.parse(form.details || '{}'); } catch { parsedDetails = {}; }
      const data = { ...form, price: parseFloat(form.price), cost: parseFloat(form.cost), stock: parseInt(form.stock), minStock: parseInt(form.minStock), details: parsedDetails };
      if (editId) return axios.put(`/api/products/${editId}`, data);
      return axios.post('/api/products', data);
    },
    onSuccess: () => {
      toast.success(editId ? 'Produto atualizado!' : 'Produto cadastrado!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onClose();
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Erro ao salvar produto'),
  });

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="prod-modal-title" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose} onKeyDown={e => e.key === 'Escape' && onClose()}>
      <div className="bg-theme-card rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 id="prod-modal-title" className="text-lg font-bold text-theme-primary">{editId ? 'Editar' : 'Novo'} Produto</h2>
          <button onClick={onClose} className="text-theme-secondary"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-theme-secondary uppercase">Nome</label>
            <input className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-theme-secondary uppercase">SKU</label>
              <input className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-theme-secondary uppercase">Marketplace</label>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                {MARKETPLACES.map((m) => (
                  <MarketplaceIcon key={m} marketplace={m} selected={form.marketplace === m} onClick={() => setForm({ ...form, marketplace: m })} size={18} />
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-theme-secondary uppercase">Categoria</label>
              <select className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">Selecione...</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-theme-secondary uppercase">Fornecedor</label>
              <select className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary" value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })}>
                <option value="">Selecione...</option>
                {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-theme-secondary uppercase">Preço (R$)</label>
              <input type="number" step="0.01" className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-theme-secondary uppercase">Custo (R$)</label>
              <input type="number" step="0.01" className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-theme-secondary uppercase">Estoque</label>
              <input type="number" className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-theme-secondary uppercase">Est. Mínimo</label>
              <input type="number" className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary" value={form.minStock} onChange={e => setForm({ ...form, minStock: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-theme-secondary uppercase">Imagem</label>
            <div className="flex gap-2 mt-1 items-start">
              <input className="flex-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary" placeholder="URL da imagem" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
              <span className="text-xs text-theme-muted self-center">ou</span>
              <label className="cursor-pointer px-3 py-2.5 bg-theme-container border border-theme rounded-lg text-sm font-medium text-theme-secondary hover:bg-theme-hover transition-colors">
                Upload
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const fd = new FormData();
                    fd.append('file', file);
                    try {
                      toast.loading('Enviando imagem...');
                      const res = await axios.post('/api/upload', fd);
                      setForm({ ...form, image: res.data.url });
                      toast.dismiss();
                      toast.success('Imagem enviada!');
                    } catch (err: any) {
                      toast.dismiss();
                      toast.error(err?.response?.data?.error || 'Erro ao enviar imagem');
                    }
                  }} />
              </label>
            </div>
            {form.image && (
              <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border border-theme">
                <img src={form.image} alt="Preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-theme-secondary uppercase">Descrição</label>
            <textarea className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          {/* Campo de especificações removido para usuários finais (disponível via API) */}
          <div className="flex gap-3 justify-end pt-4">
            <button onClick={onClose} className="px-4 py-2 border border-theme rounded-lg text-sm font-medium text-theme-secondary hover:bg-theme-hover">Cancelar</button>
            <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="px-4 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
              {mutation.isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StockAdjustForm({ product, onClose }: { product: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('');

  const mutation = useMutation({
    mutationFn: () => axios.post('/api/movements', { productId: product.id, type, quantity: parseInt(quantity), reason: reason || 'Ajuste manual' }),
    onSuccess: () => {
      toast.success('Estoque ajustado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      onClose();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error || 'Erro ao ajustar estoque';
      toast.error(msg);
    },
  });

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="stock-modal-title" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose} onKeyDown={e => e.key === 'Escape' && onClose()}>
      <div className="bg-theme-card rounded-2xl max-w-md w-full shadow-2xl p-6" onClick={e => e.stopPropagation()}>
        <h2 id="stock-modal-title" className="text-lg font-bold text-theme-primary mb-4">Ajustar Estoque</h2>
        <div className="p-3 bg-theme-container rounded-xl mb-4">
          <div className="text-sm font-medium text-theme-primary">{product.name}</div>
          <div className="text-xs text-theme-muted">Estoque atual: <strong className="text-theme-primary">{product.stock}</strong></div>
        </div>
        <div className="space-y-4">
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
          <div>
            <label className="text-xs font-semibold text-theme-secondary uppercase">Motivo</label>
            <input className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary" placeholder="Ex: Reposição, Perda..." value={reason} onChange={e => setReason(e.target.value)} />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button onClick={onClose} className="px-4 py-2 border border-theme rounded-lg text-sm font-medium text-theme-secondary hover:bg-theme-hover">Cancelar</button>
            <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="px-4 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
              {mutation.isPending ? 'Salvando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
