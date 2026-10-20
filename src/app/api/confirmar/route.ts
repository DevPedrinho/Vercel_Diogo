import { NextResponse } from "next/server";
import { carregarCasamento, prazoDaConfirmacao } from "@/lib/conteudo";
import { ABAS, anexarLinha, planilhaConfigurada } from "@/lib/planilha";

/** Recebe o formulário de confirmação e grava uma linha na planilha. */
export async function POST(request: Request) {
  if (!planilhaConfigurada) {
    return NextResponse.json({ ok: false, erro: "As confirmações abrem em instantes. Tente de novo mais tarde, por favor." }, { status: 503 });
  }

  const corpo = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!corpo) return NextResponse.json({ ok: false, erro: "Pedido inválido." }, { status: 400 });

  // Campo escondido que só robô preenche: finge que deu certo e descarta.
  if (String(corpo.site ?? "").trim()) return NextResponse.json({ ok: true });

  const c = await carregarCasamento();
  if (!prazoDaConfirmacao(c.rsvp_prazo).aberto) {
    return NextResponse.json({ ok: false, erro: "O prazo de confirmação terminou." }, { status: 403 });
  }

  const nome = String(corpo.nome ?? "").trim().slice(0, 120);
  const vai = corpo.vai === true;
  const acompanhantes = vai ? Math.min(10, Math.max(0, Math.round(Number(corpo.acompanhantes) || 0))) : 0;
  if (nome.length < 2) return NextResponse.json({ ok: false, erro: "Escreva seu nome completo." }, { status: 400 });

  try {
    await anexarLinha(ABAS.confirmacoes, {
      nome,
      vai: vai ? "Sim" : "Não",
      acompanhantes,
      nomes_acompanhantes: acompanhantes > 0 ? String(corpo.nomesAcompanhantes ?? "").trim().slice(0, 600) : "",
      whatsapp: String(corpo.whatsapp ?? "").trim().slice(0, 30),
      recado: String(corpo.recado ?? "").trim().slice(0, 600),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, erro: "Não deu para enviar agora. Tente de novo em instantes." }, { status: 502 });
  }
}
