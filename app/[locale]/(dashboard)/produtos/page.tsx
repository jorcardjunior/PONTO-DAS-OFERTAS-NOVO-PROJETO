'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  Plus, Edit2, Trash2, Eye, Package, Search, X, ImageIcon,
  AlertTriangle, CheckCircle, XCircle, GripVertical,
  LayoutGrid, List, ArrowUpDown,
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import { cn, money } from '@/lib/utils';
import MarketplaceIcon, { MARKETPLACES } from '@/components/MarketplaceIcon';

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  stock: number;
  minStock: number;
  price: number;
  cost: number;
  image: string | null;
  marketplace: string | null;
  details: any;
  categoryId: string | null;
  supplierId: string | null;
  userId: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string; color: string } | null;
  supplier?: { id: string; name: string } | null;
}

type StockStatus = 'healthy' | 'warning' | 'critical';
type ViewMode = 'kanban' | 'table';
type SortField = 'name' | 'sku' | 'stock' | 'price' | 'cost';
type SortDir = 'asc' | 'desc';

function getStockHealth(p: Product): StockStatus {
  if (p.stock <= 0) return 'critical';
  if (p.stock <= p.minStock) return 'warning';
  return 'healthy';
}

const STATUS_CONFIG: Record<StockStatus, { label: string; icon: typeof CheckCircle; color: string; barColor: string; dotColor: string }> = {
  healthy: {
    label: 'Saudável',
    icon: CheckCircle,
    color: 'text-emerald-600 dark:text-emerald-400',
    barColor: 'bg-emerald-500',
    dotColor: 'bg-emerald-500',
  },
  warning: {
    label: 'Atenção',
    icon: AlertTriangle,
    color: 'text-amber-600 dark:text-amber-400',
    barColor: 'bg-amber-500',
    dotColor: 'bg-amber-500',
  },
  critical: {
    label: 'Esgotado',
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    barColor: 'bg-red-500',
    dotColor: 'bg-red-500',
  },
};

const ProductKanbanCard = memo(function ProductKanbanCard({
  product, index, onDetail, onEdit, onStock, onDelete,
}: {
  product: Product; index: number;
  onDetail: (p: Product) => void;
  onEdit: (id: string) => void;
  onStock: (p: Product) => void;
  onDelete: (p: Product) => void;
}) {
  const status = getStockHealth(product);
  const config = STATUS_CONFIG[status];
  const margin = product.price > 0 ? ((product.price - product.cost) / product.price * 100) : 0;

  return (
    <Draggable draggableId={product.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            'mb-3 transition-all duration-200',
            snapshot.isDragging && 'scale-[1.02] shadow-xl z-50',
          )}
          style={provided.draggableProps.style}
        >
          <div className="bg-theme-card border border-theme rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <div className={cn('h-1 w-full', config.barColor)} />
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    {...provided.dragHandleProps}
                    className="text-theme-muted hover:text-theme-primary cursor-grab active:cursor-grabbing transition-colors shrink-0"
                  >
                    <GripVertical size={14} />
                  </div>
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold',
                    status === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    status === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                  )}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', config.dotColor, status === 'critical' && 'animate-pulse')} />
                    {config.label}
                  </span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); onDetail(product); }}
                    className="w-7 h-7 rounded-lg bg-theme-container hover:bg-blue-100 dark:hover:bg-blue-900/30 flex items-center justify-center text-theme-muted hover:text-blue-600 dark:hover:text-blue-400 transition-all">
                    <Eye size={12} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onEdit(product.id); }}
                    className="w-7 h-7 rounded-lg bg-theme-container hover:bg-purple-100 dark:hover:bg-purple-900/30 flex items-center justify-center text-theme-muted hover:text-purple-600 dark:hover:text-purple-400 transition-all">
                    <Edit2 size={12} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onStock(product); }}
                    className="w-7 h-7 rounded-lg bg-theme-container hover:bg-amber-100 dark:hover:bg-amber-900/30 flex items-center justify-center text-theme-muted hover:text-amber-600 dark:hover:text-amber-400 transition-all">
                    <Package size={12} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(product); }}
                    className="w-7 h-7 rounded-lg bg-theme-container hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center text-theme-muted hover:text-red-600 dark:hover:text-red-400 transition-all">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden mb-3 bg-theme-container">
                {product.image ? (
                  <img src={product.image} alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={24} className="text-theme-muted opacity-30" />
                  </div>
                )}
                {product.marketplace && (
                  <div className="absolute top-2 right-2">
                    <MarketplaceIcon marketplace={product.marketplace} size={16} />
                  </div>
                )}
              </div>

              <h3 className="text-sm font-semibold text-theme-primary truncate mb-0.5">{product.name}</h3>
              <p className="text-[11px] text-theme-muted font-mono mb-3">{product.sku}</p>

              {product.category && (
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: product.category.color }} />
                  <span className="text-[11px] text-theme-secondary">{product.category.name}</span>
                </div>
              )}

              <div className="w-full h-1.5 bg-theme-container rounded-full overflow-hidden mb-3">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', config.barColor)}
                  style={{ width: `${Math.min((product.stock / Math.max(product.minStock * 2, 1)) * 100, 100)}%` }}
                />
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <div className="text-base font-bold text-theme-primary">{money(product.price)}</div>
                  <div className="text-[11px] text-theme-muted">
                    Custo {money(product.cost)} &middot; {margin.toFixed(0)}%
                  </div>
                </div>
                <div className={cn('text-sm font-bold', config.color)}>
                  {product.stock}<span className="text-[11px] text-theme-muted ml-0.5">un</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
});

const KanbanColumn = memo(function KanbanColumn({
  status, products, onDetail, onEdit, onStock, onDelete,
}: {
  status: StockStatus; products: Product[];
  onDetail: (p: Product) => void; onEdit: (id: string) => void;
  onStock: (p: Product) => void; onDelete: (p: Product) => void;
}) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4 bg-theme-container border border-theme">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-theme-card border border-theme">
          <Icon size={16} className={config.color} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-theme-primary">{config.label}</h3>
          <p className="text-[11px] text-theme-muted">{products.length} produto{products.length !== 1 ? 's' : ''}</p>
        </div>
        <span className={cn(
          'px-2.5 py-1 rounded-full text-xs font-bold',
          status === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
          status === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        )}>
          {products.length}
        </span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 overflow-y-auto rounded-xl p-2 transition-all duration-200 min-h-[120px]',
              snapshot.isDraggingOver && 'bg-theme-container-high ring-1 ring-theme',
            )}
          >
            {products.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center py-10 text-theme-muted opacity-40">
                <Icon size={28} className="mb-2" />
                <p className="text-xs font-medium">Nenhum produto</p>
              </div>
            )}
            {products.map((product, index) => (
              <ProductKanbanCard
                key={product.id} product={product} index={index}
                onDetail={onDetail} onEdit={onEdit} onStock={onStock} onDelete={onDelete}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
});

function ProductTable({
  products, sortField, sortDir, onSort, onDetail, onEdit, onStock, onDelete,
}: {
  products: Product[];
  sortField: SortField; sortDir: SortDir;
  onSort: (field: SortField) => void;
  onDetail: (p: Product) => void; onEdit: (id: string) => void;
  onStock: (p: Product) => void; onDelete: (p: Product) => void;
}) {
  const sorted = useMemo(() => {
    const list = [...products];
    list.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const cmp = typeof aVal === 'string'
        ? (aVal as string).localeCompare(bVal as string)
        : (aVal as number) - (bVal as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [products, sortField, sortDir]);

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 text-xs font-semibold text-theme-muted uppercase tracking-wider hover:text-theme-primary transition-colors"
    >
      {children}
      <ArrowUpDown size={12} className={cn(
        'opacity-30',
        sortField === field && 'opacity-100 text-theme-primary',
      )} />
    </button>
  );

  return (
    <div className="bg-theme-card border border-theme rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-theme">
              <th className="p-3 pl-4 text-left"><SortHeader field="name">Produto</SortHeader></th>
              <th className="p-3 text-left"><SortHeader field="sku">SKU</SortHeader></th>
              <th className="p-3 text-left hidden sm:table-cell">Categoria</th>
              <th className="p-3 text-left"><SortHeader field="stock">Estoque</SortHeader></th>
              <th className="p-3 text-left hidden md:table-cell"><SortHeader field="cost">Custo</SortHeader></th>
              <th className="p-3 text-left"><SortHeader field="price">Preço</SortHeader></th>
              <th className="p-3 text-left hidden lg:table-cell">Margem</th>
              <th className="p-3 text-left hidden sm:table-cell">Canal</th>
              <th className="p-3 pr-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-12 text-center text-theme-muted text-sm">
                  Nenhum produto encontrado
                </td>
              </tr>
            ) : (
              sorted.map((product) => {
                const status = getStockHealth(product);
                const config = STATUS_CONFIG[status];
                const margin = product.price > 0 ? ((product.price - product.cost) / product.price * 100) : 0;
                return (
                  <tr key={product.id} className="border-b border-theme hover:bg-theme-container transition-colors">
                    <td className="p-3 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-theme-container overflow-hidden shrink-0 border border-theme">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon size={14} className="text-theme-muted opacity-30" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-theme-primary truncate">{product.name}</div>
                          <div className="text-[11px] text-theme-muted font-mono">{product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-theme-secondary font-mono">{product.sku}</td>
                    <td className="p-3 hidden sm:table-cell">
                      {product.category ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-theme-container rounded-full text-[11px] text-theme-secondary">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: product.category.color }} />
                          {product.category.name}
                        </span>
                      ) : (
                        <span className="text-theme-muted text-sm">&mdash;</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-sm font-semibold', config.color)}>{product.stock}</span>
                        <div className="w-16 h-1.5 bg-theme-container rounded-full overflow-hidden hidden sm:block">
                          <div
                            className={cn('h-full rounded-full', config.barColor)}
                            style={{ width: `${Math.min((product.stock / Math.max(product.minStock * 2, 1)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell text-sm text-theme-secondary">{money(product.cost)}</td>
                    <td className="p-3">
                      <div className="text-sm font-semibold text-theme-primary">{money(product.price)}</div>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <span className={cn(
                        'text-sm font-medium',
                        margin >= 30 ? 'text-emerald-600 dark:text-emerald-400' :
                        margin >= 15 ? 'text-amber-600 dark:text-amber-400' :
                        'text-red-600 dark:text-red-400',
                      )}>
                        {margin.toFixed(0)}%
                      </span>
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      {product.marketplace ? (
                        <MarketplaceIcon marketplace={product.marketplace} size={16} />
                      ) : (
                        <span className="text-theme-muted text-sm">&mdash;</span>
                      )}
                    </td>
                    <td className="p-3 pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => onDetail(product)}
                          className="w-8 h-8 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 flex items-center justify-center text-theme-muted hover:text-blue-600 dark:hover:text-blue-400 transition-all">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => onEdit(product.id)}
                          className="w-8 h-8 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 flex items-center justify-center text-theme-muted hover:text-purple-600 dark:hover:text-purple-400 transition-all">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => onStock(product)}
                          className="w-8 h-8 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 flex items-center justify-center text-theme-muted hover:text-amber-600 dark:hover:text-amber-400 transition-all">
                          <Package size={14} />
                        </button>
                        <button onClick={() => onDelete(product)}
                          className="w-8 h-8 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center text-theme-muted hover:text-red-600 dark:hover:text-red-400 transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ProdutosPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; editId?: string }>({ open: false });
  const [detail, setDetail] = useState<Product | null>(null);
  const [stockModal, setStockModal] = useState<{ open: boolean; product?: Product }>({ open: false });
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('produtos-view') as ViewMode) || 'kanban';
    }
    return 'kanban';
  });
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const { data: products = [] } = useQuery<Product[]>({
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

  const filtered = useMemo(() => {
    if (!search) return products;
    const q = search.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  }, [products, search]);

  const columns = useMemo(() => ({
    healthy: filtered.filter(p => getStockHealth(p) === 'healthy'),
    warning: filtered.filter(p => getStockHealth(p) === 'warning'),
    critical: filtered.filter(p => getStockHealth(p) === 'critical'),
  }), [filtered]);

  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const product = products.find(p => p.id === draggableId);
    if (!product) return;

    const newStatus = destination.droppableId as StockStatus;
    const config = STATUS_CONFIG[newStatus];

    let newStock = product.stock;
    if (newStatus === 'critical') newStock = 0;
    else if (newStatus === 'warning') newStock = product.minStock;
    else if (newStatus === 'healthy') newStock = Math.max(product.minStock + 1, product.stock);

    if (newStock !== product.stock) {
      const movementType = newStock > product.stock ? 'IN' : 'OUT';
      const quantity = Math.abs(newStock - product.stock);

      axios.post('/api/movements', {
        productId: product.id,
        type: movementType,
        quantity,
        reason: `Reclassificação de estoque para "${config.label}"`,
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        toast.success(`"${product.name}" movido para ${config.label}`);
      }).catch(() => {
        toast.error('Erro ao mover produto');
      });
    }
  }

  function handleDelete(p: Product) {
    if (confirm(`Excluir "${p.name}"?`)) deleteMutation.mutate(p.id);
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  function handleViewChange(mode: ViewMode) {
    setViewMode(mode);
    localStorage.setItem('produtos-view', mode);
  }

  const totalValue = filtered.reduce((a, p) => a + p.stock * p.cost, 0);
  const totalUnits = filtered.reduce((a, p) => a + p.stock, 0);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-theme-primary">Produtos</h1>
        <button
          onClick={() => setModal({ open: true })}
          className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Novo Produto
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" />
          <input
            type="text"
            placeholder="Buscar produto, SKU..."
            className="w-full pl-9 pr-4 py-2 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center bg-theme-container border border-theme rounded-lg p-0.5">
          <button
            onClick={() => handleViewChange('kanban')}
            className={cn(
              'p-2 rounded-md transition-all',
              viewMode === 'kanban'
                ? 'bg-theme-card text-theme-primary shadow-sm'
                : 'text-theme-muted hover:text-theme-primary',
            )}
            title="Visualização Kanban"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => handleViewChange('table')}
            className={cn(
              'p-2 rounded-md transition-all',
              viewMode === 'table'
                ? 'bg-theme-card text-theme-primary shadow-sm'
                : 'text-theme-muted hover:text-theme-primary',
            )}
            title="Visualização em Tabela"
          >
            <List size={16} />
          </button>
        </div>

        <p className="text-xs text-theme-muted">
          {filtered.length} produtos &middot; {totalUnits} unidades &middot; {money(totalValue)} em estoque
        </p>
      </div>

      {filtered.length === 0 && !search ? (
        <div className="text-center py-20">
          <Package size={48} className="mx-auto mb-4 text-theme-muted opacity-30" />
          <p className="text-lg font-medium text-theme-primary">Nenhum produto cadastrado</p>
          <button
            onClick={() => setModal({ open: true })}
            className="mt-4 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
          >
            Cadastrar Primeiro Produto
          </button>
        </div>
      ) : filtered.length === 0 && search ? (
        <div className="text-center py-20">
          <Search size={48} className="mx-auto mb-4 text-theme-muted opacity-30" />
          <p className="text-lg font-medium text-theme-primary">Nenhum resultado para &quot;{search}&quot;</p>
        </div>
      ) : viewMode === 'kanban' ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KanbanColumn status="healthy" products={columns.healthy}
              onDetail={setDetail} onEdit={(id: string) => setModal({ open: true, editId: id })}
              onStock={(p: Product) => setStockModal({ open: true, product: p })} onDelete={handleDelete} />
            <KanbanColumn status="warning" products={columns.warning}
              onDetail={setDetail} onEdit={(id: string) => setModal({ open: true, editId: id })}
              onStock={(p: Product) => setStockModal({ open: true, product: p })} onDelete={handleDelete} />
            <KanbanColumn status="critical" products={columns.critical}
              onDetail={setDetail} onEdit={(id: string) => setModal({ open: true, editId: id })}
              onStock={(p: Product) => setStockModal({ open: true, product: p })} onDelete={handleDelete} />
          </div>
        </DragDropContext>
      ) : (
        <ProductTable
          products={filtered}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          onDetail={setDetail}
          onEdit={(id: string) => setModal({ open: true, editId: id })}
          onStock={(p: Product) => setStockModal({ open: true, product: p })}
          onDelete={handleDelete}
        />
      )}

      {detail && (
        <ProductDetail
          product={detail}
          onClose={() => setDetail(null)}
          onEdit={(id) => { setDetail(null); setModal({ open: true, editId: id }); }}
          onStock={(p) => { setDetail(null); setStockModal({ open: true, product: p }); }}
        />
      )}
      {modal.open && (
        <ProductForm
          editId={modal.editId}
          categories={categories}
          suppliers={suppliers}
          onClose={() => setModal({ open: false, editId: undefined })}
        />
      )}
      {stockModal.open && stockModal.product && (
        <StockAdjustForm
          product={stockModal.product}
          onClose={() => setStockModal({ open: false, product: undefined })}
        />
      )}
    </div>
  );
}

function ProductDetail({ product, onClose, onEdit, onStock }: {
  product: Product; onClose: () => void; onEdit: (id: string) => void; onStock: (p: Product) => void;
}) {
  const margin = product.price > 0 ? ((product.price - product.cost) / product.price * 100) : 0;
  const details = product.details || {};
  const status = getStockHealth(product);
  const config = STATUS_CONFIG[status];

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="detail-modal-title"
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose} onKeyDown={e => e.key === 'Escape' && onClose()}>
      <div className="bg-theme-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-theme"
        onClick={e => e.stopPropagation()}>
        {product.image && <img src={product.image} alt={product.name} className="w-full max-h-64 object-cover" />}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 id="detail-modal-title" className="text-xl font-bold text-theme-primary">{product.name}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <code className="px-2 py-0.5 bg-theme-container rounded text-xs font-mono text-theme-secondary">{product.sku}</code>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-semibold',
                  status === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  status === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                )}>
                  {config.label}
                </span>
                <span className="px-2 py-0.5 bg-theme-container rounded-full text-xs text-theme-secondary">
                  {product.marketplace || 'N/D'}
                </span>
              </div>
            </div>
          </div>
          <p className="text-sm text-theme-secondary">{product.description || 'Sem descrição.'}</p>

          {Object.keys(details).length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-theme-muted uppercase tracking-wider mb-2">Especificações</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(details).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2 p-2 bg-theme-container rounded-lg text-sm">
                    <span className="text-theme-muted font-medium w-20 truncate">{k}</span>
                    <span className="font-semibold text-theme-primary truncate">{v as string}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Preço', value: money(product.price), color: 'text-theme-primary' },
              { label: 'Custo', value: money(product.cost), color: 'text-theme-secondary' },
              {
                label: 'Margem', value: margin.toFixed(1) + '%',
                color: margin >= 30 ? 'text-emerald-600' : margin >= 15 ? 'text-amber-600' : 'text-red-600',
              },
              {
                label: 'Estoque', value: product.stock + ' un',
                color: product.stock <= 0 ? 'text-red-600' : product.stock <= product.minStock ? 'text-amber-600' : 'text-emerald-600',
              },
            ].map((s, i) => (
              <div key={i} className="p-3 bg-theme-container rounded-xl text-center">
                <div className="text-xs text-theme-muted">{s.label}</div>
                <div className={cn('text-lg font-bold', s.color)}>{s.value}</div>
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

          <div className="flex flex-wrap gap-3 justify-end pt-4 border-t border-theme">
            <button onClick={() => onEdit(product.id)}
              className="px-4 py-2 border border-theme rounded-lg text-sm font-medium text-theme-secondary hover:bg-theme-hover transition-colors">Editar</button>
            <button onClick={() => onStock(product)}
              className="px-4 py-2 border border-theme rounded-lg text-sm font-medium text-theme-secondary hover:bg-theme-hover transition-colors">Ajustar Estoque</button>
            <button onClick={onClose}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">Fechar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductForm({ editId, categories, suppliers, onClose }: {
  editId?: string; categories: any[]; suppliers: any[]; onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { data: products = [] } = useQuery<any[]>({
    queryKey: ['products'],
    queryFn: () => axios.get('/api/products').then(r => r.data),
  });
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
      const data = {
        ...form,
        price: parseFloat(form.price),
        cost: parseFloat(form.cost),
        stock: parseInt(form.stock),
        minStock: parseInt(form.minStock),
        details: parsedDetails,
      };
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
    <div role="dialog" aria-modal="true" aria-labelledby="prod-modal-title"
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose} onKeyDown={e => e.key === 'Escape' && onClose()}>
      <div className="bg-theme-card rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl border border-theme p-6"
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 id="prod-modal-title" className="text-lg font-bold text-theme-primary">
            {editId ? 'Editar' : 'Novo'} Produto
          </h2>
          <button onClick={onClose} className="text-theme-muted hover:text-theme-primary transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-theme-muted uppercase">Nome</label>
            <input className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-theme-muted uppercase">SKU</label>
              <input className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-theme-muted uppercase">Marketplace</label>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                {MARKETPLACES.map((m) => (
                  <MarketplaceIcon key={m} marketplace={m} selected={form.marketplace === m}
                    onClick={() => setForm({ ...form, marketplace: m })} size={18} />
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-theme-muted uppercase">Categoria</label>
              <select className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">Selecione...</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-theme-muted uppercase">Fornecedor</label>
              <select className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })}>
                <option value="">Selecione...</option>
                {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-theme-muted uppercase">Preço (R$)</label>
              <input type="number" step="0.01"
                className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-theme-muted uppercase">Custo (R$)</label>
              <input type="number" step="0.01"
                className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-theme-muted uppercase">Estoque</label>
              <input type="number"
                className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-theme-muted uppercase">Est. Mínimo</label>
              <input type="number"
                className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.minStock} onChange={e => setForm({ ...form, minStock: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-theme-muted uppercase">Imagem</label>
            <div className="flex gap-2 mt-1 items-start">
              <input className="flex-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="URL da imagem" value={form.image}
                onChange={e => setForm({ ...form, image: e.target.value })} />
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
                <img src={form.image} alt="Preview" className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-theme-muted uppercase">Descrição</label>
            <textarea className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button onClick={onClose}
              className="px-4 py-2 border border-theme rounded-lg text-sm font-medium text-theme-secondary hover:bg-theme-hover transition-colors">Cancelar</button>
            <button onClick={() => mutation.mutate()} disabled={mutation.isPending}
               className="px-4 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
              {mutation.isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StockAdjustForm({ product, onClose }: { product: Product; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('');

  const mutation = useMutation({
    mutationFn: () => axios.post('/api/movements', {
      productId: product.id, type, quantity: parseInt(quantity), reason: reason || 'Ajuste manual',
    }),
    onSuccess: () => {
      toast.success('Estoque ajustado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      onClose();
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Erro ao ajustar estoque'),
  });

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="stock-modal-title"
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose} onKeyDown={e => e.key === 'Escape' && onClose()}>
      <div className="bg-theme-card rounded-2xl max-w-md w-full shadow-xl border border-theme p-6"
        onClick={e => e.stopPropagation()}>
        <h2 id="stock-modal-title" className="text-lg font-bold text-theme-primary mb-4">Ajustar Estoque</h2>
        <div className="p-3 bg-theme-container rounded-xl mb-4">
          <div className="text-sm font-medium text-theme-primary">{product.name}</div>
          <div className="text-xs text-theme-muted">Estoque atual: <strong className="text-theme-primary">{product.stock}</strong></div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-theme-muted uppercase">Tipo</label>
            <select className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={type} onChange={e => setType(e.target.value as any)}>
              <option value="IN">Entrada (+)</option>
              <option value="OUT">Saída (-)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-theme-muted uppercase">Quantidade</label>
            <input type="number" min="1"
              className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={quantity} onChange={e => setQuantity(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-theme-muted uppercase">Motivo</label>
            <input className="w-full mt-1 p-2.5 bg-theme-container border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Ex: Reposição, Perda..." value={reason} onChange={e => setReason(e.target.value)} />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button onClick={onClose}
              className="px-4 py-2 border border-theme rounded-lg text-sm font-medium text-theme-secondary hover:bg-theme-hover transition-colors">Cancelar</button>
            <button onClick={() => mutation.mutate()} disabled={mutation.isPending}
               className="px-4 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
              {mutation.isPending ? 'Salvando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
