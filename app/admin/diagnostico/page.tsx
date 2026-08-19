import Link from 'next/link';
import TestarEmailButton from './TestarEmailButton';
import { destinatariosNotificacao } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

function Linha({ rotulo, valor, ok }: { rotulo: string; valor: string; ok: boolean }) {
  return (
    <tr>
      <td style={{ whiteSpace: 'nowrap' }}>{rotulo}</td>
      <td style={{ color: ok ? '#085041' : '#a12020', fontWeight: 600 }}>
        {ok ? '✓ ' : '✗ '}{valor}
      </td>
    </tr>
  );
}

export default function DiagnosticoPage() {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const notify   = process.env.NOTIFY_EMAIL;

  const tudoCerto = Boolean(smtpUser && smtpPass);

  return (
    <div className="adm-detail-wrap">
      <div className="adm-bar">
        <Link href="/admin" className="btn-sec">← Voltar ao painel</Link>
      </div>

      <div className="adm-sec">
        <h2 className="adm-sec-t">Diagnóstico do aviso de nova ficha</h2>
        <p style={{ fontSize: 13, color: '#666', margin: '0 0 18px' }}>
          Esta página mostra o que o servidor enxerga das variáveis de ambiente.
          Nenhuma senha é exibida, apenas se existe ou não.
        </p>

        <table className="rtbl">
          <tbody>
            <Linha
              rotulo="SMTP_USER"
              valor={smtpUser || 'não definida'}
              ok={Boolean(smtpUser)}
            />
            <Linha
              rotulo="SMTP_PASS"
              valor={smtpPass ? `definida (${smtpPass.length} caracteres)` : 'não definida'}
              ok={Boolean(smtpPass)}
            />
            <Linha
              rotulo="SMTP_HOST"
              valor={process.env.SMTP_HOST || 'smtp.gmail.com (padrão)'}
              ok
            />
            <Linha
              rotulo="SMTP_PORT"
              valor={process.env.SMTP_PORT || '587 (padrão)'}
              ok
            />
            <Linha
              rotulo="NOTIFY_EMAIL"
              valor={notify || 'não definida, valendo a lista padrão do código'}
              ok
            />
            <Linha
              rotulo="Quem recebe o aviso"
              valor={destinatariosNotificacao() || 'ninguém'}
              ok={Boolean(destinatariosNotificacao())}
            />
          </tbody>
        </table>
      </div>

      <div className="adm-sec">
        <h2 className="adm-sec-t">Teste de envio</h2>
        <p style={{ fontSize: 13, color: '#666', margin: '0 0 18px' }}>
          {tudoCerto
            ? 'As variáveis existem. O botão abaixo tenta conectar no servidor de e-mail e enviar uma mensagem de teste, e mostra o erro exato se falhar.'
            : 'Falta configurar SMTP_USER e/ou SMTP_PASS na Vercel, em Settings > Environment Variables. Sem elas nenhum e-mail sai, nem o aviso automático nem o envio manual da ficha.'}
        </p>
        <TestarEmailButton />
      </div>
    </div>
  );
}
