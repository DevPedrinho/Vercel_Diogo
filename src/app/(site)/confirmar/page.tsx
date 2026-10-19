import type { Metadata } from "next";
import { carregarCasamento, prazoDaConfirmacao } from "@/lib/conteudo";
import { supabaseConfigurado } from "@/lib/supabase/ativo";
import { CabecalhoPagina } from "@/components/CabecalhoPagina";
import { FormConfirmacao } from "./FormConfirmacao";

export const metadata: Metadata = {
  title: "Confirmar presença",
  description: "Confirme sua presença no nosso casamento.",
};

export default async function Confirmar() {
  const c = await carregarCasamento();
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
          ativo={supabaseConfigurado}
        />
      </section>
    </>
  );
}
