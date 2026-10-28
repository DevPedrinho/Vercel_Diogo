import { NextResponse } from "next/server";
import { buscarConvite, conviteDoCodigo } from "@/lib/convidados";

/**
 * Procura o convite de quem vai confirmar: pelo nome/WhatsApp digitado ou
 * pelo código do link pessoal. Devolve só aquele convite, nunca a lista.
 */
export async function POST(request: Request) {
  const corpo = (await request.json().catch(() => null)) as { busca?: unknown; codigo?: unknown } | null;
  if (!corpo) return NextResponse.json({ ok: false, erro: "Pedido inválido." }, { status: 400 });

  if (corpo.codigo) {
    const convite = await conviteDoCodigo(String(corpo.codigo).slice(0, 40));
    return NextResponse.json(convite ? { ok: true, status: "achou", convite } : { ok: true, status: "nao_achou" });
  }

  const busca = String(corpo.busca ?? "").trim().slice(0, 120);
  if (busca.length < 2) return NextResponse.json({ ok: false, erro: "Escreva seu nome completo ou seu WhatsApp." }, { status: 400 });
  return NextResponse.json({ ok: true, ...(await buscarConvite(busca)) });
}
