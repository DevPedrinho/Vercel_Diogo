import { carregarCasamento, carregarConfirmacoes, prazoDaConfirmacao } from "@/lib/conteudo";
import { exigirAdmin } from "@/lib/admin";
import { TituloPagina } from "@/components/Formulario";
import { PainelConfirmacoes } from "./PainelConfirmacoes";

export default async function ConfirmacoesAdmin() {
  const [sessao, c, respostas] = await Promise.all([exigirAdmin(), carregarCasamento(), carregarConfirmacoes()]);
  const prazo = prazoDaConfirmacao(c.rsvp_prazo);
  return (
    <>
      <TituloPagina sobretitulo="Painel" titulo="Confirmações de presença">
        {prazo.extenso
          ? prazo.aberto
            ? `O formulário fica aberto até ${prazo.extenso}. O prazo se muda em Textos → Confirmação de presença.`
            : `O prazo terminou em ${prazo.extenso} e o formulário está fechado.`
          : "O formulário está aberto, sem prazo definido."}
      </TituloPagina>
      <PainelConfirmacoes respostas={respostas} demo={sessao.demo} />
    </>
  );
}
