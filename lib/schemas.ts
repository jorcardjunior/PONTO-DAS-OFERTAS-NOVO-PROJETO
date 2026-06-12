import { z } from "zod";

export const CategorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor deve ser hexadecimal (#rrggbb)").default("#10b981"),
  description: z.string().max(500).optional().default(""),
});

export const SupplierSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(200),
  contact: z.string().max(200).optional().default(""),
  email: z.string().email("Email inválido").optional().or(z.literal("")).default(""),
  phone: z.string().max(20).optional().default(""),
  cnpj: z.string().max(20).optional().default(""),
});

export const ProductSchema = z.object({
  sku: z.string().min(1, "SKU é obrigatório").max(50),
  name: z.string().min(1, "Nome é obrigatório").max(200),
  description: z.string().max(1000).optional().default(""),
  stock: z.number().int("Estoque deve ser inteiro").min(0, "Estoque não pode ser negativo").default(0),
  minStock: z.number().int("Estoque mínimo deve ser inteiro").min(0).default(5),
  price: z.number({ required_error: "Preço é obrigatório" }).min(0, "Preço não pode ser negativo"),
  cost: z.number({ required_error: "Custo é obrigatório" }).min(0, "Custo não pode ser negativo").default(0),
  image: z.string().max(500).optional().default(""),
  marketplace: z.string().max(100).optional().default("Shopee"),
  details: z.any().optional().default({}),
  categoryId: z.string().optional().default(""),
  supplierId: z.string().optional().default(""),
});

export const SaleSchema = z.object({
  productId: z.string().min(1, "Produto é obrigatório"),
  quantity: z.number().int("Quantidade deve ser inteiro").min(1, "Quantidade mínima é 1"),
  price: z.number({ required_error: "Preço é obrigatório" }).min(0, "Preço não pode ser negativo"),
  total: z.number().min(0).optional(),
  channel: z.string().max(50).optional().default("Loja Fisica"),
  date: z.string().optional(),
});

export const MovementSchema = z.object({
  productId: z.string().min(1, "Produto é obrigatório"),
  type: z.enum(["IN", "OUT"], { errorMap: () => ({ message: "Tipo deve ser IN ou OUT" }) }),
  quantity: z.number().int("Quantidade deve ser inteiro").min(1, "Quantidade mínima é 1"),
  reason: z.string().max(500).optional().default("Ajuste manual"),
});

export type CategoryInput = z.infer<typeof CategorySchema>;
export type SupplierInput = z.infer<typeof SupplierSchema>;
export type ProductInput = z.infer<typeof ProductSchema>;
export type SaleInput = z.infer<typeof SaleSchema>;
export type MovementInput = z.infer<typeof MovementSchema>;
