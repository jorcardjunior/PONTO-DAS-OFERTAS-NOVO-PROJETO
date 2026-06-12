'use client';

import { useState, FormEvent } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { UserPlus, Mail, Lock, User, CheckCircle, X } from 'lucide-react';
import AuroraBackground from '@/components/AuroraBackground';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'pt';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('As senhas não conferem');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/register', { name, email, password });
      setSuccess(true);
      setTimeout(() => router.push(`/${locale}/login`), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <AuroraBackground />
        <div className="relative w-full max-w-md p-8 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl text-center">
          <CheckCircle size={56} className="mx-auto mb-4 text-emerald-400" />
          <h2 className="text-xl font-bold text-white mb-2">Conta Criada!</h2>
          <p className="text-sm text-white/60 mb-6">Redirecionando para o login...</p>
          <Link href={`/${locale}/login`}
            className="inline-block py-3 px-6 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg shadow-purple-500/20">
            Ir para o Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <AuroraBackground />
      <div className="relative w-full max-w-md p-8 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <UserPlus size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Criar Conta</h1>
          <p className="text-sm text-white/60 mt-1">Cadastre-se para começar</p>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
            <p className="text-red-200 text-sm text-center">{error}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">Nome</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input type="text" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)}
                className="w-full pl-9 p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">Senha</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" required minLength={6} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">Confirmar Senha</label>
            <input type="password" placeholder="Repita a senha" value={confirm} onChange={e => setConfirm(e.target.value)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" required />
          </div>
          <button type="submit" disabled={loading || !name || !email || !password || !confirm}
            className="w-full py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20">
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <div className="mt-4 text-center space-y-2">
          <p className="text-sm text-white/60">
            Já tem conta?{' '}
            <Link href={`/${locale}/login`} className="text-purple-300 hover:text-white transition-colors font-medium">Fazer login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
