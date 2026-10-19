"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A música do site: uma pílula discreta no canto da tela.
 *
 * Navegador nenhum deixa um site tocar som antes de a pessoa encostar na
 * tela — é regra do Chrome e do Safari. Então tentamos tocar assim que a
 * página abre e, se o navegador recusar (o normal no celular), a música
 * entra no primeiro toque em qualquer lugar. Quem pausar na mão não é
 * interrompido de novo.
 */
export function PlayerMusica({
  arquivo,
  titulo,
  artista,
  volume = 0.5,
}: {
  arquivo: string;
  titulo: string;
  artista?: string;
  volume?: number;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const pausouNaMao = useRef(false);
  const [tocando, setTocando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    let encerrado = false;

    async function tentar() {
      const audio = audioRef.current;
      if (!audio || encerrado || pausouNaMao.current || !audio.paused) return false;
      try {
        await audio.play();
        return true;
      } catch {
        return false;
      }
    }

    void tentar();

    // O toque no próprio botão é dele: se este toque desse o play, o clique
    // logo em seguida pausaria.
    async function aoEncostar(evento: Event) {
      const alvo = evento.target as Element | null;
      if (alvo?.closest?.("[data-botao-musica]")) return desarmar();
      if (await tentar()) desarmar();
    }
    function desarmar() {
      document.removeEventListener("pointerdown", aoEncostar);
      document.removeEventListener("keydown", aoEncostar);
      document.removeEventListener("touchstart", aoEncostar);
    }
    document.addEventListener("pointerdown", aoEncostar);
    document.addEventListener("keydown", aoEncostar);
    document.addEventListener("touchstart", aoEncostar);

    return () => {
      encerrado = true;
      desarmar();
    };
  }, [arquivo]);

  function alternar() {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      pausouNaMao.current = true;
      audio.pause();
      return;
    }
    pausouNaMao.current = false;
    setCarregando(true);
    audio
      .play()
      .catch(() => setErro(true))
      .finally(() => setCarregando(false));
  }

  // Arquivo quebrado ou formato que o aparelho não abre: some com o player
  // em vez de deixar um botão morto.
  if (erro) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 mb-[env(safe-area-inset-bottom)] sm:bottom-6 sm:left-6">
      <audio
        ref={audioRef}
        src={arquivo}
        loop
        // Só os metadados de cara: o arquivo inteiro baixaria para todo
        // visitante, mesmo quem nunca ouve. O play busca o resto aos poucos.
        preload="metadata"
        onPlay={() => setTocando(true)}
        onPause={() => setTocando(false)}
        onWaiting={() => setCarregando(true)}
        onPlaying={() => setCarregando(false)}
        onError={() => setErro(true)}
      />
      <div className="flex items-center gap-3 rounded-full border border-ouro/40 bg-papel-claro/95 py-1.5 pr-4 pl-1.5 shadow-lg backdrop-blur">
        <button
          type="button"
          onClick={alternar}
          data-botao-musica
          aria-label={tocando ? "Pausar a música" : "Tocar a música"}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-marinho text-papel-claro transition-colors hover:bg-marinho-escuro ${tocando ? "respirar" : ""}`}
        >
          {carregando ? (
            <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-papel/40 border-t-papel" />
          ) : tocando ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <rect x="7" y="5" width="3.5" height="14" rx="1" />
              <rect x="13.5" y="5" width="3.5" height="14" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4 translate-x-0.5" fill="currentColor" aria-hidden="true">
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
          )}
        </button>
        <div className="min-w-0 max-w-36 sm:max-w-52">
          <p className="titulo-serif truncate text-sm leading-tight text-marinho">{titulo}</p>
          <p className="truncate text-xs leading-tight text-azul">
            {tocando ? (artista ?? "Tocando agora") : "Toque para ouvir"}
          </p>
        </div>
        {tocando && (
          <span className="equalizar flex h-4 items-end gap-0.5" aria-hidden="true">
            <span className="h-full w-0.5 rounded-full bg-ouro" />
            <span className="h-full w-0.5 rounded-full bg-ouro" />
            <span className="h-full w-0.5 rounded-full bg-ouro" />
          </span>
        )}
      </div>
    </div>
  );
}
