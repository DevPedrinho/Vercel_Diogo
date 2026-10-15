"use client";

import { useRef, useState, type DragEvent } from "react";
import { comprimirFoto } from "@/lib/imagem";
import { criarClienteNavegador } from "@/lib/supabase/cliente";
import { Icone } from "@/components/Icones";

/**
 * Escolhe ou arrasta, comprime e envia uma imagem para o bucket "site".
 * Guarda só o caminho no banco — nunca base64.
 */
export function UploadImagem({
  pasta,
  caminhoAtual,
  urlAtual,
  aoEnviar,
  aoRemover,
  rotulo = "Imagem",
  proporcao = "aspect-4/3",
  demo = false,
}: {
  pasta: string;
  caminhoAtual: string | null;
  urlAtual: string | null;
  aoEnviar: (caminho: string) => void;
  aoRemover: () => void;
  rotulo?: string;
  proporcao?: string;
  /** No modo demonstração a prévia aparece, mas nada sobe. */
  demo?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previa, setPrevia] = useState<string | null>(null);
  const [arrastando, setArrastando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const mostrando = previa ?? urlAtual;

  async function processar(arquivo: File | undefined) {
    if (!arquivo) return;
    setErro(null);
    setEnviando(true);
    try {
      const foto = await comprimirFoto(arquivo);
      setPrevia(foto.previa);
      if (demo) {
        setErro("Modo demonstração: a prévia aparece, mas a imagem só é salva com o Supabase ligado.");
        return;
      }
      const caminho = `${pasta}/${crypto.randomUUID()}.jpg`;
      const supabase = criarClienteNavegador();
      const { error } = await supabase.storage.from("site").upload(caminho, foto.arquivo, { contentType: "image/jpeg" });
      if (error) throw new Error("upload");
      aoEnviar(caminho);
    } catch (e) {
      setPrevia(null);
      setErro(e instanceof Error && e.message !== "upload" ? e.message : "Não foi possível enviar a imagem. Tente de novo.");
    } finally {
      setEnviando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function aoSoltar(e: DragEvent) {
    e.preventDefault();
    setArrastando(false);
    void processar(e.dataTransfer.files?.[0]);
  }

  return (
    <div>
      <p className="versalete titulo-serif mb-2 text-[0.72rem] font-semibold text-ouro-escuro">{rotulo}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => void processar(e.target.files?.[0])}
      />

      {mostrando ? (
        <div className={`relative max-w-sm overflow-hidden rounded-sm border border-ouro/35 bg-papel ${proporcao}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mostrando} alt="Prévia" className="h-full w-full object-cover" />
          {enviando && (
            <div className="absolute inset-0 flex items-center justify-center bg-papel-claro/80">
              <span className="titulo-serif text-base text-marinho">Enviando…</span>
            </div>
          )}
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={enviando}
              aria-label="Trocar imagem"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-papel-claro/95 text-marinho shadow-sm"
            >
              <Icone nome="imagem" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setPrevia(null);
                aoRemover();
              }}
              disabled={enviando}
              aria-label="Tirar imagem"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-papel-claro/95 text-red-800 shadow-sm"
            >
              <Icone nome="fechar" className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setArrastando(true);
          }}
          onDragLeave={() => setArrastando(false)}
          onDrop={aoSoltar}
          className={`flex w-full max-w-sm flex-col items-center justify-center gap-2 rounded-sm border border-dashed px-6 py-8 text-center transition-colors ${
            arrastando ? "border-marinho bg-nevoa" : "border-ouro/50 bg-papel hover:border-marinho"
          }`}
        >
          <Icone nome="imagem" className="h-7 w-7 text-ouro-escuro" />
          <span className="text-base text-marinho">{enviando ? "Enviando…" : "Escolher ou arrastar uma foto"}</span>
          <span className="text-sm text-azul">JPG ou PNG — a gente deixa leve sozinho</span>
        </button>
      )}
      {erro && <p className="mt-2 text-sm text-red-800">{erro}</p>}
    </div>
  );
}
