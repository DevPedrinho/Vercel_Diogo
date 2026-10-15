import "server-only";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { supabaseConfigurado } from "@/lib/supabase/ativo";

export type Sessao = { email: string; demo: boolean };

/**
 * Porteiro do /admin. O middleware já barra quem não entrou; aqui
 * confirmamos que a conta está em public.admins. Sem Supabase, o painel
 * abre em modo demonstração (só para olhar).
 */
export async function exigirAdmin(): Promise<Sessao> {
  if (!supabaseConfigurado) return { email: "demonstração", demo: true };

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
  if (!supabaseConfigurado) return [];
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("gift_messages")
    .select("id, name, message, created_at, gifts(title)")
    .order("created_at", { ascending: false })
    .limit(limite);
  return (data ?? []) as unknown as RecadoComPresente[];
}
