import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const cookie = request.cookies.get('admin-auth');

  // Sem cookie → redireciona para /login
  if (!cookie?.value) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Valida o token (base64 de "user:pass")
  try {
    const decoded = atob(cookie.value);
    const colonIdx = decoded.indexOf(':');
    const user = decoded.slice(0, colonIdx);
    const pass = decoded.slice(colonIdx + 1);

    if (
      user !== process.env.ADMIN_USER ||
      pass !== process.env.ADMIN_PASSWORD
    ) {
      const res = NextResponse.redirect(new URL('/login', request.url));
      res.cookies.delete('admin-auth');
      return res;
    }
  } catch {
    const res = NextResponse.redirect(new URL('/login', request.url));
    res.cookies.delete('admin-auth');
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
