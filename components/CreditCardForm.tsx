'use client';

import { useState } from 'react';

export default function CreditCardForm() {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  return (
    <div className="space-y-4 p-4 border rounded-xl bg-white shadow-sm">
      <h2 className="font-semibold">Dados do Cartão</h2>
      <input
        type="text"
        placeholder="Número do Cartão"
        value={cardNumber}
        onChange={e => setCardNumber(e.target.value)}
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-600"
      />
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Validade (MM/AA)"
          value={expiry}
          onChange={e => setExpiry(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-600"
        />
        <input
          type="text"
          placeholder="CVV"
          value={cvv}
          onChange={e => setCvv(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-600"
        />
      </div>
    </div>
  );
}
