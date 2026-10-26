import { carregarPresentes } from "@/lib/conteudo";
import { carregarRecados, exigirAdmin } from "@/lib/admin";
import { TituloPagina } from "@/components/Formulario";
import { LINK_PLANILHA, planilhaConfigurada } from "@/lib/planilha";
import { PainelPresentes } from "./PainelPresentes";

export default async function PresentesAdmin() {
  const [sessao, presentes, recados] = await Promise.all([exigirAdmin(), carregarPresentes({ todos: true }), carregarRecados()]);
  return (
    <>
      <TituloPagina sobretitulo="Painel" titulo="Lista de presentes">
        Se vocês colarem um link no presente, o botão Presentear leva para o pagamento ou para a página da loja.
      </TituloPagina>
      <PainelPresentes presentes={presentes} recados={recados} demo={sessao.demo} planilha={planilhaConfigurada ? { link: LINK_PLANILHA } : null} />
    </>
  );
}
