import { NextResponse } from 'next/server';
import { buscarSolicitacao, nomeEmpresa } from '@/lib/admin';
import { gerarEmailHTML } from '@/lib/emailTemplate';
import { criarTransporter, remetente, smtpConfigurado } from '@/lib/mailer';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { para } = await request.json();

    if (!para) {
      return NextResponse.json({ ok: false, message: 'E-mail destinatário não informado' }, { status: 400 });
    }

    const row = await buscarSolicitacao(id);
    if (!row) {
      return NextResponse.json({ ok: false, message: 'Solicitação não encontrada' }, { status: 404 });
    }

    // Verifica configuração SMTP
    if (!smtpConfigurado()) {
      return NextResponse.json(
        { ok: false, message: 'Servidor de e-mail não configurado. Defina SMTP_USER e SMTP_PASS no .env.local' },
        { status: 503 }
      );
    }

    const empresa = nomeEmpresa(row);
    const html    = gerarEmailHTML(row, empresa);

    await criarTransporter().sendMail({
      from: remetente(),
      to: para,
      subject: `Solicitação de Abertura — ${empresa}`,
      html,
    });

    return NextResponse.json({ ok: true, message: `E-mail enviado para ${para}` });
  } catch (error) {
    console.error('[email] Erro ao enviar e-mail:', error);
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ ok: false, message: `Erro ao enviar: ${msg}` }, { status: 500 });
  }
}
