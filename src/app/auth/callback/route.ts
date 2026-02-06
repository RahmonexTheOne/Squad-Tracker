import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Par défaut on redirige vers la racine (Dashboard), sinon vers la page demandée
  const next = searchParams.get('next') ?? '/';

  if (code) {
    // 1. On prépare la réponse de redirection (C'est elle qui portera les cookies)
    const response = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // MAGIE ICI : On écrit le cookie directement dans la réponse qu'on va renvoyer
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

    // 2. On échange le code contre la session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 3. Si tout est bon, on renvoie la réponse AVEC les cookies
      return response;
    }
  }

  // Si erreur, retour au login avec un message
  return NextResponse.redirect(`${origin}/login?error=auth_code_error`);
}