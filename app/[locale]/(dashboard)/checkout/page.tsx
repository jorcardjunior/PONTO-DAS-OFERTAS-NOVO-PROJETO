import CreditCardForm from '@/components/CreditCardForm';

export default function CheckoutPage() {
  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-theme-primary">Checkout</h1>
      <div className="space-y-4">
        <CreditCardForm />
        <button className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white py-4 rounded-xl font-bold">Confirmar Pagamento</button>
      </div>
    </div>
  );
}
