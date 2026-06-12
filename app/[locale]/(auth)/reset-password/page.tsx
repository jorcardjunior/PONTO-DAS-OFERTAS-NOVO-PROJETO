'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import AuroraBackground from '@/components/AuroraBackground';

function ResetForm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'pt';
  const token = searchParams?.get('token');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('As senhas não conferem');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => router.push(`/${locale}/login`), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {  return (
    <div className="text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
        <h2 className="text-xl font-bold text-white mb-2">Link Inválido</h2>
        <p className="text-sm text-white/60 mb-4">O link de recuperação é inválido ou está expirado.</p>
        <Link href={`/${locale}/forgot-password`} className="text-blue-300 hover:text-blue-200 text-sm transition-colors">Solicitar novo link</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <CheckCircle size={48} className="mx-auto mb-4 text-emerald-400" />
        <h2 className="text-xl font-bold text-white mb-2">Senha Alterada!</h2>
        <p className="text-sm text-white/60">Redirecionando para o login...</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white mb-2">Redefinir Senha</h1>
      <p className="text-sm text-white/60 mb-6">Digite sua nova senha.</p>
      {error && <p className="text-red-300 text-sm mb-4">{error}</p>}
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div>            <label className="text-xs font-semibold text-white/70 uppercase mb-1 block">Nova Senha</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />              <input type="password" placeholder="Mínimo 6 caracteres" value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-9 p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" required minLength={6} />
          </div>
        </div>
        <div>            <label className="text-xs font-semibold text-white/70 uppercase mb-1 block">Confirmar Senha</label>
          <input type="password" placeholder="Repita a senha" value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" required />
        </div>          <button type="submit" disabled={loading || !password || !confirm}
          className="w-full py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20">
          {loading ? 'Alterando...' : 'Alterar Senha'}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'pt';

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <AuroraBackground />
      <div className="relative w-full max-w-md p-8 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
        <Suspense fallback={<div className="text-center py-8 text-white/60">Carregando...</div>}>
          <ResetForm />
        </Suspense>
        <p className="text-center mt-4">
          <Link href={`/${locale}/login`} className="text-sm text-white/60 hover:text-white transition-colors">Voltar ao login</Link>
        </p>
      </div>
    </div>
  );
}
