import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const campo = (formData.get('campo') as string) || 'misc';

  if (!file) {
    return NextResponse.json({ ok: false, message: 'Arquivo não enviado' }, { status: 400 });
  }

  // Se BLOB_READ_WRITE_TOKEN não estiver configurado, apenas confirma sem URL
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn('[upload] BLOB_READ_WRITE_TOKEN não configurado — arquivo não armazenado');
    return NextResponse.json({ ok: true, url: '', name: file.name });
  }

  try {
    const { put } = await import('@vercel/blob');
    const blob = await put(
      `formularios/${campo}/${Date.now()}-${file.name}`,
      file,
      { access: 'public' }
    );
    return NextResponse.json({ ok: true, url: blob.url, name: file.name });
  } catch (error) {
    console.error('[upload] Erro ao enviar para Vercel Blob:', error);
    // Não falha a submissão do formulário por causa do upload
    return NextResponse.json({ ok: true, url: '', name: file.name });
  }
}
