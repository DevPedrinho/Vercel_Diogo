import { carregarMusica, faixaDoSite } from "@/lib/conteudo";
import { exigirAdmin } from "@/lib/admin";
import { TituloPagina } from "@/components/Formulario";
import { EditorMusica } from "./EditorMusica";

export default async function MusicaAdmin() {
  const [sessao, musica] = await Promise.all([exigirAdmin(), carregarMusica()]);
  return (
    <>
      <TituloPagina sobretitulo="Painel" titulo="Música do site">
        Toca numa pílula discreta no canto da tela, em todas as páginas do site.
      </TituloPagina>
      <EditorMusica musica={musica} urlTocando={faixaDoSite({ ...musica, enabled: true })?.arquivo ?? null} demo={sessao.demo} />
    </>
  );
}
