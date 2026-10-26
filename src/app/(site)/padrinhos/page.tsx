import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MOSTRAR_PADRINHOS } from "@/lib/visibilidade";
import { carregarCasamento, carregarPadrinhos } from "@/lib/conteudo";
import { CabecalhoPagina } from "@/components/CabecalhoPagina";
import { CartaoPadrinho } from "@/components/CartaoPadrinho";
import { Revelar } from "@/components/Revelar";
import { Faixa } from "@/components/Ornamentos";

export const metadata: Metadata = { title: "Padrinhos e madrinhas" };

export default async function Padrinhos() {
  if (!MOSTRAR_PADRINHOS) notFound();
  const [c, padrinhos] = await Promise.all([carregarCasamento(), carregarPadrinhos()]);
  const lados = [
    { lado: "noiva" as const, titulo: `Do lado da noiva` },
    { lado: "noivo" as const, titulo: `Do lado do noivo` },
  ]
    .map((l) => ({ ...l, lista: padrinhos.filter((p) => p.side === l.lado) }))
    .filter((l) => l.lista.length > 0);

  return (
    <>
      <CabecalhoPagina id="padrinhos" nomes={`${c.noiva} & ${c.noivo}`} titulo={c.padrinhos_titulo} texto={c.padrinhos_intro} />

      <section className="bg-papel-claro px-5 py-20 sm:py-24">
        {lados.length === 0 ? (
          <p className="titulo-serif text-center text-2xl text-azul italic">Em breve, as pessoas que estarão no altar com a gente.</p>
        ) : (
          <div className="mx-auto max-w-5xl space-y-20">
            {lados.map((l) => (
              <div key={l.lado}>
                <Faixa className="text-sm">{l.titulo}</Faixa>
                <p className="script mt-2 text-center text-5xl text-marinho">{l.lado === "noiva" ? c.noiva : c.noivo}</p>
                <ul className="mt-12 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
                  {l.lista.map((p, i) => (
                    <li key={p.id}>
                      <Revelar atraso={(i % 3) * 120}>
                        <CartaoPadrinho p={p} />
                      </Revelar>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
