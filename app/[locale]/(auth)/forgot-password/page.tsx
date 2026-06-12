'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import AuroraBackground from '@/components/AuroraBackground';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetLink, setResetLink] = useState('');
  const [error, setError] = useState('');
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'pt';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setSent(true);
      // Em desenvolvimento, mostra o link
      if (res.data?.resetLink) {
        setResetLink(res.data.resetLink);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao enviar solicitação');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <AuroraBackground />
      <div className="relative w-full max-w-md p-8 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
        {!sent ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <Link href={`/${locale}/login`} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center">
                <ArrowLeft size={18} className="text-white/60" />
              </Link>
              <h1 className="text-2xl font-bold text-white">Recuperar Senha</h1>
            </div>
            <p className="text-sm text-white/60 mb-6">Digite seu email cadastrado e enviaremos um link para redefinir sua senha.</p>
            {error && <p className="text-red-300 text-sm mb-4">{error}</p>}
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" required />
                </div>
              </div>
              <button type="submit" disabled={loading || !email}
                className="w-full py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20">
                {loading ? 'Enviando...' : 'Enviar Link'}
              </button>
            </form>
            <p className="text-center mt-4">
              <Link href={`/${locale}/login`} className="text-sm text-white/60 hover:text-white transition-colors">Voltar ao login</Link>
            </p>
          </>
        ) : (
          <div className="text-center">
            <CheckCircle size={48} className="mx-auto mb-4 text-emerald-400" />
            <h2 className="text-xl font-bold text-white mb-2">Email Enviado!</h2>
            <p className="text-sm text-white/60 mb-4">Se o email existir, você receberá um link de recuperação.</p>
            {resetLink && (
              <div className="p-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl mb-4 text-left">
                <p className="text-xs font-semibold text-purple-300 mb-1">🔧 Modo Desenvolvimento</p>
                <a href={resetLink} className="text-sm text-blue-300 underline break-all hover:text-blue-200">{resetLink}</a>
              </div>
            )}
            <Link href={`/${locale}/login`} className="text-sm text-white/60 hover:text-white transition-colors">Voltar ao login</Link>
          </div>
        )}
      </div>
    </div>
  );
}
