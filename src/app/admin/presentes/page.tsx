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
        Cada presente é pago pelo PIX do casal — ou, se vocês colarem um link, pelo link de pagamento ou pela página da loja.
      </TituloPagina>
      <PainelPresentes presentes={presentes} recados={recados} demo={sessao.demo} planilha={planilhaConfigurada ? { link: LINK_PLANILHA } : null} />
    </>
  );
}
