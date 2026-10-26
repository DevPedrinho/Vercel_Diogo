import type { Metadata } from "next";
import { carregarCasamento, carregarPresentes } from "@/lib/conteudo";
import { supabaseConfigurado } from "@/lib/supabase/ativo";
import { planilhaConfigurada } from "@/lib/planilha";
import { Secao } from "@/components/Secao";
import { BotaoLink } from "@/components/Botao";
import { Aquarela, Divisor, Ramo } from "@/components/Ornamentos";
import { ListaPresentes } from "./ListaPresentes";

export const metadata: Metadata = {
  title: "Lista de presentes",
  description: "Escolha um presente e abençoe o começo da nossa vida juntos.",
};

export default async function Presentes() {
  const [c, presentes] = await Promise.all([carregarCasamento(), carregarPresentes()]);

  return (
    <>
      <section className="papel relative overflow-hidden px-5 pt-32 pb-16 text-center sm:pt-40 sm:pb-20">
        <Aquarela id="aq-presentes" className="pointer-events-none absolute -top-4 -right-4 w-[55vw] max-w-[420px]" />
        <Ramo className="pointer-events-none absolute top-14 left-0 w-28 sm:w-44" />
        <div className="relative mx-auto max-w-2xl">
          <p className="script text-5xl text-ouro sm:text-6xl">
            {c.noiva} &amp; {c.noivo}
          </p>
          <h1 className="titulo-serif versalete mt-4 text-3xl text-marinho sm:text-5xl">{c.presentes_titulo}</h1>
          <Divisor className="mt-8" />
          <p className="mt-8 text-lg leading-relaxed text-marinho">{c.presentes_intro}</p>
        </div>
      </section>

      <Secao fundo="claro">
        <ListaPresentes
          presentes={presentes}
          obrigado={c.presentes_obrigado}
          fonteRecados={planilhaConfigurada ? "planilha" : supabaseConfigurado ? "supabase" : null}
        />
      </Secao>

      <Secao fundo="azul">
        <div className="text-center">
          <p className="titulo-serif mx-auto max-w-xl text-2xl text-papel-claro italic sm:text-3xl">
            De verdade: o que a gente mais quer é você lá, em {c.dataExtenso}.
          </p>
          <BotaoLink href="/#convite" variante="claro" className="mt-10">
            Ver o convite
          </BotaoLink>
        </div>
      </Secao>
    </>
  );
}
