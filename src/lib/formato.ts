/** Formata centavos como moeda brasileira. Sem valor = "valor livre". */
export function formatarPreco(centavos: number | null): string | null {
  if (centavos === null || centavos === undefined) return null;
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Só deixa passar links http(s). Bloqueia `javascript:` e afins, já que o
 * endereço vem de um campo de texto do painel e vai direto para um href.
 */
export function linkSeguro(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

/** Converte "1.234,56" ou "1234.56" em centavos. null quando vazio ou inválido. */
export function paraCentavos(valor: string): number | null {
  const limpo = valor.trim();
  if (!limpo) return null;
  const normalizado = limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo;
  const numero = Number(normalizado);
  return Number.isFinite(numero) && numero >= 0 ? Math.round(numero * 100) : null;
}

/** Centavos -> texto editável no formulário ("" quando não há valor). */
export function paraCampo(centavos: number | null | undefined): string {
  return centavos === null || centavos === undefined
    ? ""
    : (centavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

export function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Fortaleza",
  });
}
