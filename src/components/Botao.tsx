import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variante = "solido" | "contorno" | "ouro" | "claro";

const BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-5 py-2.5 text-xs sm:px-8 sm:py-3 versalete titulo-serif font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marinho";

const VARIANTES: Record<Variante, string> = {
  solido: "bg-marinho text-papel-claro hover:bg-marinho-escuro shadow-sm",
  contorno: "border border-marinho/45 text-marinho hover:bg-marinho hover:text-papel-claro",
  ouro: "bg-ouro-escuro text-papel-claro hover:bg-[#6a5236] shadow-sm",
  claro: "border border-papel/60 text-papel-claro hover:bg-papel-claro hover:text-marinho",
};

export function Botao({
  variante = "solido",
  className = "",
  children,
  ...props
}: ComponentProps<"button"> & { variante?: Variante; children: ReactNode }) {
  return (
    <button className={`${BASE} ${VARIANTES[variante]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function BotaoLink({
  variante = "solido",
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & { variante?: Variante; children: ReactNode }) {
  return (
    <Link className={`${BASE} ${VARIANTES[variante]} ${className}`} {...props}>
      {children}
    </Link>
  );
}

/** Link que sai do site (o botão Presentear, o mapa). */
export function BotaoExterno({
  variante = "solido",
  className = "",
  children,
  ...props
}: ComponentProps<"a"> & { variante?: Variante; children: ReactNode }) {
  return (
    <a target="_blank" rel="noopener noreferrer" className={`${BASE} ${VARIANTES[variante]} ${className}`} {...props}>
      {children}
    </a>
  );
}
