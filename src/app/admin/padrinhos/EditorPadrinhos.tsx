"use client";

import type { Padrinho } from "@/lib/tipos";
import { EditorLista } from "@/components/EditorLista";

export function EditorPadrinhos({ padrinhos, demo }: { padrinhos: Padrinho[]; demo: boolean }) {
  return (
    <EditorLista
      tabela="godparents"
      itens={padrinhos}
      pasta="padrinhos"
      nomeItem="padrinho"
      titulo="Cadastrados"
      demo={demo}
      novo={{ name: "", role: "Padrinhos", side: "noiva", description: "", image_path: "" }}
      campos={[
        { chave: "name", rotulo: "Nome", placeholder: "Ana & João", obrigatorio: true, max: 120, ajuda: "Um casal (“Ana & João”) ou uma pessoa só." },
        { chave: "role", rotulo: "Papel", placeholder: "Padrinhos", obrigatorio: true, max: 40, ajuda: "Padrinhos, Madrinha, Padrinho, Daminha, Pajem…" },
        {
          chave: "side",
          rotulo: "Lado",
          tipo: "escolha",
          opcoes: [
            { valor: "noiva", rotulo: "Da noiva" },
            { valor: "noivo", rotulo: "Do noivo" },
          ],
        },
        { chave: "description", rotulo: "Uma frase (opcional)", tipo: "paragrafo", max: 400, placeholder: "Amiga de infância da noiva" },
        { chave: "image_path", rotulo: "Foto (opcional)", tipo: "imagem" },
      ]}
      resumo={(p) => ({ principal: String(p.name), detalhe: `${p.role} · lado ${p.side === "noivo" ? "do noivo" : "da noiva"}` })}
    />
  );
}
