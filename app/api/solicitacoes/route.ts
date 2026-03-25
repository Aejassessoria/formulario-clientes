import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    await pool.query(
      `INSERT INTO formulario_clientes
       (nome_empresa, cnpj, nome_responsavel, email, telefone, payload)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        body.nome_empresa || null,
        body.cnpj         || null,
        body.nome_responsavel || null,
        body.email        || null,
        body.telefone     || null,
        body,
      ]
    );

    return NextResponse.json({ ok: true, message: 'Solicitação salva com sucesso' });
  } catch (error) {
    console.error('Erro ao salvar solicitação:', error);
    return NextResponse.json(
      { ok: false, message: 'Erro ao processar a solicitação' },
      { status: 500 }
    );
  }
}
