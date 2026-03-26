import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { nome, email, telefone } = await request.json();
    await pool.query(
      'INSERT INTO rascunhos (nome, email, telefone) VALUES ($1, $2, $3)',
      [nome || null, email || null, telefone || null]
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
