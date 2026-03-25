'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [excluindo, setExcluindo] = useState(false);

  async function handleExcluir() {
    const confirmado = window.confirm(
      'Tem certeza que deseja excluir esta solicitação?\n\nTodos os dados do formulário serão removidos permanentemente e esta ação não pode ser desfeita.'
    );
    if (!confirmado) return;

    setExcluindo(true);
    try {
      const res = await fetch(`/api/admin/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || 'Erro ao excluir');
      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir. Tente novamente.');
      setExcluindo(false);
    }
  }

  return (
    <button
      className="btn-danger"
      onClick={handleExcluir}
      disabled={excluindo}
    >
      {excluindo ? 'Excluindo...' : 'Excluir formulário'}
    </button>
  );
}
