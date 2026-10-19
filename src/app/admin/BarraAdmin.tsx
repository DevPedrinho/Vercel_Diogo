"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { criarClienteNavegador } from "@/lib/supabase/cliente";
import { Icone, type NomeIcone } from "@/components/Icones";

const ITENS: { href: string; rotulo: string; icone: NomeIcone }[] = [
  { href: "/admin", rotulo: "Início", icone: "casa" },
  { href: "/admin/confirmacoes", rotulo: "Confirmações", icone: "recado" },
  { href: "/admin/presentes", rotulo: "Presentes", icone: "presente" },
  { href: "/admin/historia", rotulo: "História", icone: "coracao" },
  { href: "/admin/padrinhos", rotulo: "Padrinhos", icone: "pessoas" },
  { href: "/admin/musica", rotulo: "Música", icone: "musica" },
  { href: "/admin/textos", rotulo: "Textos", icone: "texto" },
];

export function BarraAdmin({ email, demo }: { email: string; demo: boolean }) {
  const caminho = usePathname();
  const router = useRouter();

  async function sair() {
    if (!demo) await criarClienteNavegador().auth.signOut();
    router.push("/");
    router.refresh();
  }

  const ativo = (href: string) => (href === "/admin" ? caminho === "/admin" : caminho.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-ouro/30 bg-marinho text-papel-claro">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-4 sm:px-6">
        <Link href="/admin" className="titulo-serif flex items-center gap-2 text-xl" aria-label="Painel">
          <span>V</span>
          <span className="h-5 w-px bg-ouro" aria-hidden="true" />
          <span>D</span>
          <span className="versalete ml-2 hidden text-[0.7rem] text-papel/70 xl:inline">Painel</span>
        </Link>

        <nav className="ml-auto hidden items-center gap-0.5 xl:flex">
          {ITENS.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className={`flex min-h-11 items-center gap-2 rounded-sm px-3 text-base transition-colors ${
                ativo(i.href) ? "bg-papel-claro/15 text-papel-claro" : "text-papel/75 hover:text-papel-claro"
              }`}
            >
              <Icone nome={i.icone} className="h-4 w-4" />
              {i.rotulo}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 xl:ml-3">
          <Link
            href="/"
            target="_blank"
            className="flex min-h-11 items-center gap-2 rounded-sm px-3 text-sm text-papel/80 hover:text-papel-claro"
            title="Abrir o site em outra aba"
          >
            <Icone nome="olho" className="h-4 w-4" />
            <span className="hidden sm:inline">Ver site</span>
          </Link>
          <button
            type="button"
            onClick={sair}
            className="flex min-h-11 items-center gap-2 rounded-sm px-3 text-sm text-papel/80 hover:text-papel-claro"
            title={email}
          >
            <Icone nome="sair" className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>

      {/* No celular os módulos descem para uma faixa própria. */}
      <nav className="grid grid-cols-7 border-t border-papel/10 xl:hidden">
        {ITENS.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            className={`flex min-h-12 flex-col items-center justify-center gap-0.5 text-[0.65rem] ${
              ativo(i.href) ? "bg-papel-claro/12 text-papel-claro" : "text-papel/70"
            }`}
          >
            <Icone nome={i.icone} className="h-4 w-4" />
            {i.rotulo}
          </Link>
        ))}
      </nav>
    </header>
  );
}
