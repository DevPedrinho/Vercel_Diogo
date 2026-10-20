import { carregarCasamento, carregarConfirmacoes, prazoDaConfirmacao } from "@/lib/conteudo";
import { exigirAdmin } from "@/lib/admin";
import { LINK_PLANILHA, planilhaConfigurada } from "@/lib/planilha";
import { TituloPagina } from "@/components/Formulario";
import { PainelConfirmacoes } from "./PainelConfirmacoes";

export default async function ConfirmacoesAdmin() {
  const sessao = await exigirAdmin();
  const c = await carregarCasamento();
  let respostas: Awaited<ReturnType<typeof carregarConfirmacoes>> = [];
  let erro: string | null = null;
  try {
    respostas = await carregarConfirmacoes();
  } catch {
    erro = "Não deu para ler a planilha agora. Atualize a página em instantes.";
  }
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
      <PainelConfirmacoes
        respostas={respostas}
        fonte={planilhaConfigurada ? "planilha" : sessao.demo ? null : "supabase"}
        linkPlanilha={LINK_PLANILHA}
        erroLeitura={erro}
      />
    </>
  );
}
