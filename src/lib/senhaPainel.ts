/**
 * Senha do painel quando o site roda sem Supabase (só com a planilha).
 *
 * A senha fica em ADMIN_SENHA na Vercel. O cookie guarda um HMAC dela, não
 * a senha: quem copiar o cookie não descobre a senha, e trocar a senha na
 * Vercel derruba todas as sessões antigas. Usa Web Crypto para rodar igual
 * no middleware (Edge) e no servidor.
 */

export const COOKIE_PAINEL = "painel_vd";

export const senhaPainelDefinida = () => Boolean(process.env.ADMIN_SENHA);

export async function assinaturaDoPainel(): Promise<string | null> {
  const senha = process.env.ADMIN_SENHA;
  if (!senha) return null;
  const chave = await crypto.subtle.importKey("raw", new TextEncoder().encode(senha), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const assinatura = await crypto.subtle.sign("HMAC", chave, new TextEncoder().encode("painel-casamento-vercia-diogo-v1"));
  return Array.from(new Uint8Array(assinatura), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Comparação sem atalho, para não vazar a assinatura pelo tempo de resposta. */
export function iguais(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diferenca = 0;
  for (let i = 0; i < a.length; i++) diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diferenca === 0;
}

export async function cookieValido(valor: string | undefined): Promise<boolean> {
  const esperado = await assinaturaDoPainel();
  return Boolean(esperado && valor && iguais(valor, esperado));
}
