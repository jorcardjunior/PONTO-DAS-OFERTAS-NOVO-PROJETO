import Link from 'next/link';

export default function MenuPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Menu</h1>
      <div className="grid gap-4">
        {[
          { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
          { href: '/produtos', label: 'Produtos', icon: 'inventory_2' },
          { href: '/categorias', label: 'Categorias', icon: 'tags' },
          { href: '/fornecedores', label: 'Fornecedores', icon: 'local_shipping' },
          { href: '/vendas', label: 'Vendas', icon: 'shopping_cart' },
          { href: '/movimentos', label: 'Movimentos', icon: 'swap_horiz' },
          { href: '/relatorios', label: 'Relatórios', icon: 'analytics' },
          { href: '/configuracoes', label: 'Configurações', icon: 'settings' },
        ].map(item => (
          <Link key={item.href} href={item.href} className="flex items-center gap-4 p-4 bg-theme-card rounded-xl border border-theme shadow-sm hover:bg-theme-hover transition-colors">
            <span className="material-symbols-outlined text-purple-500">{item.icon}</span>
            <span className="font-medium text-theme-primary">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
