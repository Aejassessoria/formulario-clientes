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

/**
 * Destinatários da notificação interna de nova ficha.
 * Definido em NOTIFY_EMAIL (aceita vários separados por vírgula).
 * Sem a variável, cai no próprio SMTP_USER.
 */
export function destinatariosNotificacao(): string {
  return process.env.NOTIFY_EMAIL || process.env.SMTP_USER || '';
}
