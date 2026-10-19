"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/#convite", rotulo: "Convite" },
  { href: "/nossa-historia", rotulo: "Nossa história" },
  { href: "/padrinhos", rotulo: "Padrinhos" },
  { href: "/#dress-code", rotulo: "Dress code" },
  { href: "/presentes", rotulo: "Presentes" },
  { href: "/confirmar", rotulo: "Confirmar presença", destaque: true },
];

export function Cabecalho({ iniciais }: { iniciais: [string, string] }) {
  const caminho = usePathname();
  const [aberto, setAberto] = useState(false);
  const [rolou, setRolou] = useState(false);

  useEffect(() => setAberto(false), [caminho]);
  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 24);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        rolou || aberto ? "border-b border-ouro/25 bg-papel/95 backdrop-blur" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="titulo-serif flex items-center gap-2 text-xl text-marinho" aria-label="Início">
          <span>{iniciais[0]}</span>
          <span className="h-5 w-px bg-ouro" aria-hidden="true" />
          <span>{iniciais[1]}</span>
        </Link>

        <ul className="hidden items-center gap-6 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`versalete titulo-serif text-xs font-semibold transition-colors ${
                  "destaque" in l
                    ? "rounded-sm border border-marinho/50 px-3.5 py-2 text-marinho hover:bg-marinho hover:text-papel-claro"
                    : caminho === l.href
                      ? "text-marinho"
                      : "text-azul hover:text-marinho"
                }`}
              >
                {l.rotulo}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setAberto((a) => !a)}
          aria-expanded={aberto}
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          className="flex h-11 w-11 items-center justify-center text-marinho lg:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.4">
            {aberto ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
          </svg>
        </button>
      </nav>

      {aberto && (
        <ul className="border-t border-ouro/20 px-5 pb-5 lg:hidden">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setAberto(false)}
                className="versalete titulo-serif flex min-h-12 items-center border-b border-ouro/15 text-sm font-semibold text-marinho"
              >
                {l.rotulo}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
