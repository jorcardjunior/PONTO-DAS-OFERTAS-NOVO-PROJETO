import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[rand(0, arr.length - 1)];
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(rand(8, 18), rand(0, 59), 0, 0);
  return d;
}

async function main() {
  // Clean existing data
  await prisma.movement.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const hash = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'admin@ponto.com',
      name: 'Gerente',
      role: 'admin',
      passwordHash: hash,
      tenantId: 'default',
    },
  });

  // Categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Eletrônicos', color: '#2563eb', description: 'Smartphones, tablets, relógios', userId: user.id } }),
    prisma.category.create({ data: { name: 'Acessórios', color: '#10b981', description: 'Fones, capas, carregadores', userId: user.id } }),
    prisma.category.create({ data: { name: 'Casa & Cozinha', color: '#f59e0b', description: 'Utensílios e eletrodomésticos', userId: user.id } }),
    prisma.category.create({ data: { name: 'Moda', color: '#ec4899', description: 'Roupas, calçados, bolsas', userId: user.id } }),
    prisma.category.create({ data: { name: 'Esportes', color: '#8b5cf6', description: 'Equipamentos esportivos', userId: user.id } }),
  ]);

  // Suppliers
  const suppliers = await Promise.all([
    prisma.supplier.create({ data: { name: 'Distribuidora TechMax', contact: 'Carlos Silva', email: 'carlos@techmax.com', phone: '(11) 3000-1001', userId: user.id } }),
    prisma.supplier.create({ data: { name: 'Importadora AsiaLink', contact: 'Maria Chen', email: 'maria@asialink.com', phone: '(11) 3000-1002', userId: user.id } }),
    prisma.supplier.create({ data: { name: 'Nacional Distribuição', contact: 'Pedro Santos', email: 'pedro@nacionaldist.com', phone: '(11) 3000-1003', userId: user.id } }),
  ]);

  // Products (20+)
  const productDefs = [
    { name: 'Smartwatch Pro Gen 3', sku: 'SW-PRO-001', cat: 0, sup: 0, price: 599.90, cost: 350.00, stock: 45, minStock: 10, mp: 'Shopee' },
    { name: 'Fone Bluetooth ANC Pro', sku: 'FN-ANC-002', cat: 1, sup: 1, price: 289.90, cost: 130.00, stock: 28, minStock: 8, mp: 'Mercado Livre' },
    { name: 'Carregador Turbo 65W', sku: 'CRG-65W-003', cat: 1, sup: 1, price: 89.90, cost: 35.00, stock: 120, minStock: 20, mp: 'Shopee' },
    { name: 'Capa Silicone iPhone 15 Pro', sku: 'CAP-IP15-004', cat: 1, sup: 2, price: 39.90, cost: 12.00, stock: 200, minStock: 30, mp: 'Shopee' },
    { name: 'Tablet 10.1" WiFi 128GB', sku: 'TAB-101-005', cat: 0, sup: 0, price: 1299.90, cost: 780.00, stock: 15, minStock: 5, mp: 'Amazon' },
    { name: 'Caixa de Som Bluetooth 20W', sku: 'CX-SOM-006', cat: 0, sup: 1, price: 159.90, cost: 70.00, stock: 60, minStock: 15, mp: 'Mercado Livre' },
    { name: 'Mouse Gamer RGB 8000DPI', sku: 'MOU-GAM-007', cat: 1, sup: 0, price: 129.90, cost: 55.00, stock: 85, minStock: 15, mp: 'Shopee' },
    { name: 'Teclado Mecânico RGB Switch Blue', sku: 'TEC-MEC-008', cat: 1, sup: 0, price: 249.90, cost: 110.00, stock: 40, minStock: 10, mp: 'Amazon' },
    { name: 'Webcam Full HD 1080p', sku: 'WEB-HD-009', cat: 0, sup: 2, price: 179.90, cost: 85.00, stock: 32, minStock: 8, mp: 'Mercado Livre' },
    { name: 'Monitor 27" 4K IPS', sku: 'MON-4K-010', cat: 0, sup: 0, price: 2499.90, cost: 1500.00, stock: 8, minStock: 3, mp: 'Amazon' },
    { name: 'Liquidificador 1200W', sku: 'LIQ-1200-011', cat: 2, sup: 2, price: 199.90, cost: 90.00, stock: 55, minStock: 10, mp: 'Loja Física' },
    { name: 'Cafeteira Elétrica 30 xícaras', sku: 'CAF-30X-012', cat: 2, sup: 2, price: 149.90, cost: 65.00, stock: 2, minStock: 5, mp: 'Loja Física' },
    { name: 'Conjunto de Panelas Antiaderente 5pç', sku: 'PAN-5P-013', cat: 2, sup: 2, price: 279.90, cost: 140.00, stock: 20, minStock: 5, mp: 'Loja Física' },
    { name: 'Tênis Esportivo Corrida Air Max', sku: 'TEN-AIR-014', cat: 4, sup: 1, price: 399.90, cost: 200.00, stock: 35, minStock: 10, mp: 'Mercado Livre' },
    { name: 'Camiseta Dry Fit Premium', sku: 'CAM-DRY-015', cat: 3, sup: 2, price: 79.90, cost: 25.00, stock: 150, minStock: 30, mp: 'Shopee' },
    { name: 'Mochila Notebook 15.6"', sku: 'MOC-NB-016', cat: 3, sup: 2, price: 159.90, cost: 70.00, stock: 42, minStock: 10, mp: 'Shopee' },
    { name: 'Kit Yoga 7 Peças', sku: 'KIT-YOGA-017', cat: 4, sup: 1, price: 129.90, cost: 50.00, stock: 25, minStock: 8, mp: 'Mercado Livre' },
    { name: 'Smartband Fitness Tracker', sku: 'SW-BAND-018', cat: 0, sup: 1, price: 199.90, cost: 90.00, stock: 0, minStock: 10, mp: 'Shopee' },
    { name: 'Fone de Ouvido Kids', sku: 'FN-KIDS-019', cat: 1, sup: 0, price: 69.90, cost: 28.00, stock: 65, minStock: 15, mp: 'Amazon' },
    { name: 'Organizador de Gavetas 10x', sku: 'ORG-GAV-020', cat: 2, sup: 2, price: 49.90, cost: 18.00, stock: 90, minStock: 20, mp: 'Loja Física' },
    { name: 'Base para Notebook Ajustável', sku: 'BAS-NB-021', cat: 1, sup: 0, price: 119.90, cost: 48.00, stock: 38, minStock: 10, mp: 'Amazon' },
    { name: 'Relógio Digital Esportivo', sku: 'REL-DIG-022', cat: 3, sup: 1, price: 99.90, cost: 40.00, stock: 3, minStock: 8, mp: 'Mercado Livre' },
  ];

  const products = await Promise.all(
    productDefs.map((p, i) =>
      prisma.product.create({
        data: {
          sku: p.sku,
          name: p.name,
          description: `${p.name} — Produto de alta qualidade.`,
          stock: p.stock,
          minStock: p.minStock,
          price: p.price,
          cost: p.cost,
          marketplace: p.mp,
          details: { Categoria: categories[p.cat].name },
          categoryId: categories[p.cat].id,
          supplierId: suppliers[p.sup].id,
          userId: user.id,
        },
      })
    )
  );

  const channels = ['Shopee', 'Mercado Livre', 'Amazon', 'Loja Física'];

  // Generate 120+ sales over the last 90 days
  const sales: any[] = [];
  for (let day = 0; day < 90; day++) {
    // Weekends have more sales, weekdays fewer
    const date = daysAgo(day);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const dailySales = isWeekend ? rand(1, 3) : rand(0, 2);

    for (let s = 0; s < dailySales; s++) {
      const product = pick(products);
      const channel = pick(channels);
      const qty = rand(1, 3);
      const price = product.price;
      const total = qty * price;
      const cost = qty * product.cost;

      sales.push({
        productId: product.id,
        quantity: qty,
        price,
        total,
        cost,
        channel,
        date: new Date(date.getTime() + rand(0, 43200000)), // random time within the day
        userId: user.id,
        tenantId: 'default',
      });
    }
  }

  await prisma.sale.createMany({ data: sales });

  // Generate movements to match sales (OUT) and some IN
  const movements: any[] = [];
  for (const sale of sales) {
    movements.push({
      productId: sale.productId,
      type: 'OUT',
      quantity: sale.quantity,
      reason: `Venda via ${sale.channel}`,
      date: sale.date,
      userId: user.id,
      tenantId: 'default',
    });
  }

  // Also add some IN movements for stock replenishment
  for (let i = 0; i < 15; i++) {
    const product = pick(products);
    movements.push({
      productId: product.id,
      type: 'IN',
      quantity: rand(10, 50),
      reason: pick(['Reposição de estoque', 'Compra de novos lotes', 'Devolução de cliente']),
      date: daysAgo(rand(1, 85)),
      userId: user.id,
      tenantId: 'default',
    });
  }

  await prisma.movement.createMany({ data: movements });

  const totalSales = await prisma.sale.count();
  const totalRevenue = await prisma.sale.aggregate({ _sum: { total: true } });
  const totalProducts = await prisma.product.count();

  console.log(`\n✅ Seed concluído com sucesso!`);
  console.log(`📦 ${totalProducts} produtos`);
  console.log(`🏪 ${categories.length} categorias`);
  console.log(`🏭 ${suppliers.length} fornecedores`);
  console.log(`💰 ${totalSales} vendas (${totalRevenue._sum.total?.toFixed(2)} em receita)`);
  console.log(`📊 ${movements.length} movimentações`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
