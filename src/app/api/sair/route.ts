import { NextResponse } from "next/server";
import { COOKIE_PAINEL } from "@/lib/senhaPainel";

export async function POST() {
  const resposta = NextResponse.json({ ok: true });
  resposta.cookies.delete(COOKIE_PAINEL);
  return resposta;
}
