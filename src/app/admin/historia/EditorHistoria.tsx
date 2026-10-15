"use client";

import type { EventoHistoria } from "@/lib/tipos";
import { EditorLista } from "@/components/EditorLista";

export function EditorHistoria({ eventos, demo }: { eventos: EventoHistoria[]; demo: boolean }) {
  return (
    <EditorLista
      tabela="story_events"
      itens={eventos}
      pasta="historia"
      nomeItem="capítulo"
      titulo="Capítulos da linha do tempo"
      demo={demo}
      novo={{ title: "", date_label: "", description: "", image_path: "" }}
      campos={[
        { chave: "title", rotulo: "Título", placeholder: "O primeiro encontro", obrigatorio: true, max: 120 },
        { chave: "date_label", rotulo: "Quando", placeholder: "Março de 2019", max: 60, ajuda: "Texto livre: uma data, um mês, uma estação." },
        { chave: "description", rotulo: "O que aconteceu", tipo: "paragrafo", max: 1500 },
        { chave: "image_path", rotulo: "Foto (opcional)", tipo: "imagem" },
      ]}
      resumo={(e) => ({ principal: String(e.title), detalhe: (e.date_label as string | null) ?? undefined })}
    />
  );
}
