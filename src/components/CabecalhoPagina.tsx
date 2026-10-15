import { Aquarela, Divisor, Ramo } from "./Ornamentos";

/** Abertura das páginas internas: nomes em caligrafia, título e texto. */
export function CabecalhoPagina({
  id,
  nomes,
  titulo,
  texto,
}: {
  id: string;
  nomes: string;
  titulo: string;
  texto?: string;
}) {
  return (
    <section className="papel relative overflow-hidden px-5 pt-32 pb-16 text-center sm:pt-40 sm:pb-20">
      <Aquarela id={`aq-${id}`} className="tingir pointer-events-none absolute -top-4 -right-4 w-[55vw] max-w-[420px]" />
      <div className="balancar pointer-events-none absolute top-14 left-0 w-28 sm:w-44">
        <Ramo />
      </div>
      <div className="entrada relative mx-auto max-w-2xl">
        <p className="script text-5xl text-ouro sm:text-6xl">{nomes}</p>
        <h1 className="titulo-serif versalete mt-4 text-3xl text-marinho sm:text-5xl">{titulo}</h1>
        <Divisor className="mt-8" />
        {texto && <p className="mt-8 text-lg leading-relaxed text-marinho">{texto}</p>}
      </div>
    </section>
  );
}
