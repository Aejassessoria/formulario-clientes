'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteRascunhoButton({ id }: { id: string }) {
  const router = useRouter();
  const [excluindo, setExcluindo] = useState(false);

  async function handleExcluir(e: React.MouseEvent) {
    e.preventDefault();
    const confirmado = window.confirm(
      'Deseja realmente excluir este rascunho?\n\nEsta ação não pode ser desfeita.'
    );
    if (!confirmado) return;

    setExcluindo(true);
    try {
      const res = await fetch(`/api/rascunhos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || 'Erro ao excluir');
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir. Tente novamente.');
      setExcluindo(false);
    }
  }

  return (
    <button
      className="btn-danger-sm"
      onClick={handleExcluir}
      disabled={excluindo}
      title="Excluir rascunho"
    >
      {excluindo ? '…' : 'Excluir'}
    </button>
  );
}
