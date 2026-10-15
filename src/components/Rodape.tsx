import { Divisor, Selo } from "./Ornamentos";
import type { Casamento } from "@/lib/conteudo";

export function Rodape({ c }: { c: Casamento }) {
  const whats = c.contato_whatsapp.replace(/\D/g, "");
  return (
    <footer className="papel border-t border-ouro/25 px-5 pt-16 pb-28 text-center">
      <Selo className="mx-auto w-20" iniciais={[c.noiva[0] ?? "V", c.noivo[0] ?? "D"]} />
      <p className="script mt-6 text-5xl text-marinho">
        {c.noiva} <span className="text-ouro">&amp;</span> {c.noivo}
      </p>
      <p className="titulo-serif mt-3 text-lg tracking-[0.3em] text-ouro-escuro tabular-nums lining-nums">{c.dataCurta}</p>
      <Divisor className="mt-6" />
      <p className="versalete titulo-serif mt-6 text-xs font-semibold text-marinho">{c.rodape_frase}</p>
      {whats && (
        <a
          href={`https://wa.me/55${whats}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex min-h-11 items-center text-sm text-azul underline underline-offset-4 hover:text-marinho"
        >
          Dúvidas? Fale com os noivos
        </a>
      )}
    </footer>
  );
}
