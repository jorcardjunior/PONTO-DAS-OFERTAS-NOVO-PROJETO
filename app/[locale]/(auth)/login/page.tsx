'use client';

import { signIn } from 'next-auth/react';
import { FormEvent, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AuroraBackground from '@/components/AuroraBackground';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'pt';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Email ou senha inválidos');
    } else {
      router.push(`/${locale}/dashboard`);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <AuroraBackground />
      <div className="relative w-full max-w-md p-8 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <span className="text-2xl font-bold text-white">PO</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Ponto das Ofertas</h1>
          <p className="text-sm text-white/60 mt-1">Sistema de Gestão de Estoque</p>
        </div>
        {error && (
          <div className="p-3 mb-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
            <p className="text-red-200 text-sm text-center">{error}</p>
          </div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">Email</label>
            <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">Senha</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <p className="text-center">
            <a href={`/${locale}/forgot-password`} className="text-sm text-white/60 hover:text-white transition-colors">Esqueceu a senha?</a>
          </p>
        </form>
        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <p className="text-sm text-white/60">
            Não tem uma conta?{' '}
            <a href={`/${locale}/register`} className="text-purple-300 hover:text-white transition-colors font-medium">Cadastre-se</a>
          </p>
        </div>
      </div>
    </div>
  );
}
