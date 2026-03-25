import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ ok: false, message: 'ID inválido' }, { status: 400 });
    }

    const result = await pool.query(
      'DELETE FROM formulario_clientes WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ ok: false, message: 'Registro não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: 'Solicitação excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir solicitação:', error);
    return NextResponse.json(
      { ok: false, message: 'Erro ao excluir solicitação' },
      { status: 500 }
    );
  }
}
