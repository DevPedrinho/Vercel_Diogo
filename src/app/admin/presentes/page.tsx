import { carregarPresentes } from "@/lib/conteudo";
import { carregarRecados, exigirAdmin } from "@/lib/admin";
import { TituloPagina } from "@/components/Formulario";
import { PainelPresentes } from "./PainelPresentes";

export default async function PresentesAdmin() {
  const [sessao, presentes, recados] = await Promise.all([exigirAdmin(), carregarPresentes({ todos: true }), carregarRecados()]);
  return (
    <>
      <TituloPagina sobretitulo="Painel" titulo="Lista de presentes">
        Cada item leva o convidado para o link que vocês colarem — PIX, link de pagamento ou a página da loja.
      </TituloPagina>
      <PainelPresentes presentes={presentes} recados={recados} demo={sessao.demo} />
    </>
  );
}
