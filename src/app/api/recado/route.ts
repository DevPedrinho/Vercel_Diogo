import { NextResponse } from "next/server";
import { ABAS, anexarLinha, planilhaConfigurada } from "@/lib/planilha";

/** O nome e o recado de quem presenteou, numa linha da aba Recados. */
export async function POST(request: Request) {
  if (!planilhaConfigurada) return NextResponse.json({ ok: false, erro: "Indisponível." }, { status: 503 });
  const corpo = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!corpo) return NextResponse.json({ ok: false, erro: "Pedido inválido." }, { status: 400 });
  if (String(corpo.site ?? "").trim()) return NextResponse.json({ ok: true });

  const nome = String(corpo.nome ?? "").trim().slice(0, 80);
  if (!nome) return NextResponse.json({ ok: false, erro: "Escreva seu nome." }, { status: 400 });

  try {
    await anexarLinha(ABAS.recados, {
      presente: String(corpo.presente ?? "").trim().slice(0, 120),
      nome,
      recado: String(corpo.recado ?? "").trim().slice(0, 500),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, erro: "Não deu para enviar agora." }, { status: 502 });
  }
}
