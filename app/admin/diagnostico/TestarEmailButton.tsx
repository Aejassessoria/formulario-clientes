'use client';

import { useState } from 'react';

export default function TestarEmailButton() {
  const [testando, setTestando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  async function testar() {
    setTestando(true);
    setMensagem(null);
    try {
      const res  = await fetch('/api/admin/testar-email', { method: 'POST' });
      const data = await res.json();
      setMensagem({ tipo: data.ok ? 'ok' : 'erro', texto: data.message });
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Não foi possível falar com o servidor.' });
    } finally {
      setTestando(false);
    }
  }

  return (
    <div className="adm-status-wrap">
      <button
        className="btn-pri"
        style={{ padding: '10px 22px', fontSize: '13px' }}
        onClick={testar}
        disabled={testando}
      >
        {testando ? 'Testando...' : 'Enviar e-mail de teste agora'}
      </button>
      {mensagem && (
        <p className="adm-status-msg" data-tipo={mensagem.tipo} style={{ marginTop: 12 }}>
          {mensagem.tipo === 'ok' ? '✓ ' : '✗ '}{mensagem.texto}
        </p>
      )}
    </div>
  );
}
