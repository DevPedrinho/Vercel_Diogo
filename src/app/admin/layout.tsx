import type { Metadata } from "next";
import { exigirAdmin } from "@/lib/admin";
import { BarraAdmin } from "./BarraAdmin";

export const metadata: Metadata = { title: "Painel dos noivos", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sessao = await exigirAdmin();
  return (
    <div className="min-h-svh bg-papel">
      <BarraAdmin email={sessao.email} demo={sessao.demo} />
      {sessao.demo && (
        <div className="border-b border-ouro/40 bg-[#f3ead9] px-4 py-2.5 text-center text-sm text-marinho">
          <strong className="font-medium">Modo demonstração</strong> — o painel está aberto só para olhar. Conecte o
          Supabase (veja o README) para salvar de verdade.
        </div>
      )}
      <main className="mx-auto max-w-5xl px-4 pt-8 pb-24 sm:px-6 sm:pt-12">{children}</main>
    </div>
  );
}
