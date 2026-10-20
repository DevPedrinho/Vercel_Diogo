import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { COOKIE_PAINEL, cookieValido, senhaPainelDefinida } from "@/lib/senhaPainel";

/**
 * Renova a sessão a cada navegação e barra o /admin para quem não entrou.
 * Sem Supabase configurado (modo demonstração) não há sessão a renovar.
 */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !chave) {
    // Sem Supabase: o painel fica atrás da senha de ADMIN_SENHA (se houver).
    if (senhaPainelDefinida() && request.nextUrl.pathname.startsWith("/admin")) {
      const ok = await cookieValido(request.cookies.get(COOKIE_PAINEL)?.value);
      if (!ok) {
        const destino = request.nextUrl.clone();
        destino.pathname = "/entrar";
        destino.search = "";
        destino.searchParams.set("proximo", request.nextUrl.pathname);
        return NextResponse.redirect(destino);
      }
    }
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, chave, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/admin")) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/entrar";
    destino.search = "";
    destino.searchParams.set("proximo", request.nextUrl.pathname);
    return NextResponse.redirect(destino);
  }

  return response;
}

export const config = {
  // Só onde há sessão em jogo: o site público é aberto e não precisa dela.
  matcher: ["/admin/:path*", "/entrar"],
};
