import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// Cria a tabela automaticamente se ainda não existir
async function garantirTabela() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS formulario_arquivos (
      id        UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
      campo     VARCHAR(50),
      nome      VARCHAR(255),
      mime      VARCHAR(100),
      dados     BYTEA,
      criado_em TIMESTAMPTZ  DEFAULT NOW()
    )
  `);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const campo = (formData.get('campo') as string) || 'misc';

  if (!file) {
    return NextResponse.json({ ok: false, message: 'Arquivo não enviado' }, { status: 400 });
  }

  try {
    await garantirTabela();

    const buffer = Buffer.from(await file.arrayBuffer());
    const mime   = file.type || 'application/octet-stream';

    const { rows } = await pool.query(
      `INSERT INTO formulario_arquivos (campo, nome, mime, dados)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [campo, file.name, mime, buffer]
    );

    const url = `/api/arquivos/${rows[0].id}`;
    return NextResponse.json({ ok: true, url, name: file.name });
  } catch (error) {
    console.error('[upload] Erro ao salvar arquivo:', error);
    // Não interrompe o envio do formulário
    return NextResponse.json({ ok: true, url: '', name: file.name });
  }
}
