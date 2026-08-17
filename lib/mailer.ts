import nodemailer from 'nodemailer';

/** True quando as credenciais SMTP estão definidas no ambiente. */
export function smtpConfigurado(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

/** Transporter SMTP compartilhado pelas rotas que enviam e-mail. */
export function criarTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/** Remetente padrão dos e-mails do sistema. */
export function remetente(): string {
  return `"A&J Assessoria Contábil" <${process.env.SMTP_USER}>`;
}

/** Caixas que recebem o aviso de nova ficha quando NOTIFY_EMAIL não está definida. */
const DESTINATARIOS_PADRAO = [
  'contato@aejcontabil.com',
  'societario@aejcontabil.com',
];

/**
 * Destinatários da notificação interna de nova ficha.
 * NOTIFY_EMAIL (vários separados por vírgula) tem prioridade e substitui a lista
 * padrão por completo. Sem a variável, vale DESTINATARIOS_PADRAO.
 */
export function destinatariosNotificacao(): string {
  const lista = process.env.NOTIFY_EMAIL || DESTINATARIOS_PADRAO.join(',');
  return lista
    .split(',')
    .map(e => e.trim())
    .filter(Boolean)
    .join(', ');
}
