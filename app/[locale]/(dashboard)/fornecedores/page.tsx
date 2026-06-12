'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FornecedoresPage() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<{ open: boolean; edit?: any }>({ open: false });

  const { data: suppliers = [] } = useQuery<any[]>({
    queryKey: ['suppliers'],
    queryFn: () => axios.get('/api/suppliers').then(r => r.data),
  });

  const { data: products = [] } = useQuery<any[]>({
    queryKey: ['products'],
    queryFn: () => axios.get('/api/products').then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/suppliers/${id}`),
    onSuccess: () => {
      toast.success('Fornecedor excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: () => toast.error('Erro ao excluir fornecedor. Ele pode ter produtos vinculados.'),
  });

  function countBySupplier(supId: string) {
    return products.filter((p: any) => p.supplierId === supId).length;
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-theme-primary">Fornecedores</h1>
        <button onClick={() => setModal({ open: true })} className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <Plus size={16} /> Novo Fornecedor
        </button>
      </div>

      <div className="bg-theme-card rounded-xl border border-theme overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-theme-container">
            <tr>
              <th className="p-4 text-xs font-semibold text-theme-secondary uppercase">Fornecedor</th>
              <th className="p-4 text-xs font-semibold text-theme-secondary uppercase">Contato</th>
              <th className="p-4 text-xs font-semibold text-theme-secondary uppercase">Email</th>
              <th className="p-4 text-xs font-semibold text-theme-secondary uppercase">Telefone</th>
              <th className="p-4 text-xs font-semibold text-theme-secondary uppercase">Produtos</th>
              <th className="p-4 text-xs font-semibold text-theme-secondary uppercase">Ações</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s: any) => (
              <tr key={s.id} className="border-t border-theme hover:bg-theme-hover">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-theme-container flex items-center justify-center">
                      <Building2 size={16} className="text-blue-600" />
                    </div>
                    <span className="font-medium text-sm text-theme-primary">{s.name}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-theme-secondary">{s.contact || '—'}</td>
                <td className="p-4 text-sm text-blue-600">{s.email || '—'}</td>
                <td className="p-4 text-sm text-theme-secondary">{s.phone || '—'}</td>
                <td className="p-4"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{countBySupplier(s.id)}</span></td>
                <td className="p-4">
                  <div className="flex gap-1">
                    <button onClick={() => setModal({ open: true, edit: s })} className="w-8 h-8 rounded-lg hover:bg-theme-hover flex items-center justify-center text-theme-secondary"><Edit2 size={14} /></button>
                    <button onClick={() => { if (confirm(`Excluir ${s.name}?`)) deleteMutation.mutate(s.id); }} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-500"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {suppliers.length === 0 && (
        <div className="text-center py-16 text-theme-muted">
          <Building2 size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium text-theme-primary">Nenhum fornecedor</p>
          <button onClick={() => setModal({ open: true })} className="mt-4 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Adicionar Fornecedor</button>
        </div>
      )}

      {modal.open && <SupplierForm edit={modal.edit} onClose={() => setModal({ open: false, edit: undefined })} />}
    </div>
  );
}

function SupplierForm({ edit, onClose }: { edit?: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: edit?.name || '',
    contact: edit?.contact || '',
    email: edit?.email || '',
    phone: edit?.phone || '',
    cnpj: edit?.cnpj || '',
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (edit) return axios.put(`/api/suppliers/${edit.id}`, form);
      return axios.post('/api/suppliers', form);
    },
    onSuccess: () => {
      toast.success(edit ? 'Fornecedor atualizado!' : 'Fornecedor cadastrado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      onClose();
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Erro ao salvar fornecedor'),
  });

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="forn-modal-title" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose} onKeyDown={e => e.key === 'Escape' && onClose()}>
      <div className="bg-theme-card rounded-2xl max-w-md w-full shadow-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 id="forn-modal-title" className="text-lg font-bold text-theme-primary">{edit ? 'Editar' : 'Novo'} Fornecedor</h2>
          <button onClick={onClose} className="text-theme-secondary"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-theme-secondary uppercase">Nome</label>
            <input className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-theme-secondary uppercase">Contato</label>
              <input className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-theme-secondary uppercase">Telefone</label>
              <input className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-theme-secondary uppercase">Email</label>
              <input type="email" className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-theme-secondary uppercase">CNPJ</label>
              <input className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary" value={form.cnpj} onChange={e => setForm({ ...form, cnpj: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button onClick={onClose} className="px-4 py-2 border border-theme rounded-lg text-sm font-medium text-theme-secondary hover:bg-theme-hover">Cancelar</button>
            <button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.name} className="px-4 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
              {mutation.isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
