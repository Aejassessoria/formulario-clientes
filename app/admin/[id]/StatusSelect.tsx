'use client';

import { useState } from 'react';
import type { StatusValido } from '@/lib/admin';

const OPCOES: { value: StatusValido; label: string }[] = [
  { value: 'novo',        label: 'Novo' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'concluido',   label: 'Concluído' },
];

export default function StatusSelect({
  id,
  statusAtual,
}: {
  id: string;
  statusAtual: StatusValido;
}) {
  const [status, setStatus] = useState<StatusValido>(statusAtual);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  async function salvar() {
    if (status === statusAtual && !mensagem) return;
    setSalvando(true);
    setMensagem(null);
    try {
      const res = await fetch(`/api/admin/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || 'Erro desconhecido');
      setMensagem({ tipo: 'ok', texto: 'Status atualizado com sucesso.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar.';
      setMensagem({ tipo: 'erro', texto: msg });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="adm-status-wrap">
      <div className="adm-status-row">
        <select
          className="fsel"
          value={status}
          onChange={e => { setStatus(e.target.value as StatusValido); setMensagem(null); }}
          disabled={salvando}
        >
          {OPCOES.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          className="btn-pri"
          style={{ padding: '8px 22px', fontSize: '12px' }}
          onClick={salvar}
          disabled={salvando}
        >
          {salvando ? 'Salvando...' : 'Salvar status'}
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
