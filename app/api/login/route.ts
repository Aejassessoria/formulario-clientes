import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { user, password } = await request.json();

    const expectedUser = process.env.ADMIN_USER;
    const expectedPass = process.env.ADMIN_PASSWORD;

    if (!expectedUser || !expectedPass) {
      return NextResponse.json(
        { ok: false, message: 'Servidor não configurado. Defina ADMIN_USER e ADMIN_PASSWORD.' },
        { status: 503 }
      );
    }

    if (user !== expectedUser || password !== expectedPass) {
      return NextResponse.json(
        { ok: false, message: 'Usuário ou senha incorretos' },
        { status: 401 }
      );
    }

    // Token = base64("user:pass") — simples para uso interno
    const token = Buffer.from(`${user}:${password}`).toString('base64');

    const response = NextResponse.json({ ok: true });
    response.cookies.set('admin-auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Erro ao processar a requisição' },
      { status: 400 }
    );
  }
}
