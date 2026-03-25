'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, password: pass }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErro(data.message || 'Usuário ou senha incorretos');
        return;
      }

      router.push('/admin');
    } catch {
      setErro('Não foi possível conectar ao servidor. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: '1rem',
      fontFamily: 'var(--ff-sans)',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img
            src="/logo-aj-transparente.png"
            alt="A&J Assessoria Contábil"
            style={{ height: 56, objectFit: 'contain' }}
          />
        </div>

        {/* Card */}
        <div className="fsec" style={{ padding: '2rem' }}>
          <h1 style={{
            fontSize: '1.05rem',
            fontWeight: 600,
            color: 'var(--brand)',
            marginBottom: '0.25rem',
          }}>
            Painel Administrativo
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '1.75rem' }}>
            Acesso restrito ao escritório.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="fld">
              <label htmlFor="user">Usuário</label>
              <input
                id="user"
                type="text"
                className="finp"
                value={user}
                onChange={e => { setUser(e.target.value); setErro(''); }}
                autoComplete="username"
                autoFocus
                required
              />
            </div>

            <div className="fld">
              <label htmlFor="pass">Senha</label>
              <input
                id="pass"
                type="password"
                className="finp"
                value={pass}
                onChange={e => { setPass(e.target.value); setErro(''); }}
                autoComplete="current-password"
                required
              />
            </div>

            {erro && (
              <p style={{ fontSize: '0.82rem', color: 'var(--danger, #c0392b)', margin: 0 }}>
                ✗ {erro}
              </p>
            )}

            <button
              type="submit"
              className="btn-pri"
              disabled={carregando}
              style={{ marginTop: '0.25rem' }}
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
