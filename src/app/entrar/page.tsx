import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { supabaseConfigurado } from "@/lib/supabase/ativo";
import { senhaPainelDefinida } from "@/lib/senhaPainel";
import { planilhaConfigurada } from "@/lib/planilha";
import { FormEntrar } from "./FormEntrar";
import { FormSenha } from "./FormSenha";

export const metadata: Metadata = { title: "Entrar no painel", robots: { index: false } };
export const dynamic = "force-dynamic";

export default function Entrar() {
  if (!supabaseConfigurado) {
    // Sem Supabase o painel entra com a senha de ADMIN_SENHA. Sem senha e
    // sem planilha, não há dado nenhum a proteger: abre a demonstração.
    if (!senhaPainelDefinida() && !planilhaConfigurada) redirect("/admin");
    return (
      <Suspense fallback={<div className="min-h-svh" />}>
        <FormSenha semSenha={!senhaPainelDefinida()} />
      </Suspense>
    );
  }
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <FormEntrar />
    </Suspense>
  );
}
