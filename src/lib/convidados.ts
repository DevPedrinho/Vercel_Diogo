import "server-only";
import { ABAS, lerAba, planilhaConfigurada } from "@/lib/planilha";

/**
 * Lista de convidados (aba Convidados da planilha).
 *
 * Quem está na lista é reconhecido no formulário de confirmação: digita o
 * nome ou o WhatsApp, o site acha o convite e a pessoa só responde se vai.
 * Sem a aba (ou com ela vazia) o formulário segue o normal, em branco.
 */

export type Convidado = {
  id: string;
  nome: string;
  whatsapp: string;
  /** Quantas pessoas o convite inclui além do titular. null = não definido. */
  acompanhantes: number | null;
  nomesAcompanhantes: string[];
};

/**
 * O que o navegador recebe: só o convite de quem buscou, nunca a lista, e
 * sem o WhatsApp (o servidor completa na hora de gravar).
 */
export type ConvitePublico = Omit<Convidado, "whatsapp"> & {
  temWhatsapp: boolean;
  /** Resposta que já está na aba Confirmações, se a pessoa já respondeu. */
  respostaAnterior: { vai: boolean; acompanhantes: number; data: string } | null;
};

export type ResultadoBusca =
  | { status: "achou"; convite: ConvitePublico }
  | { status: "ambiguo" }
  | { status: "nao_achou" };

const texto = (v: unknown) => (v === null || v === undefined ? "" : String(v).trim());
const digitos = (v: unknown) => texto(v).replace(/\D/g, "");

/** "  Vércia  DE Souza " → "vercia de souza". */
export function normalizar(v: unknown): string {
  return texto(v)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const LIGACOES = new Set(["de", "da", "do", "das", "dos", "e"]);
const partes = (nome: string) => normalizar(nome).split(" ").filter((p) => p && !LIGACOES.has(p));

function dividirNomes(v: unknown): string[] {
  return texto(v)
    .split(/\r?\n|;|,| e (?=[A-ZÀ-Ú])/)
    .map((n) => n.trim())
    .filter(Boolean);
}

function convidadoDaLinha(l: Record<string, unknown>): Convidado | null {
  const nome = texto(l.nome);
  const id = texto(l.id);
  if (!nome || !id) return null;
  const acomp = texto(l.acompanhantes);
  return {
    id,
    nome,
    whatsapp: texto(l.whatsapp),
    acompanhantes: acomp === "" || !Number.isFinite(Number(acomp)) ? null : Math.max(0, Math.round(Number(acomp))),
    nomesAcompanhantes: dividirNomes(l.nomes_acompanhantes),
  };
}

export async function carregarConvidados(): Promise<Convidado[]> {
  if (!planilhaConfigurada) return [];
  try {
    const linhas = await lerAba(ABAS.convidados, 60);
    return linhas.map(convidadoDaLinha).filter((c): c is Convidado => c !== null);
  } catch {
    // Aba ainda não existe (script antigo) ou o Google falhou: formulário normal.
    return [];
  }
}

/** Linhas da aba Confirmações que são deste convidado (pelo nome do convite). */
export async function respostasDoConvidado(c: Convidado): Promise<{ id: string; vai: boolean; acompanhantes: number; data: string }[]> {
  const alvo = normalizar(c.nome);
  const linhas = await lerAba(ABAS.confirmacoes);
  return linhas
    .filter((l) => normalizar(l.nome) === alvo)
    .map((l) => ({
      id: texto(l.id),
      vai: /^(sim|s|true|1|x|vai|verdadeiro)$/i.test(texto(l.vai)),
      acompanhantes: Math.max(0, Math.round(Number(l.acompanhantes) || 0)),
      data: texto(l.data),
    }));
}

async function publico(c: Convidado): Promise<ConvitePublico> {
  let respostaAnterior: ConvitePublico["respostaAnterior"] = null;
  try {
    const anteriores = await respostasDoConvidado(c);
    const ultima = anteriores[anteriores.length - 1];
    if (ultima) respostaAnterior = { vai: ultima.vai, acompanhantes: ultima.acompanhantes, data: ultima.data };
  } catch {
    // Sem a resposta anterior o formulário funciona igual.
  }
  const { whatsapp, ...resto } = c;
  return { ...resto, temWhatsapp: Boolean(whatsapp), respostaAnterior };
}

/** Convite completo (com WhatsApp), só para uso no servidor. */
export async function convidadoDoCodigo(codigo: string): Promise<Convidado | null> {
  const id = texto(codigo);
  if (!id) return null;
  return (await carregarConvidados()).find((x) => x.id === id) ?? null;
}

export async function conviteDoCodigo(codigo: string): Promise<ConvitePublico | null> {
  const c = await convidadoDoCodigo(codigo);
  return c ? publico(c) : null;
}

/**
 * Acha o convite pelo nome (do titular ou de um acompanhante) ou pelo WhatsApp.
 * Só o primeiro nome não basta: é fácil ter duas Marias na lista.
 */
export async function buscarConvite(termo: string): Promise<ResultadoBusca> {
  const lista = await carregarConvidados();
  if (!lista.length) return { status: "nao_achou" };

  const tel = digitos(termo);
  if (tel.length >= 8 && tel.length >= texto(termo).replace(/\s/g, "").length - 4) {
    const fim = tel.slice(-8);
    const achados = lista.filter((c) => digitos(c.whatsapp).length >= 8 && digitos(c.whatsapp).slice(-8) === fim);
    return resultado(achados);
  }

  const alvo = normalizar(termo);
  const pedacos = partes(termo);
  if (pedacos.length < 2) return { status: "nao_achou" };

  const nomesDe = (c: Convidado) => [c.nome, ...c.nomesAcompanhantes];
  const exatos = lista.filter((c) => nomesDe(c).some((n) => normalizar(n) === alvo));
  if (exatos.length) return resultado(exatos);

  // "Maria Silva" acha "Maria José da Silva": todas as partes digitadas aparecem no nome.
  const parecidos = lista.filter((c) =>
    nomesDe(c).some((n) => {
      const doNome = partes(n);
      return pedacos.every((p) => doNome.includes(p));
    }),
  );
  return resultado(parecidos);
}

async function resultado(achados: Convidado[]): Promise<ResultadoBusca> {
  if (achados.length === 1) return { status: "achou", convite: await publico(achados[0]) };
  if (achados.length > 1) return { status: "ambiguo" };
  return { status: "nao_achou" };
}
