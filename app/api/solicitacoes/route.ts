import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { criarTransporter, destinatariosNotificacao, remetente, smtpConfigurado } from '@/lib/mailer';
import { gerarEmailNovaFicha } from '@/lib/emailTemplate';

/** Monta a URL pública do painel a partir dos headers da requisição. */
function urlPainel(request: Request, id: string | null): string {
  if (!id) return '';
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  if (base) return `${base.replace(/\/$/, '')}/admin/${id}`;

  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (!host) return '';
  const proto = request.headers.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}/admin/${id}`;
}

/** Avisa a equipe que chegou uma ficha nova. Nunca derruba o salvamento. */
async function notificarNovaFicha(request: Request, id: string | null, body: Record<string, unknown>) {
  const para = destinatariosNotificacao();

  if (!smtpConfigurado() || !para) {
    console.warn('[solicitacoes] SMTP nao configurado, aviso de nova ficha nao enviado');
    return;
  }

  const empresa =
    (body.nome_empresa as string) || (body.razao_social as string) || 'Empresa sem nome informado';

  // Anexos que o cliente tentou enviar e o servidor não conseguiu guardar.
  const arquivos = (body.arquivos || {}) as Record<string, { name?: string; erro?: boolean }[]>;
  const anexosComFalha = Object.values(arquivos)
    .flat()
    .filter(a => a && a.erro === true)
    .map(a => a.name || 'arquivo sem nome');

  const html = gerarEmailNovaFicha({
    empresa,
    responsavel: (body.nome_responsavel as string) || (body.resp_nome as string) || '',
    email:       (body.email as string)  || (body.resp_email as string) || '',
    telefone:    (body.telefone as string) || (body.resp_tel as string) || '',
    tipo:        (body.tipo as string) || '',
    protocolo:   (body.protocolo as string) || '',
    linkPainel:  urlPainel(request, id),
    anexosComFalha,
  });

  await criarTransporter().sendMail({
    from: remetente(),
    to: para,
    replyTo: (body.email as string) || (body.resp_email as string) || undefined,
    subject: `Nova ficha de abertura: ${empresa}`,
    html,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { rows } = await pool.query<{ id: string }>(
      `INSERT INTO formulario_clientes
       (nome_empresa, cnpj, nome_responsavel, email, telefone, payload)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        body.nome_empresa || null,
        body.cnpj         || null,
        body.nome_responsavel || null,
        body.email        || null,
        body.telefone     || null,
        body,
      ]
    );

    const id = rows[0]?.id ?? null;

    try {
      await notificarNovaFicha(request, id, body);
    } catch (erroEmail) {
      // A ficha já está salva: falha no aviso não pode virar erro para o cliente.
      console.error('[solicitacoes] Falha ao enviar aviso de nova ficha:', erroEmail);
    }

    return NextResponse.json({ ok: true, message: 'Solicitação salva com sucesso' });
  } catch (error) {
    console.error('Erro ao salvar solicitação:', error);
    return NextResponse.json(
      { ok: false, message: 'Erro ao processar a solicitação' },
      { status: 500 }
    );
  }
}
