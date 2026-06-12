'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const defaultColors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function CategoriasPage() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<{ open: boolean; edit?: any }>({ open: false });

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['categories'],
    queryFn: () => axios.get('/api/categories').then(r => r.data),
  });

  const { data: products = [] } = useQuery<any[]>({
    queryKey: ['products'],
    queryFn: () => axios.get('/api/products').then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/categories/${id}`),
    onSuccess: () => {
      toast.success('Categoria excluída com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: () => toast.error('Erro ao excluir categoria. Ela pode ter produtos vinculados.'),
  });

  function countByCategory(catId: string) {
    return products.filter((p: any) => p.categoryId === catId).length;
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-theme-primary">Categorias</h1>
        <button onClick={() => setModal({ open: true })} className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <Plus size={16} /> Nova Categoria
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c: any) => (
          <div key={c.id} className="bg-theme-card rounded-xl border border-theme p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: c.color + '20' }}>
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: c.color }} />
              </div>
              <span className="font-semibold text-sm text-theme-primary flex-1">{c.name}</span>
              <button onClick={() => setModal({ open: true, edit: c })} className="w-8 h-8 rounded-lg hover:bg-theme-hover flex items-center justify-center text-theme-secondary"><Edit2 size={14} /></button>
              <button onClick={() => { if (confirm(`Excluir ${c.name}?`)) deleteMutation.mutate(c.id); }} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-500"><Trash2 size={14} /></button>
            </div>
            <div className="text-xs text-theme-muted">{c.description || ''}</div>
            <div className="text-xs font-semibold text-theme-secondary mt-2">{countByCategory(c.id)} produto(s)</div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-16 text-theme-muted">
          <p className="text-lg font-medium text-theme-primary">Nenhuma categoria</p>
          <button onClick={() => setModal({ open: true })} className="mt-4 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Criar Primeira</button>
        </div>
      )}

      {modal.open && <CategoryForm edit={modal.edit} onClose={() => setModal({ open: false, edit: undefined })} />}
    </div>
  );
}

function CategoryForm({ edit, onClose }: { edit?: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(edit?.name || '');
  const [color, setColor] = useState(edit?.color || '#10b981');
  const [description, setDescription] = useState(edit?.description || '');

  const mutation = useMutation({
    mutationFn: async () => {
      const data = { name, color, description };
      if (edit) return axios.put(`/api/categories/${edit.id}`, data);
      return axios.post('/api/categories', data);
    },
    onSuccess: () => {
      toast.success(edit ? 'Categoria atualizada!' : 'Categoria criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      onClose();
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Erro ao salvar categoria'),
  });

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="cat-modal-title" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose} onKeyDown={e => e.key === 'Escape' && onClose()}>
      <div className="bg-theme-card rounded-2xl max-w-md w-full shadow-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 id="cat-modal-title" className="text-lg font-bold text-theme-primary">{edit ? 'Editar' : 'Nova'} Categoria</h2>
          <button onClick={onClose} className="text-theme-secondary"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-theme-secondary uppercase">Nome</label>
            <input className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-theme-secondary uppercase">Cor</label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {defaultColors.map(c => (
                <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-lg border-2 transition-all ${color === c ? 'border-purple-500 scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-theme-secondary uppercase">Descrição</label>
            <input className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button onClick={onClose} className="px-4 py-2 border border-theme rounded-lg text-sm font-medium text-theme-secondary hover:bg-theme-hover">Cancelar</button>
            <button onClick={() => mutation.mutate()} disabled={mutation.isPending || !name} className="px-4 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
              {mutation.isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
