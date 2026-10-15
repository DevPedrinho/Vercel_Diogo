import Image from "next/image";
import type { Padrinho } from "@/lib/tipos";
import { urlDoSite } from "@/lib/storage";
import { Selo } from "./Ornamentos";

/** Iniciais para o selo de quem ainda não tem foto: "Ana & João" → A, J. */
function iniciais(nome: string): [string, string] {
  const partes = nome.split(/\s*(?:&|\be\b)\s*/i).filter(Boolean);
  const a = partes[0]?.trim()[0] ?? "♥";
  const b = (partes[1] ?? partes[0]?.split(/\s+/)[1] ?? "")?.trim()[0] ?? "";
  return [a.toUpperCase(), (b || a).toUpperCase()];
}

export function CartaoPadrinho({ p }: { p: Padrinho }) {
  const foto = urlDoSite(p.image_path);
  return (
    <article className="group flex flex-col items-center text-center">
      <div className="relative">
        {/* Anel dourado que gira devagar quando o mouse passa. */}
        <span
          aria-hidden="true"
          className="absolute -inset-2 rounded-full border border-dashed border-ouro/60 transition-transform duration-[2000ms] ease-out group-hover:rotate-180"
        />
        <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-papel-claro bg-nevoa shadow-[0_10px_30px_-12px_rgba(27,43,63,0.45)] sm:h-36 sm:w-36">
          {foto ? (
            <Image src={foto} alt={p.name} fill sizes="9rem" className="object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center bg-linear-to-br from-nevoa to-papel-escuro">
              <Selo className="w-20" iniciais={iniciais(p.name)} />
            </div>
          )}
        </div>
      </div>
      <p className="versalete titulo-serif mt-5 text-[0.7rem] font-semibold text-ouro-escuro">{p.role}</p>
      <h3 className="titulo-serif mt-1 text-2xl leading-snug text-marinho">{p.name}</h3>
      {p.description && <p className="mt-2 max-w-xs text-base text-azul italic">{p.description}</p>}
    </article>
  );
}
