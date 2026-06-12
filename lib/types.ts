export interface Product {
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
  details: Record<string, string> | null;
  categoryId: string | null;
  supplierId: string | null;
  userId: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
  supplier?: Supplier | null;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  description: string | null;
  userId: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
}

export interface Supplier {
  id: string;
  name: string;
  contact: string | null;
  email: string | null;
  phone: string | null;
  cnpj: string | null;
  userId: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
}

export interface Sale {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  total: number;
  cost: number;
  channel: string;
  date: string;
  userId: string;
  tenantId: string;
  createdAt: string;
  product?: Pick<Product, "id" | "name" | "sku" | "image" | "cost">;
}

export interface Movement {
  id: string;
  type: "IN" | "OUT";
  quantity: number;
  reason: string;
  date: string;
  productId: string;
  userId: string;
  tenantId: string;
  createdAt: string;
  product?: Pick<Product, "id" | "name" | "sku" | "image">;
}

export interface SalesResponse {
  sales: Sale[];
  stats: {
    _sum: { total: number; cost: number };
    _count: { id: number };
  };
}

export interface SalesStatsResponse {
  totalRevenue: number;
  totalTransactions: number;
}
