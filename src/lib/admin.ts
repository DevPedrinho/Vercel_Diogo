import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_PAINEL, cookieValido, senhaPainelDefinida } from "@/lib/senhaPainel";
import { ABAS, lerAba, planilhaConfigurada } from "@/lib/planilha";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { supabaseConfigurado } from "@/lib/supabase/ativo";

export type Sessao = {
  email: string;
  /** Sem Supabase: textos, história, padrinhos e música não salvam pelo painel. */
  demo: boolean;
};

/**
 * Porteiro do /admin. O middleware já barra quem não entrou; aqui
 * confirmamos que a conta está em public.admins. Sem Supabase, o painel
 * abre em modo demonstração (só para olhar).
 */
export async function exigirAdmin(): Promise<Sessao> {
  if (!supabaseConfigurado) {
    if (senhaPainelDefinida()) {
      const cookie = (await cookies()).get(COOKIE_PAINEL)?.value;
      if (!(await cookieValido(cookie))) redirect("/entrar?proximo=/admin");
      return { email: "noivos", demo: true };
    }
    // Com a planilha ligada o painel mostra nomes e telefones: sem senha
    // definida, ninguém entra.
    if (planilhaConfigurada) redirect("/entrar?sem-senha=1");
    return { email: "demonstração", demo: true };
  }

  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?proximo=/admin");

  const { data } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!data) redirect("/entrar?sem-permissao=1");

  return { email: user.email ?? "", demo: false };
}

export type RecadoComPresente = {
  id: string;
  name: string;
  message: string | null;
  created_at: string;
  gifts: { title: string } | null;
};

/** Os recados de quem presenteou, mais novos primeiro. */
export async function carregarRecados(limite = 100): Promise<RecadoComPresente[]> {
  if (planilhaConfigurada) {
    try {
      const linhas = await lerAba(ABAS.recados);
      return linhas
        .filter((l) => String(l.nome ?? "").trim())
        .map((l, i) => ({
          id: String(l.id || `linha-${i + 2}`),
          name: String(l.nome),
          message: String(l.recado ?? "").trim() || null,
          created_at: String(l.data || ""),
          gifts: String(l.presente ?? "").trim() ? { title: String(l.presente) } : null,
        }))
        .reverse()
        .slice(0, limite);
    } catch {
      return [];
    }
  }
  if (!supabaseConfigurado) return [];
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("gift_messages")
    .select("id, name, message, created_at, gifts(title)")
    .order("created_at", { ascending: false })
    .limit(limite);
  return (data ?? []) as unknown as RecadoComPresente[];
}
