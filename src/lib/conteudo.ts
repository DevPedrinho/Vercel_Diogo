import "server-only";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { supabaseConfigurado } from "@/lib/supabase/ativo";
import { urlDoSite } from "@/lib/storage";
import { completarTextos, type Textos } from "@/lib/textos";
import { ARQUIVO_MUSICA_DEMO, MUSICA_DEMO, PRESENTES_DEMO } from "@/lib/demo";
import type { MusicaDoSite, Presente } from "@/lib/tipos";

/**
 * Leitura do conteúdo do site no servidor. Nenhuma função daqui lança:
 * com o banco fora do ar ou ainda não configurado, o site abre com os
 * textos padrão em vez de quebrar.
 */

const FUSO = "America/Fortaleza";

export type Casamento = Textos & {
  dataISO: string;
  /** 16 . 01 . 2027 */
  dataCurta: string;
  /** 16 de janeiro de 2027 */
  dataExtenso: string;
  /** 19h, 19h30 */
  hora: string;
  imagemCasal: string;
};

function montar(textos: Textos): Casamento {
  const data = new Date(textos.data_hora);
  const valida = !Number.isNaN(data.getTime());
  const d = valida ? data : new Date("2027-01-16T19:00:00-03:00");

  const partes = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: FUSO,
  }).formatToParts(d);
  const p = (t: string) => partes.find((x) => x.type === t)?.value ?? "";

  const [h, m] = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: FUSO,
  })
    .format(d)
    .split(":");

  return {
    ...textos,
    dataISO: d.toISOString(),
    dataCurta: `${p("day")} . ${p("month")} . ${p("year")}`,
    dataExtenso: d.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: FUSO,
    }),
    hora: `${Number(h)}h${m === "00" ? "" : m}`,
    imagemCasal: urlDoSite(textos.imagem_casal) ?? "/img/casal.png",
  };
}

export async function carregarCasamento(): Promise<Casamento> {
  if (!supabaseConfigurado) return montar(completarTextos(null));
  try {
    const supabase = await criarClienteServidor();
    const { data } = await supabase.from("site_content").select("texts").maybeSingle();
    return montar(completarTextos((data?.texts as Record<string, unknown>) ?? null));
  } catch {
    return montar(completarTextos(null));
  }
}

/** Os textos crus (sem os derivados), para o editor do painel. */
export async function carregarTextosSalvos(): Promise<Record<string, string>> {
  if (!supabaseConfigurado) return {};
  try {
    const supabase = await criarClienteServidor();
    const { data } = await supabase.from("site_content").select("texts").maybeSingle();
    return (data?.texts as Record<string, string>) ?? {};
  } catch {
    return {};
  }
}

export async function carregarPresentes({ todos = false } = {}): Promise<Presente[]> {
  if (!supabaseConfigurado) return PRESENTES_DEMO;
  try {
    const supabase = await criarClienteServidor();
    let consulta = supabase.from("gifts").select("*");
    if (!todos) consulta = consulta.eq("is_active", true);
    const { data } = await consulta
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    return (data ?? []) as Presente[];
  } catch {
    return [];
  }
}

export async function carregarMusica(): Promise<MusicaDoSite> {
  if (!supabaseConfigurado) return MUSICA_DEMO;
  try {
    const supabase = await criarClienteServidor();
    const { data } = await supabase.from("site_music").select("*").maybeSingle();
    return (data as MusicaDoSite | null) ?? { ...MUSICA_DEMO, file_path: null, enabled: false };
  } catch {
    return { ...MUSICA_DEMO, file_path: null, enabled: false };
  }
}

export type FaixaDoSite = { arquivo: string; titulo: string; artista?: string; volume: number };

/** A faixa que o player toca, ou null quando a música está desligada. */
export function faixaDoSite(musica: MusicaDoSite): FaixaDoSite | null {
  if (!musica.enabled) return null;
  const arquivo = urlDoSite(musica.file_path) ?? (supabaseConfigurado ? null : ARQUIVO_MUSICA_DEMO);
  if (!arquivo) return null;
  return {
    arquivo,
    titulo: musica.title || "Nossa música",
    artista: musica.artist ?? undefined,
    volume: Math.min(1, Math.max(0, musica.volume ?? 0.5)),
  };
}
