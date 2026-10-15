import { carregarPadrinhos } from "@/lib/conteudo";
import { exigirAdmin } from "@/lib/admin";
import { TituloPagina } from "@/components/Formulario";
import { EditorPadrinhos } from "./EditorPadrinhos";

export default async function PadrinhosAdmin() {
  const [sessao, padrinhos] = await Promise.all([exigirAdmin(), carregarPadrinhos()]);
  return (
    <>
      <TituloPagina sobretitulo="Painel" titulo="Padrinhos e madrinhas">
        Cadastrem cada casal de padrinhos (ou cada pessoa) com o lado do altar. Sem foto, aparece um selo com as iniciais.
      </TituloPagina>
      <EditorPadrinhos padrinhos={padrinhos} demo={sessao.demo} />
    </>
  );
}
