export default function OnboardingPage() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Bem-vindo ao Ponto das Ofertas</h1>
      <p className="mt-4 text-gray-600">Vamos configurar seu primeiro estoque.</p>
      <div className="mt-8 grid gap-4">
        <Step title="Cadastro de Unidade" />
        <Step title="Importar Inventário" />
      </div>
    </div>
  );
}

function Step({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg bg-white shadow-sm">
      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
      <span className="font-medium">{title}</span>
    </div>
  );
}
