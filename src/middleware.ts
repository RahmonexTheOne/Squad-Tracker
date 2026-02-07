import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // 0. SECURITÉ API : On laisse passer tout ce qui commence par /api
  // C'est crucial pour que Discord puisse parler au bot sans être connecté
  const isApi = request.nextUrl.pathname.startsWith('/api');
  if (isApi) {
    return NextResponse.next();
  }

  // 1. On prépare la réponse Supabase
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
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
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // 2. Rafraîchir la session si nécessaire
  const { data: { user } } = await supabase.auth.getUser();

  // 3. Gestion des redirections
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup');
  const isCallback = request.nextUrl.pathname.startsWith('/auth');

  // Si pas connecté et page protégée (ET que ce n'est pas une API) -> Login
  if (!user && !isAuthPage && !isCallback && !isApi) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si connecté et page Login/Signup -> Dashboard
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // J'ai ajouté "|api" dans la liste des exclusions ci-dessous pour que le middleware ignore ces routes
    '/((?!_next/static|_next/image|favicon.ico|characters|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};