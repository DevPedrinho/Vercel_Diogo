import { carregarTextosSalvos } from "@/lib/conteudo";
import { exigirAdmin } from "@/lib/admin";
import { TituloPagina } from "@/components/Formulario";
import { EditorTextos } from "./EditorTextos";

export default async function TextosAdmin() {
  const [sessao, salvos] = await Promise.all([exigirAdmin(), carregarTextosSalvos()]);
  return (
    <>
      <TituloPagina sobretitulo="Painel" titulo="Textos do site">
        Tudo o que está escrito no site sai daqui. Os textos já vêm do convite — mudem só o que quiserem.
      </TituloPagina>
      <EditorTextos salvos={salvos} demo={sessao.demo} />
    </>
  );
}
