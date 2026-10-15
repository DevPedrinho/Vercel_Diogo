import { carregarHistoria } from "@/lib/conteudo";
import { exigirAdmin } from "@/lib/admin";
import { TituloPagina } from "@/components/Formulario";
import { EditorHistoria } from "./EditorHistoria";

export default async function HistoriaAdmin() {
  const [sessao, eventos] = await Promise.all([exigirAdmin(), carregarHistoria()]);
  return (
    <>
      <TituloPagina sobretitulo="Painel" titulo="Nossa história">
        Os capítulos da linha do tempo, do primeiro olhar até o grande dia. Cada um pode ter uma foto.
      </TituloPagina>
      <EditorHistoria eventos={eventos} demo={sessao.demo} />
    </>
  );
}
