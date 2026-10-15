import { carregarCasamento, carregarMusica, faixaDoSite } from "@/lib/conteudo";
import { Cabecalho } from "@/components/Cabecalho";
import { Rodape } from "@/components/Rodape";
import { PlayerMusica } from "@/components/PlayerMusica";

// Textos e música mudam pelo painel: nada de página estática.
export const dynamic = "force-dynamic";

export default async function LayoutDoSite({ children }: { children: React.ReactNode }) {
  const [c, musica] = await Promise.all([carregarCasamento(), carregarMusica()]);
  const faixa = faixaDoSite(musica);

  return (
    <>
      <Cabecalho iniciais={[c.noiva[0] ?? "V", c.noivo[0] ?? "D"]} />
      <main className="-mt-16">{children}</main>
      <Rodape c={c} />
      {faixa && <PlayerMusica arquivo={faixa.arquivo} titulo={faixa.titulo} artista={faixa.artista} volume={faixa.volume} />}
    </>
  );
}
