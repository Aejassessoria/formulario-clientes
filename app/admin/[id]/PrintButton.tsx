'use client';
import { useEffect } from 'react';

export default function PrintButton() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autoprint') === '1') {
        setTimeout(() => window.print(), 600);
      }
    }
  }, []);

  const handlePrint = () => {
    const isMobile =
      /Android|iPhone|iPad|iPod|webOS|BlackBerry/i.test(navigator.userAgent) ||
      window.innerWidth < 768;

    if (isMobile) {
      const url = new URL(window.location.href);
      url.searchParams.set('autoprint', '1');
      window.location.href = url.toString();
    } else {
      window.print();
    }
  };

  return (
    <button
      className="btn-sec"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
      onClick={handlePrint}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
      Baixar / Imprimir PDF
    </button>
  );
}
