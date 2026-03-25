'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  async function sair() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <button
      className="btn-sec"
      onClick={sair}
      style={{ fontSize: '12px' }}
    >
      Sair
    </button>
  );
}
