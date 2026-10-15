import type { Metadata } from "next";
import Image from "next/image";
import { carregarCasamento, carregarHistoria } from "@/lib/conteudo";
import { urlDoSite } from "@/lib/storage";
import { CabecalhoPagina } from "@/components/CabecalhoPagina";
import { Revelar } from "@/components/Revelar";
import { BotaoLink } from "@/components/Botao";
import { Coracao, Ramo, Selo } from "@/components/Ornamentos";
import type { EventoHistoria } from "@/lib/tipos";

export const metadata: Metadata = { title: "Nossa história" };

function Foto({ e, i }: { e: EventoHistoria; i: number }) {
  const foto = urlDoSite(e.image_path);
  // Moldura em arco, como uma janela de capela.
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-[17rem] overflow-hidden rounded-t-full border-4 border-papel-claro bg-nevoa shadow-[0_18px_40px_-20px_rgba(27,43,63,0.5)]">
      {foto ? (
        <Image src={foto} alt={e.title} fill sizes="17rem" className="object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center bg-linear-to-b from-nevoa to-papel-escuro">
          <Ramo espelhado={i % 2 === 1} className="w-2/3 opacity-90" />
        </div>
      )}
      <span aria-hidden="true" className="pointer-events-none absolute inset-2 rounded-t-full border border-ouro/50" />
    </div>
  );
}

export default async function NossaHistoria() {
  const [c, eventos] = await Promise.all([carregarCasamento(), carregarHistoria()]);

  return (
    <>
      <CabecalhoPagina id="historia" nomes={`${c.noiva} & ${c.noivo}`} titulo={c.historia_linha_titulo} texto={c.historia_linha_intro} />

      <section className="bg-papel-claro px-5 py-20 sm:py-28">
        {eventos.length === 0 ? (
          <p className="titulo-serif text-center text-2xl text-azul italic">Nossa história está sendo escrita com carinho.</p>
        ) : (
          <ol className="relative mx-auto max-w-5xl">
            {/* O fio dourado da linha do tempo: à esquerda no celular, no meio no computador. */}
            <span aria-hidden="true" className="absolute top-0 bottom-0 left-5 w-px bg-linear-to-b from-transparent via-ouro/70 to-transparent md:left-1/2" />

            {eventos.map((e, i) => {
              const esquerda = i % 2 === 0;
              return (
                <li key={e.id} className="relative pb-16 pl-14 last:pb-0 md:grid md:grid-cols-2 md:gap-16 md:pl-0">
                  {/* O coração no fio. */}
                  <Revelar className="absolute top-2 left-5 z-10 -translate-x-1/2 md:left-1/2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-ouro/60 bg-papel-claro shadow-sm">
                      <Coracao cheio className="bater w-4 text-ouro" />
                    </span>
                  </Revelar>

                  <Revelar de={esquerda ? "esquerda" : "direita"} className={esquerda ? "md:order-1 md:text-right" : "md:order-2"}>
                    <p className="versalete titulo-serif text-xs font-semibold text-ouro-escuro">{e.date_label}</p>
                    <h2 className="script mt-1 text-5xl leading-tight text-marinho sm:text-6xl">{e.title}</h2>
                    {e.description && (
                      <p className="mt-3 text-lg leading-relaxed whitespace-pre-line text-marinho">{e.description}</p>
                    )}
                  </Revelar>

                  <Revelar de={esquerda ? "direita" : "esquerda"} atraso={150} className={`mt-6 md:mt-0 ${esquerda ? "md:order-2" : "md:order-1"}`}>
                    <Foto e={e} i={i} />
                  </Revelar>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section className="papel px-5 py-20 text-center">
        <Selo className="mx-auto w-20" iniciais={[c.noiva[0] ?? "V", c.noivo[0] ?? "D"]} />
        <p className="script mt-6 text-5xl text-marinho sm:text-6xl">e o próximo capítulo é com você</p>
        <p className="titulo-serif versalete mt-4 text-sm font-semibold text-ouro-escuro">
          {c.dataExtenso} · {c.hora}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <BotaoLink href="/#convite">Ver o convite</BotaoLink>
          <BotaoLink href="/presentes" variante="contorno">
            Lista de presentes
          </BotaoLink>
        </div>
      </section>
    </>
  );
}
