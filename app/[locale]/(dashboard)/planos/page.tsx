export default function PlanosPage() {
  const plans = [
    { id: 'free', name: 'Básico', price: 0, features: ['Até 100 SKUs', '1 Usuário'] },
    { id: 'pro', name: 'Profissional', price: 99.9, features: ['SKUs Ilimitados', '5 Usuários', 'Suporte 24/7'] }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Escolha seu Plano</h1>
      <div className="grid md:grid-cols-2 gap-8">
        {plans.map(plan => (
          <div key={plan.id} className="p-8 border rounded-2xl bg-white shadow-sm">
            <h2 className="text-xl font-bold">{plan.name}</h2>
            <p className="text-4xl font-bold my-4">R$ {plan.price}<span className="text-sm font-normal">/mês</span></p>
            <ul className="space-y-2 mb-8">
              {plan.features.map(f => <li key={f}>✓ {f}</li>)}
            </ul>
            <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold">Assinar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
