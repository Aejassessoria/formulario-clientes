import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { cookies } from 'next/headers';

/** Valida o cookie admin-auth antes de servir o arquivo. */
async function autenticado(): Promise<boolean> {
  try {
    const jar = await cookies();
    const token = jar.get('admin-auth')?.value;
    if (!token) return false;

    const decoded  = Buffer.from(token, 'base64').toString('utf-8');
    const colonIdx = decoded.indexOf(':');
    const user     = decoded.slice(0, colonIdx);
    const pass     = decoded.slice(colonIdx + 1);

    return (
      user === process.env.ADMIN_USER &&
      pass === process.env.ADMIN_PASSWORD
    );
  } catch {
    return false;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await autenticado())) {
    return new NextResponse('Não autorizado', { status: 401 });
  }

  const { id } = await params;

  try {
    const { rows } = await pool.query(
      'SELECT nome, mime, dados FROM formulario_arquivos WHERE id = $1',
      [id]
    );

    if (!rows[0]) {
      return new NextResponse('Arquivo não encontrado', { status: 404 });
    }

    const { nome, mime, dados } = rows[0] as {
      nome: string;
      mime: string;
      dados: Buffer;
    };

    return new NextResponse(dados as unknown as BodyInit, {
      headers: {
        'Content-Type': mime || 'application/octet-stream',
        'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(nome)}`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[arquivos] Erro ao buscar arquivo:', error);
    return new NextResponse('Erro ao buscar arquivo', { status: 500 });
  }
}
