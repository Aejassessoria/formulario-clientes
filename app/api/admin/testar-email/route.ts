import { NextResponse } from 'next/server';
import { autenticado } from '@/lib/auth';
import {
  criarTransporter,
  destinatariosNotificacao,
  remetente,
  smtpConfigurado,
} from '@/lib/mailer';
import { gerarEmailNovaFicha } from '@/lib/emailTemplate';

/**
 * Dispara o mesmo aviso que o formulário dispara, com dados fictícios, e
 * devolve o erro exato do servidor SMTP quando falha. Serve para descobrir
 * o que está faltando sem precisar olhar log de produção.
 */
export async function POST() {
  if (!(await autenticado())) {
    return NextResponse.json({ ok: false, etapa: 'login', message: 'Não autorizado' }, { status: 401 });
  }

  const para = destinatariosNotificacao();

  if (!smtpConfigurado()) {
    const faltando = [
      !process.env.SMTP_USER && 'SMTP_USER',
      !process.env.SMTP_PASS && 'SMTP_PASS',
    ].filter(Boolean).join(' e ');

    return NextResponse.json({
      ok: false,
      etapa: 'configuracao',
      message: `Falta configurar ${faltando} nas variáveis de ambiente da Vercel. Sem isso nenhum e-mail é enviado.`,
    });
  }

  const transporter = criarTransporter();

  try {
    await transporter.verify();
  } catch (erro) {
    const msg = erro instanceof Error ? erro.message : String(erro);
    return NextResponse.json({
      ok: false,
      etapa: 'conexao',
      message: `O servidor SMTP recusou a conexão ou o login: ${msg}`,
    });
  }

  try {
    await transporter.sendMail({
      from: remetente(),
      to: para,
      subject: 'Teste do aviso de nova ficha',
      html: gerarEmailNovaFicha({
        empresa: 'EMPRESA DE TESTE LTDA',
        responsavel: 'Teste do sistema',
        email: 'teste@exemplo.com',
        telefone: '(48) 90000-0000',
        tipo: 'LTDA',
        protocolo: 'TESTE',
        linkPainel: '',
      }),
    });
  } catch (erro) {
    const msg = erro instanceof Error ? erro.message : String(erro);
    return NextResponse.json({
      ok: false,
      etapa: 'envio',
      message: `A conexão funcionou, mas o envio falhou: ${msg}`,
    });
  }

  return NextResponse.json({
    ok: true,
    etapa: 'envio',
    message: `E-mail de teste enviado para ${para}. Confira a caixa de entrada e o spam.`,
  });
}
