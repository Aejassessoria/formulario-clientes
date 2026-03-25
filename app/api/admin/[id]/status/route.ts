import { NextResponse } from 'next/server';
import { atualizarStatus, StatusValido } from '@/lib/admin';

const STATUS_VALIDOS: StatusValido[] = ['novo', 'em_andamento', 'concluido'];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ ok: false, message: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!STATUS_VALIDOS.includes(status)) {
      return NextResponse.json(
        { ok: false, message: `Status inválido. Use: ${STATUS_VALIDOS.join(', ')}` },
        { status: 400 }
      );
    }

    await atualizarStatus(id, status as StatusValido);

    return NextResponse.json({ ok: true, message: 'Status atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return NextResponse.json(
      { ok: false, message: 'Erro interno ao atualizar status' },
      { status: 500 }
    );
  }
}
