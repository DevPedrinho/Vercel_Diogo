import { NextResponse } from "next/server";
import { carregarCasamento, prazoDaConfirmacao } from "@/lib/conteudo";
import { ABAS, anexarLinha, apagarLinha, planilhaConfigurada } from "@/lib/planilha";
import { convidadoDoCodigo, respostasDoConvidado } from "@/lib/convidados";

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

  // Veio de um convite da lista: o nome é o da lista, o limite de
  // acompanhantes é o do convite e a resposta nova substitui a antiga.
  const convidado = corpo.convite ? await convidadoDoCodigo(String(corpo.convite).slice(0, 40)) : null;

  const nome = convidado ? convidado.nome : String(corpo.nome ?? "").trim().slice(0, 120);
  const vai = corpo.vai === true;
  const limite = convidado?.acompanhantes ?? 10;
  const acompanhantes = vai ? Math.min(limite, Math.max(0, Math.round(Number(corpo.acompanhantes) || 0))) : 0;
  if (nome.length < 2) return NextResponse.json({ ok: false, erro: "Escreva seu nome completo." }, { status: 400 });

  const whatsapp = String(corpo.whatsapp ?? "").trim().slice(0, 30) || convidado?.whatsapp || "";

  let anteriores: { id: string }[] = [];
  if (convidado) anteriores = await respostasDoConvidado(convidado).catch(() => []);

  try {
    await anexarLinha(ABAS.confirmacoes, {
      nome,
      vai: vai ? "Sim" : "Não",
      acompanhantes,
      nomes_acompanhantes: acompanhantes > 0 ? String(corpo.nomesAcompanhantes ?? "").trim().slice(0, 600) : "",
      whatsapp,
      recado: String(corpo.recado ?? "").trim().slice(0, 600),
    });
  } catch {
    return NextResponse.json({ ok: false, erro: "Não deu para enviar agora. Tente de novo em instantes." }, { status: 502 });
  }

  // Só apaga a resposta antiga depois que a nova entrou. Se falhar, sobra uma
  // linha repetida, que os noivos apagam no painel: nada se perde.
  for (const a of anteriores) {
    if (a.id) await apagarLinha(ABAS.confirmacoes, a.id).catch(() => undefined);
  }
  return NextResponse.json({ ok: true });
}
