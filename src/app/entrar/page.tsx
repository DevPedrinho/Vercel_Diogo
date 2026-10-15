import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { supabaseConfigurado } from "@/lib/supabase/ativo";
import { FormEntrar } from "./FormEntrar";

export const metadata: Metadata = { title: "Entrar no painel", robots: { index: false } };

export default function Entrar() {
  // Sem banco não há login: o painel abre direto em modo demonstração.
  if (!supabaseConfigurado) redirect("/admin");
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <FormEntrar />
    </Suspense>
  );
}
