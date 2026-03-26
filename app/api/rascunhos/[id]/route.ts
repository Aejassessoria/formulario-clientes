import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await pool.query('DELETE FROM rascunhos WHERE id = $1', [id]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: 'Erro ao excluir rascunho' }, { status: 500 });
  }
}
