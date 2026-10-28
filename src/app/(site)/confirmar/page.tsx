import type { Metadata } from "next";
import { carregarCasamento, prazoDaConfirmacao } from "@/lib/conteudo";
import { supabaseConfigurado } from "@/lib/supabase/ativo";
import { planilhaConfigurada } from "@/lib/planilha";
import { carregarConvidados, conviteDoCodigo } from "@/lib/convidados";
import { CabecalhoPagina } from "@/components/CabecalhoPagina";
import { FormConfirmacao } from "./FormConfirmacao";

export const metadata: Metadata = {
  title: "Confirmar presença",
  description: "Confirme sua presença no nosso casamento.",
};

export default async function Confirmar({ searchParams }: { searchParams: Promise<{ convite?: string }> }) {
  const { convite } = await searchParams;
  const [c, convidados, conviteInicial] = await Promise.all([
    carregarCasamento(),
    carregarConvidados(),
    convite ? conviteDoCodigo(convite) : Promise.resolve(null),
  ]);
  const prazo = prazoDaConfirmacao(c.rsvp_prazo);
  const whats = c.contato_whatsapp.replace(/\D/g, "");

  return (
    <>
      <CabecalhoPagina id="confirmar" nomes={`${c.noiva} & ${c.noivo}`} titulo={c.rsvp_titulo} texto={c.rsvp_intro} />
      <section className="bg-papel-claro px-5 py-16 sm:py-20">
        <FormConfirmacao
          aberto={prazo.aberto}
          prazo={prazo.extenso}
          encerrado={c.rsvp_encerrado}
          whatsapp={whats ? `https://wa.me/55${whats}` : null}
          dataExtenso={`${c.dataExtenso} · ${c.hora}`}
          fonte={planilhaConfigurada ? "planilha" : supabaseConfigurado ? "supabase" : null}
          temLista={convidados.length > 0}
          conviteInicial={conviteInicial}
        />
      </section>
    </>
  );
}
