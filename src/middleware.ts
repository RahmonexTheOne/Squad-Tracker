import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ✅ FIX DISCORD: éviter le 308 sur /api/interactions/
  // Rewrite interne => Discord voit 200, pas de redirect.
  if (pathname === '/api/interactions/') {
    const url = request.nextUrl.clone();
    url.pathname = '/api/interactions';
    return NextResponse.rewrite(url);
  }

  // 0. SECURITÉ API : on laisse passer tout /api (incluant /api/interactions)
  const isApi = pathname.startsWith('/api');
  if (isApi) {
    return NextResponse.next();
  }

  // 1. On prépare la réponse Supabase
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isAuthPage =
    pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isCallback = pathname.startsWith('/auth');

  if (!user && !isAuthPage && !isCallback) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // ✅ IMPORTANT : on force le middleware à matcher /api/interactions/*
    '/api/interactions/:path*',

    // le reste de ton matcher (inchangé dans l’esprit)
    '/((?!_next/static|_next/image|favicon.ico|characters|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
