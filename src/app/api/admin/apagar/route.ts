import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ABAS, apagarLinha, planilhaConfigurada } from "@/lib/planilha";
import { COOKIE_PAINEL, cookieValido } from "@/lib/senhaPainel";

/** Apaga uma confirmação ou um recado repetido, direto na planilha. */
export async function POST(request: Request) {
  if (!(await cookieValido((await cookies()).get(COOKIE_PAINEL)?.value))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!planilhaConfigurada) return NextResponse.json({ ok: false }, { status: 503 });
  const { aba, id } = ((await request.json().catch(() => ({}))) ?? {}) as { aba?: string; id?: string };
  const nome = aba === "confirmacoes" ? ABAS.confirmacoes : aba === "recados" ? ABAS.recados : null;
  if (!nome || !id) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    await apagarLinha(nome, id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
