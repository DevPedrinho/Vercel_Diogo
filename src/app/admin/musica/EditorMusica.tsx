"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import type { MusicaDoSite } from "@/lib/tipos";
import { criarClienteNavegador } from "@/lib/supabase/cliente";
import { Botao } from "@/components/Botao";
import { Ajuda, Aviso, Bloco, Rotulo } from "@/components/Formulario";
import { Icone } from "@/components/Icones";

const LIMITE_MB = 15;
const AVISO_DEMO = "Modo demonstração: conecte o Supabase para salvar as mudanças.";

/**
 * O arquivo é de vocês: comprem a faixa (iTunes, Amazon…) e enviem o MP3
 * aqui. O site não baixa música de lugar nenhum — só toca o que for enviado.
 */
export function EditorMusica({
  musica,
  urlTocando,
  demo,
}: {
  musica: MusicaDoSite;
  urlTocando: string | null;
  demo: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [titulo, setTitulo] = useState(musica.title ?? "");
  const [artista, setArtista] = useState(musica.artist ?? "");
  const [ligada, setLigada] = useState(musica.enabled);
  const [volume, setVolume] = useState(musica.volume ?? 0.5);
  const [enviando, setEnviando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function atualizar(dados: Partial<MusicaDoSite>) {
    const { error } = await criarClienteNavegador().from("site_music").update(dados).eq("id", true);
    if (error) throw new Error(error.message);
  }

  async function enviarArquivo(arquivo: File | undefined) {
    if (!arquivo) return;
    setErro(null);
    setOk(null);
    if (!arquivo.type.startsWith("audio/")) return setErro("Escolha um arquivo de áudio (MP3, M4A, OGG ou WAV).");
    if (arquivo.size > LIMITE_MB * 1024 * 1024) return setErro(`O arquivo passa de ${LIMITE_MB} MB. Use um MP3 mais leve.`);
    if (demo) return setErro(AVISO_DEMO);

    setEnviando(true);
    try {
      const supabase = criarClienteNavegador();
      const extensao = arquivo.name.split(".").pop()?.toLowerCase() || "mp3";
      const novo = `musica/${crypto.randomUUID()}.${extensao}`;
      const { error } = await supabase.storage.from("site").upload(novo, arquivo, { contentType: arquivo.type });
      if (error) throw new Error(error.message);

      // O arquivo antigo só sai depois que o novo está gravado no banco.
      const antigo = musica.file_path;
      // Sem nome preenchido, o nome do arquivo serve de ponto de partida.
      const nome = titulo.trim() || arquivo.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      await atualizar({ file_path: novo, title: nome, enabled: true });
      if (antigo) await supabase.storage.from("site").remove([antigo]);

      setTitulo(nome);
      setLigada(true);
      setOk("Música enviada! Ela já está tocando no site.");
      router.refresh();
    } catch (e) {
      setErro(`Não deu para enviar o arquivo${e instanceof Error && e.message ? `: ${e.message}` : "."}`);
    } finally {
      setEnviando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remover() {
    setErro(null);
    setOk(null);
    if (demo) return setErro(AVISO_DEMO);
    if (!confirm("Tirar a música do site?")) return;
    try {
      const antigo = musica.file_path;
      await atualizar({ file_path: null });
      if (antigo) await criarClienteNavegador().storage.from("site").remove([antigo]);
      setOk("Música removida. O player some do site.");
      router.refresh();
    } catch (e) {
      setErro(`Não deu para remover: ${e instanceof Error ? e.message : ""}`);
    }
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setOk(null);
    if (demo) return setErro(AVISO_DEMO);
    setSalvando(true);
    try {
      await atualizar({ title: titulo.trim() || null, artist: artista.trim() || null, enabled: ligada, volume });
      setOk("Salvo!");
      router.refresh();
    } catch (err) {
      setErro(`Não deu para salvar: ${err instanceof Error ? err.message : ""}`);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="space-y-8">
      {erro && <Aviso tipo="erro">{erro}</Aviso>}
      {ok && <Aviso tipo="ok">{ok}</Aviso>}

      <Bloco titulo="Arquivo da música" descricao={`MP3, M4A, OGG ou WAV, até ${LIMITE_MB} MB.`}>
        {urlTocando ? (
          <div className="rounded-sm border border-ouro/30 bg-papel p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-marinho text-papel-claro">
                  <Icone nome="musica" className="h-5 w-5" />
                </span>
                <div>
                  <p className="titulo-serif text-xl text-marinho">{titulo || "Nossa música"}</p>
                  <p className="text-sm text-azul">
                    {artista || "—"}
                    {!musica.file_path && " · música padrão do site"}
                  </p>
                </div>
              </div>
              {musica.file_path && (
                <button type="button" onClick={remover} className="min-h-11 text-base text-red-800 underline underline-offset-4">
                  Remover
                </button>
              )}
            </div>
            <audio src={urlTocando} controls preload="none" className="mt-4 w-full" />
          </div>
        ) : (
          <div className="rounded-sm border border-dashed border-ouro/50 px-6 py-10 text-center">
            <p className="titulo-serif text-xl text-azul italic">Nenhuma música enviada ainda.</p>
            <p className="mx-auto mt-2 max-w-md text-base text-azul">Enquanto não houver arquivo, o player nem aparece no site.</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => void enviarArquivo(e.target.files?.[0])}
        />
        <Botao type="button" variante="contorno" disabled={enviando} onClick={() => inputRef.current?.click()} className="mt-5">
          <Icone nome="musica" className="h-4 w-4" />
          {enviando ? "Enviando…" : musica.file_path ? "Trocar música" : "Enviar música"}
        </Botao>
      </Bloco>

      <Bloco titulo="Como aparece no site">
        <form onSubmit={salvar} className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Rotulo htmlFor="m-titulo">Nome da música</Rotulo>
              <input id="m-titulo" className="campo" placeholder="Perfect" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            </div>
            <div>
              <Rotulo htmlFor="m-artista">Artista</Rotulo>
              <input id="m-artista" className="campo" placeholder="Ed Sheeran" value={artista} onChange={(e) => setArtista(e.target.value)} />
            </div>
          </div>

          <div>
            <Rotulo htmlFor="m-volume">Volume inicial · {Math.round(volume * 100)}%</Rotulo>
            <input
              id="m-volume"
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full max-w-sm accent-[var(--color-marinho)]"
            />
            <Ajuda>Música de fundo fica melhor baixinha — entre 30% e 50%.</Ajuda>
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={ligada}
              onChange={(e) => setLigada(e.target.checked)}
              className="h-5 w-5 accent-[var(--color-marinho)]"
            />
            <span className="text-lg text-marinho">Tocar música no site</span>
          </label>

          <Botao type="submit" disabled={salvando}>
            {salvando ? "Salvando…" : "Salvar"}
          </Botao>
        </form>
      </Bloco>
    </div>
  );
}
