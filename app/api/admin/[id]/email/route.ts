import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { buscarSolicitacao, nomeEmpresa } from '@/lib/admin';
import { gerarEmailHTML } from '@/lib/emailTemplate';

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
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json(
        { ok: false, message: 'Servidor de e-mail não configurado. Defina SMTP_USER e SMTP_PASS no .env.local' },
        { status: 503 }
      );
    }

    const empresa = nomeEmpresa(row);
    const html    = gerarEmailHTML(row, empresa);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"A&J Assessoria Contábil" <${process.env.SMTP_USER}>`,
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
