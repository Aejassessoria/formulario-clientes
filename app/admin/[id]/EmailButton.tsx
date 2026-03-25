'use client';

import { useState } from 'react';

export default function EmailButton({
  id,
  emailPadrao,
}: {
  id: string;
  emailPadrao: string;
}) {
  const [para, setPara] = useState(emailPadrao !== '—' ? emailPadrao : '');
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  async function enviar() {
    if (!para) return;
    setEnviando(true);
    setMensagem(null);
    try {
      const res = await fetch(`/api/admin/${id}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ para }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || 'Erro ao enviar');
      setMensagem({ tipo: 'ok', texto: data.message });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar e-mail';
      setMensagem({ tipo: 'erro', texto: msg });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="adm-status-wrap">
      <div className="adm-status-row">
        <input
          type="email"
          className="finp"
          placeholder="destinatario@email.com"
          value={para}
          onChange={e => { setPara(e.target.value); setMensagem(null); }}
          disabled={enviando}
          style={{ flex: 1, minWidth: 0 }}
        />
        <button
          className="btn-pri"
          style={{ padding: '8px 18px', fontSize: '12px', whiteSpace: 'nowrap' }}
          onClick={enviar}
          disabled={enviando || !para}
        >
          {enviando ? 'Enviando...' : 'Enviar por e-mail'}
        </button>
      </div>
      {mensagem && (
        <p className="adm-status-msg" data-tipo={mensagem.tipo}>
          {mensagem.tipo === 'ok' ? '✓ ' : '✗ '}{mensagem.texto}
        </p>
      )}
    </div>
  );
}
