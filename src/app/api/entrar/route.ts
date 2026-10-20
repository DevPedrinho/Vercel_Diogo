import { NextResponse } from "next/server";
import { COOKIE_PAINEL, assinaturaDoPainel, iguais } from "@/lib/senhaPainel";

/** Login do painel por senha (modo sem Supabase). */
export async function POST(request: Request) {
  const { senha } = ((await request.json().catch(() => ({}))) ?? {}) as { senha?: string };
  const certa = process.env.ADMIN_SENHA;
  // Pausa fixa: tentar senhas no chute fica lento.
  await new Promise((r) => setTimeout(r, 600));
  if (!certa || typeof senha !== "string" || !iguais(senha, certa)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const resposta = NextResponse.json({ ok: true });
  resposta.cookies.set(COOKIE_PAINEL, (await assinaturaDoPainel())!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return resposta;
}
