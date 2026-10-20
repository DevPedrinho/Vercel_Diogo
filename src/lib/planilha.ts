import "server-only";
import type { Confirmacao, Presente } from "@/lib/tipos";

/**
 * Google Planilhas como banco de dados.
 *
 * O site conversa com um Apps Script publicado como "app da Web" dentro da
 * planilha dos noivos (o código está em integracoes/google-planilhas). Ele
 * lê e grava linhas de três abas — Presentes, Confirmações e Recados — e só
 * responde a quem mandar o token combinado, que fica só no servidor.
 *
 * Sem GOOGLE_PLANILHA_URL o site segue com o conteúdo inicial do código.
 */

const URL_SCRIPT = process.env.GOOGLE_PLANILHA_URL;
const TOKEN = process.env.GOOGLE_PLANILHA_TOKEN;

export const planilhaConfigurada = Boolean(URL_SCRIPT && TOKEN);

/** O endereço da planilha para abrir no navegador (só para os botões do painel). */
export const LINK_PLANILHA =
  process.env.GOOGLE_PLANILHA_LINK ||
  "https://docs.google.com/spreadsheets/d/1F-ybmBle0v0zi6gR8cQ1CW27dWJp2sRPH1LYd3KSOSA/edit";

export const ABAS = {
  presentes: "Presentes",
  confirmacoes: "Confirmações",
  recados: "Recados",
} as const;

type Linha = Record<string, string | number | boolean | null>;

async function chamar<T>(corpo: Record<string, unknown>, cacheSegundos = 0): Promise<T> {
  if (!URL_SCRIPT || !TOKEN) throw new Error("Planilha não configurada");
  // O Apps Script responde com um redirecionamento para o resultado; o
  // fetch segue sozinho. O token vai no corpo, nunca na URL.
  const resposta = await fetch(URL_SCRIPT, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ ...corpo, token: TOKEN }),
    redirect: "follow",
    ...(cacheSegundos > 0 ? { next: { revalidate: cacheSegundos, tags: [`aba:${corpo.aba}`] } } : { cache: "no-store" as const }),
  });
  const json = (await resposta.json()) as { ok: boolean; erro?: string } & T;
  if (!json.ok) throw new Error(json.erro || "Falha na planilha");
  return json;
}

export async function lerAba(aba: string, cacheSegundos = 0): Promise<Linha[]> {
  const { linhas } = await chamar<{ linhas: Linha[] }>({ acao: "ler", aba }, cacheSegundos);
  return linhas;
}

export async function anexarLinha(aba: string, dados: Linha): Promise<void> {
  await chamar({ acao: "anexar", aba, dados });
}

export async function apagarLinha(aba: string, id: string): Promise<void> {
  await chamar({ acao: "apagar", aba, id });
}

/* ---------- Conversões linha da planilha ⇄ tipos do site ---------- */

const texto = (v: unknown) => (v === null || v === undefined ? "" : String(v).trim());

function sim(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  return /^(sim|s|true|1|x|vai|verdadeiro)$/i.test(texto(v));
}

/** "R$ 1.250,50", "1250.5" ou 1250 → centavos. Vazio → null (valor livre). */
function centavos(v: unknown): number | null {
  if (typeof v === "number") return Math.round(v * 100);
  const limpo = texto(v).replace(/[R$\s]/g, "");
  if (!limpo) return null;
  const normal = limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo;
  const n = Number(normal);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
}

/**
 * Aceita link de imagem direto ou link de compartilhamento do Google Drive
 * ("…/file/d/ID/view" ou "…open?id=ID"), que vira um endereço de imagem.
 * O arquivo no Drive precisa estar como "qualquer pessoa com o link".
 */
export function imagemDaPlanilha(v: unknown): string | null {
  const url = texto(v);
  if (!/^https?:\/\//i.test(url)) return null;
  const drive = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{10,})/);
  if (drive) return `https://drive.google.com/thumbnail?id=${drive[1]}&sz=w1200`;
  return url;
}

export function presenteDaLinha(l: Linha, i: number): Presente | null {
  const titulo = texto(l.titulo);
  if (!titulo) return null;
  const ativo = texto(l.ativo);
  return {
    id: texto(l.id) || `linha-${i + 2}`,
    title: titulo,
    description: texto(l.descricao) || null,
    category: texto(l.categoria) || "Casa",
    price_cents: centavos(l.valor),
    image_path: null,
    image_url: imagemDaPlanilha(l.imagem),
    gift_url: /^https?:\/\//i.test(texto(l.link)) ? texto(l.link) : null,
    // Vazio conta como ativo: só some quem tiver "não" na coluna.
    is_active: ativo === "" || sim(ativo),
    sort_order: Number(l.ordem) || i + 1,
    created_at: "",
  };
}

export function confirmacaoDaLinha(l: Linha, i: number): Confirmacao | null {
  const nome = texto(l.nome);
  if (!nome) return null;
  return {
    id: texto(l.id) || `linha-${i + 2}`,
    name: nome,
    attending: sim(l.vai),
    companions: Math.max(0, Math.round(Number(l.acompanhantes) || 0)),
    companion_names: texto(l.nomes_acompanhantes) || null,
    phone: texto(l.whatsapp) || null,
    message: texto(l.recado) || null,
    created_at: texto(l.data) || new Date(0).toISOString(),
  };
}
