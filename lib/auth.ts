import { cookies } from 'next/headers';

/**
 * Valida o cookie admin-auth.
 *
 * O middleware só cobre /admin/:path*, então as rotas em /api/admin precisam
 * fazer essa checagem por conta própria.
 */
export async function autenticado(): Promise<boolean> {
  try {
    const jar   = await cookies();
    const token = jar.get('admin-auth')?.value;
    if (!token) return false;

    const decoded  = Buffer.from(token, 'base64').toString('utf-8');
    const colonIdx = decoded.indexOf(':');
    const user     = decoded.slice(0, colonIdx);
    const pass     = decoded.slice(colonIdx + 1);

    return (
      user === process.env.ADMIN_USER &&
      pass === process.env.ADMIN_PASSWORD
    );
  } catch {
    return false;
  }
}
