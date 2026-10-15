import Image from "next/image";
import { carregarCasamento, carregarPadrinhos } from "@/lib/conteudo";
import { DressCode } from "@/components/DressCode";
import { CartaoPadrinho } from "@/components/CartaoPadrinho";
import { Revelar } from "@/components/Revelar";
import { Secao } from "@/components/Secao";
import { BotaoExterno, BotaoLink } from "@/components/Botao";
import { Contagem } from "@/components/Contagem";
import { Icone, type NomeIcone } from "@/components/Icones";
import { Aquarela, Coracao, Divisor, Faixa, Moldura, Ramo, Selo } from "@/components/Ornamentos";
import { linkSeguro } from "@/lib/formato";

/** "Fulano (em memória)" → nome normal + observação em itálico. */
function Nome({ linha }: { linha: string }) {
  const m = linha.match(/^(.*?)\s*\((.+)\)\s*$/);
  if (!m) return <span className="block">{linha}</span>;
  return (
    <span className="block">
      {m[1]}
      <em className="block text-base text-azul">({m[2]})</em>
    </span>
  );
}

function linhas(texto: string) {
  return texto.split("\n").map((l) => l.trim()).filter(Boolean);
}

export default async function Inicio() {
  const [c, padrinhos] = await Promise.all([carregarCasamento(), carregarPadrinhos()]);
  const iniciais: [string, string] = [c.noiva[0] ?? "V", c.noivo[0] ?? "D"];
  const [primeiraPalavra, ...resto] = c.capa_sobretitulo.trim().split(/\s+/);
  // "Save the date" vira SAVE / the / DATE, como no save the date impresso.
  const capaEmTres = resto.length === 2;

  return (
    <>
      {/* ---------- Capa: o save the date ---------- */}
      <section className="papel relative flex min-h-svh items-center justify-center overflow-hidden px-6 pt-24 pb-20">
        <Aquarela id="aq-capa-1" className="tingir pointer-events-none absolute -top-4 -right-4 w-[62vw] max-w-[540px]" />
        <Aquarela id="aq-capa-2" canto="base-esquerda" className="tingir pointer-events-none absolute -bottom-4 -left-4 w-[58vw] max-w-[500px]" />
        <div className="balancar pointer-events-none absolute top-16 left-0 w-28 sm:top-20 sm:w-48">
          <Ramo />
        </div>
        <Ramo espelhado className="pointer-events-none absolute right-2 bottom-24 hidden w-40 rotate-180 sm:block" />
        <Moldura className="sm:inset-8" />

        <div className="entrada relative mx-auto max-w-2xl text-center">
          {capaEmTres ? (
            <h1 className="titulo-serif text-marinho">
              <span className="block text-5xl tracking-[0.32em] sm:text-7xl">{primeiraPalavra.toUpperCase()}</span>
              <span className="script -my-3 block text-6xl text-ouro sm:-my-5 sm:text-8xl">{resto[0]}</span>
              <span className="block text-5xl tracking-[0.32em] sm:text-7xl">{resto[1].toUpperCase()}</span>
            </h1>
          ) : (
            <h1 className="titulo-serif versalete text-4xl text-marinho sm:text-6xl">{c.capa_sobretitulo}</h1>
          )}
          <Divisor className="mt-6" />

          <Image
            src={c.imagemCasal}
            alt={`Ilustração de ${c.noiva} e ${c.noivo}`}
            width={730}
            height={470}
            priority
            className="mx-auto mt-6 w-full max-w-[26rem] sm:max-w-[30rem]"
          />

          <p className="script -mt-6 text-7xl leading-none text-marinho sm:-mt-10 sm:text-8xl">{c.noiva}</p>
          <Coracao cheio className="bater mx-auto my-1 w-4 text-ouro" />
          <p className="script text-7xl leading-none text-marinho sm:text-8xl">{c.noivo}</p>

          <p className="titulo-serif mt-6 text-3xl tracking-[0.2em] text-ouro-escuro tabular-nums lining-nums sm:text-4xl">
            {c.dataCurta}
          </p>
          <Divisor className="mt-5" />

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <BotaoLink href="#convite">Ver o convite</BotaoLink>
            <BotaoLink href="/presentes" variante="contorno">
              Lista de presentes
            </BotaoLink>
          </div>
        </div>

        <Selo className="absolute right-6 bottom-6 w-20 drop-shadow-md sm:right-14 sm:bottom-14 sm:w-28" iniciais={iniciais} />
      </section>

      {/* ---------- Contagem ---------- */}
      <Secao fundo="claro" sobretitulo="Falta pouco" titulo="Contagem regressiva">
        <Contagem dataISO={c.dataISO} />
      </Secao>

      {/* ---------- O convite ---------- */}
      <section id="convite" className="papel relative scroll-mt-16 px-4 py-16 sm:py-24">
        <div className="relative mx-auto max-w-3xl overflow-hidden border border-ouro/40 bg-papel-claro px-6 py-14 text-center shadow-[0_20px_60px_-30px_rgba(27,43,63,0.35)] sm:px-14 sm:py-20">
          <Aquarela id="aq-convite-1" className="pointer-events-none absolute -top-2 -right-2 w-48 sm:w-72" />
          <Aquarela id="aq-convite-2" canto="base-esquerda" className="pointer-events-none absolute -bottom-2 -left-2 w-44 sm:w-64" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-3 border border-ouro/40" />

          {/* O lema corre na lateral, como na margem do convite impresso. */}
          <p className="versalete titulo-serif pointer-events-none absolute top-1/2 right-6 hidden -translate-y-1/2 text-[0.7rem] font-semibold whitespace-nowrap text-ouro-escuro [writing-mode:vertical-rl] md:block">
            {c.lema}
          </p>

          <div className="relative">
            <p className="versalete titulo-serif mx-auto max-w-xs text-sm font-semibold leading-relaxed text-marinho">
              {c.convite_abertura}
            </p>
            <Faixa className="mt-4 text-2xl sm:text-3xl">Casamento</Faixa>

            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
              {[
                { rotulo: "Pais da noiva", texto: c.pais_noiva },
                { rotulo: "Pais do noivo", texto: c.pais_noivo },
              ].map((p) => (
                <div key={p.rotulo}>
                  <p className="versalete titulo-serif text-xs font-semibold text-ouro-escuro">{p.rotulo}</p>
                  <p className="mt-3 space-y-0.5 text-lg text-marinho">
                    {linhas(p.texto).map((l) => (
                      <Nome key={l} linha={l} />
                    ))}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-10 text-lg text-marinho">Convidam para a celebração do casamento de</p>

            <p className="script mt-4 text-7xl leading-none text-marinho sm:text-8xl">{c.noiva}</p>
            <p className="versalete titulo-serif mt-1 text-sm font-semibold text-marinho">{c.noiva_sobrenome}</p>
            <Faixa className="my-5 text-lg">E</Faixa>
            <p className="script text-7xl leading-none text-marinho sm:text-8xl">{c.noivo}</p>
            <p className="versalete titulo-serif mt-1 text-sm font-semibold text-marinho">{c.noivo_sobrenome}</p>

            <blockquote className="mt-10">
              <p className="titulo-serif text-2xl text-marinho italic">“{c.citacao}”</p>
              <footer className="versalete mt-2 text-[0.7rem] text-ouro-escuro">{c.citacao_autor}</footer>
            </blockquote>

            <p className="versalete titulo-serif mx-auto mt-10 max-w-lg text-sm leading-loose font-semibold text-marinho">
              {c.convite_texto}
            </p>

            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-ouro/45">
              {(
                [
                  { icone: "calendario", rotulo: "Data", valor: c.dataCurta.replace(/ \. /g, " / "), extra: null },
                  { icone: "relogio", rotulo: "Horário", valor: c.hora.replace(/h$/, " hrs"), extra: null },
                  { icone: "local", rotulo: "Cerimônia", valor: c.cerimonia_nome, extra: c.cerimonia_endereco },
                ] as { icone: NomeIcone; rotulo: string; valor: string; extra: string | null }[]
              ).map((item) => (
                <div key={item.rotulo} className="px-3">
                  <Icone nome={item.icone} className="mx-auto h-7 w-7 text-ouro-escuro" />
                  <p className="versalete titulo-serif mt-2 text-xs font-semibold text-ouro-escuro">{item.rotulo}</p>
                  <p className={`titulo-serif mt-2 text-marinho ${item.extra ? "text-xl leading-snug" : "text-3xl tabular-nums lining-nums"}`}>
                    {item.valor}
                  </p>
                  {item.extra && <p className="mt-1 text-sm text-azul">{item.extra}</p>}
                </div>
              ))}
            </div>

            <Divisor className="mt-12" />
            <p className="versalete titulo-serif mt-6 text-xs font-semibold text-ouro-escuro">Recepção após a cerimônia</p>
            <p className="titulo-serif mt-2 text-2xl text-marinho">{c.recepcao_nome}</p>
            <p className="text-base text-azul">{c.recepcao_endereco}</p>
            <Divisor className="mt-8" />
            <p className="versalete titulo-serif mt-6 text-sm font-semibold text-marinho">{c.rodape_frase}</p>
          </div>

          <Selo className="absolute right-5 bottom-5 w-16 drop-shadow sm:right-8 sm:bottom-8 sm:w-20" iniciais={iniciais} />
        </div>
      </section>

      {/* ---------- Como chegar ---------- */}
      <Secao id="locais" fundo="claro" sobretitulo="Como chegar" titulo="Onde vamos celebrar">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[
            { icone: "local" as const, rotulo: "Cerimônia", hora: c.hora, nome: c.cerimonia_nome, endereco: c.cerimonia_endereco, mapa: c.cerimonia_mapa },
            { icone: "taca" as const, rotulo: "Recepção", hora: "Logo após a cerimônia", nome: c.recepcao_nome, endereco: c.recepcao_endereco, mapa: c.recepcao_mapa },
          ].map((l) => {
            const mapa = linkSeguro(l.mapa);
            return (
              <article key={l.rotulo} className="flex flex-col items-center border border-ouro/35 bg-papel px-6 py-10 text-center">
                <Icone nome={l.icone} className="h-8 w-8 text-ouro-escuro" />
                <p className="versalete titulo-serif mt-3 text-xs font-semibold text-ouro-escuro">{l.rotulo}</p>
                <h3 className="titulo-serif mt-3 text-2xl text-marinho">{l.nome}</h3>
                <p className="mt-1 text-base text-azul">{l.endereco}</p>
                <p className="mt-1 text-base text-marinho italic">{l.hora}</p>
                {mapa && (
                  <BotaoExterno href={mapa} variante="contorno" className="mt-7">
                    <Icone nome="local" className="h-4 w-4" />
                    Ver no mapa
                  </BotaoExterno>
                )}
              </article>
            );
          })}
        </div>
      </Secao>

      {/* ---------- Nossa história ---------- */}
      <Secao id="historia" sobretitulo={`${c.noiva} & ${c.noivo}`} titulo={c.historia_titulo}>
        <div className="mx-auto max-w-2xl space-y-6 text-center text-lg leading-relaxed text-marinho sm:text-xl">
          {c.historia_texto
            .split(/\n\s*\n/)
            .filter((p) => p.trim())
            .map((p, i) => (
              <p key={i} className="whitespace-pre-line">
                {p.trim()}
              </p>
            ))}
        </div>
        <div className="mt-10 text-center">
          <BotaoLink href="/nossa-historia" variante="contorno">
            Ver nossa linha do tempo
          </BotaoLink>
        </div>
      </Secao>

      {/* ---------- Dress code ---------- */}
      <Secao id="dress-code" fundo="claro" sobretitulo="O que vestir" titulo="Dress code">
        <DressCode c={c} />
      </Secao>

      {/* ---------- Padrinhos ---------- */}
      {padrinhos.length > 0 && (
        <Secao id="padrinhos" sobretitulo="Ao nosso lado no altar" titulo={c.padrinhos_titulo}>
          <p className="mx-auto -mt-4 mb-12 max-w-xl text-center text-lg text-marinho">{c.padrinhos_intro}</p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3">
            {padrinhos.slice(0, 6).map((p, i) => (
              <li key={p.id}>
                <Revelar atraso={(i % 3) * 120}>
                  <CartaoPadrinho p={p} />
                </Revelar>
              </li>
            ))}
          </ul>
          <div className="mt-12 text-center">
            <BotaoLink href="/padrinhos" variante="contorno">
              {padrinhos.length > 6 ? `Ver todos os ${padrinhos.length}` : "Conhecer os padrinhos"}
            </BotaoLink>
          </div>
        </Secao>
      )}

      {/* ---------- A bênção (o verso e o forro do envelope) ---------- */}
      <Secao fundo="azul">
        <div className="text-center">
          <Selo cor="ouro" className="mx-auto w-20 drop-shadow-md" iniciais={iniciais} />
          <p className="titulo-serif mx-auto mt-8 max-w-xl text-3xl leading-snug text-papel-claro italic sm:text-4xl">
            “{c.fe_frase}”
          </p>
          <span className="mx-auto mt-8 block h-px w-12 bg-papel/50" aria-hidden="true" />
          <p className="versalete titulo-serif mt-8 text-sm font-semibold text-papel-claro">“{c.fe_versiculo}”</p>
          <p className="versalete mt-2 text-xs text-papel/75">{c.fe_referencia}</p>
        </div>
      </Secao>

      {/* ---------- Presentes ---------- */}
      <Secao fundo="claro" sobretitulo="Com carinho" titulo={c.presentes_titulo}>
        <div className="mx-auto max-w-xl text-center">
          <Icone nome="presente" className="mx-auto h-10 w-10 text-ouro-escuro" />
          <p className="mt-6 text-lg leading-relaxed text-marinho">{c.presentes_intro}</p>
          <BotaoLink href="/presentes" className="mt-10">
            Ver lista de presentes
          </BotaoLink>
        </div>
      </Secao>
    </>
  );
}
