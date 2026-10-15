import type { Casamento } from "@/lib/conteudo";
import { Revelar } from "./Revelar";

/** "Azul sereno | #a9b9ca" por linha → [{nome, cor}]. Cor inválida é pulada. */
function paleta(texto: string) {
  return texto
    .split("\n")
    .map((l) => l.split("|").map((p) => p.trim()))
    .filter(([nome, cor]) => nome && /^#[0-9a-f]{3,8}$/i.test(cor ?? ""))
    .map(([nome, cor]) => ({ nome, cor }));
}

function Silhueta({ tipo }: { tipo: "elas" | "eles" }) {
  // Traço fino dourado, no mesmo espírito da Nossa Senhora do envelope.
  return (
    <svg viewBox="0 0 60 110" className="h-28 w-16 shrink-0 text-ouro-escuro" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="30" cy="12" r="7" />
      {tipo === "elas" ? (
        <>
          <path d="M22 26c2-4 14-4 16 0l-2 18H24l-2-18Z" />
          <path d="M24 44 10 104h40L36 44" />
          <path d="M22 28 14 48M38 28l8 20" />
          <path d="M18 80c8 3 16 3 24 0" opacity="0.5" />
        </>
      ) : (
        <>
          <path d="M20 24h20l4 34H16l4-34Z" />
          <path d="m26 24 4 10 4-10M30 34v22" />
          <path d="M20 58v46h9V66M40 58v46h-9" />
          <path d="M20 26 13 54M40 26l7 28" />
        </>
      )}
    </svg>
  );
}

export function DressCode({ c }: { c: Casamento }) {
  const cores = paleta(c.dress_cores);
  return (
    <div className="mx-auto max-w-4xl text-center">
      <p className="titulo-serif versalete text-3xl text-marinho sm:text-4xl">{c.traje}</p>
      <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-marinho">{c.dress_texto}</p>

      {cores.length > 0 && (
        <div className="mt-12">
          <p className="versalete titulo-serif text-xs font-semibold text-ouro-escuro">Paleta sugerida</p>
          <ul className="mt-6 flex flex-wrap items-start justify-center gap-5 sm:gap-8">
            {cores.map((cor, i) => (
              <li key={cor.nome}>
                <Revelar atraso={i * 110} className="flex w-20 flex-col items-center">
                  <span
                    className="block h-16 w-16 rounded-full border-4 border-papel-claro shadow-[0_0_0_1px_rgba(168,138,94,0.5),0_8px_20px_-8px_rgba(27,43,63,0.35)] transition-transform duration-300 hover:-translate-y-1 hover:scale-105"
                    style={{ backgroundColor: cor.cor }}
                  />
                  <span className="mt-3 text-sm leading-tight text-marinho">{cor.nome}</span>
                </Revelar>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-14 grid grid-cols-1 gap-6 text-left sm:grid-cols-2">
        {(
          [
            { tipo: "elas", titulo: "Para elas", texto: c.dress_elas },
            { tipo: "eles", titulo: "Para eles", texto: c.dress_eles },
          ] as const
        ).map((b, i) => (
          <Revelar key={b.tipo} de={i === 0 ? "esquerda" : "direita"}>
            <article className="flex h-full items-center gap-5 border border-ouro/35 bg-papel px-6 py-7">
              <Silhueta tipo={b.tipo} />
              <div>
                <h3 className="script text-4xl text-marinho">{b.titulo}</h3>
                <p className="mt-1 text-base leading-relaxed text-marinho">{b.texto}</p>
              </div>
            </article>
          </Revelar>
        ))}
      </div>

      {c.dress_evitar && (
        <p className="mx-auto mt-8 inline-flex max-w-xl items-center gap-3 border-y border-ouro/40 px-2 py-3 text-base text-marinho italic">
          <span className="h-5 w-5 shrink-0 rounded-full border border-ouro/60 bg-white" aria-hidden="true" />
          {c.dress_evitar}
        </p>
      )}
    </div>
  );
}
