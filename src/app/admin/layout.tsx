import type { Metadata } from "next";
import { exigirAdmin } from "@/lib/admin";
import { LINK_PLANILHA, planilhaConfigurada } from "@/lib/planilha";
import { BarraAdmin } from "./BarraAdmin";

export const metadata: Metadata = { title: "Painel dos noivos", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sessao = await exigirAdmin();
  return (
    <div className="min-h-svh bg-papel">
      <BarraAdmin email={sessao.email} demo={sessao.demo} />
      {sessao.demo && planilhaConfigurada && (
        <div className="border-b border-ouro/40 bg-[#f3ead9] px-4 py-2.5 text-center text-sm text-marinho">
          Presentes, confirmações e recados ficam na <strong className="font-medium">planilha do Google</strong>
          {LINK_PLANILHA && (
            <>
              {" — "}
              <a href={LINK_PLANILHA} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                abrir a planilha
              </a>
            </>
          )}
          . Textos, história, padrinhos e música são só de consulta aqui.
        </div>
      )}
      {sessao.demo && !planilhaConfigurada && (
        <div className="border-b border-ouro/40 bg-[#f3ead9] px-4 py-2.5 text-center text-sm text-marinho">
          <strong className="font-medium">Modo demonstração</strong> — o painel está aberto só para olhar. Ligue a
          planilha do Google (veja o README) para receber confirmações.
        </div>
      )}
      <main className="mx-auto max-w-5xl px-4 pt-8 pb-24 sm:px-6 sm:pt-12">{children}</main>
    </div>
  );
}
