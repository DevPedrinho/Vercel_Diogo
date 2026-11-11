"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A música do site. No computador, uma pílula discreta no canto da tela; no
 * celular, só o botão redondo, na barra do topo ao lado do menu, para não
 * cobrir formulário nem botão nenhum da página.
 *
 * A música começa sozinha 2 segundos depois de a página abrir. Só que
 * navegador nenhum deixa um site tocar som antes de a pessoa interagir com
 * ele — é regra do Chrome e do Safari, não escolha nossa. Então, se o
 * navegador recusar (o normal na primeira visita, ainda mais no celular), a
 * música entra no primeiro toque ou clique em qualquer lugar da página. Quem
 * pausar na mão não é interrompido de novo.
 */
const ESPERA_MS = 2000;

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
    let liberado = false; // os 2 segundos já passaram?

    async function tentar() {
      const audio = audioRef.current;
      if (!audio || encerrado || !liberado || pausouNaMao.current || !audio.paused) return false;
      try {
        await audio.play();
        return true;
      } catch {
        return false;
      }
    }

    // Os 2 segundos de respiro antes de a música entrar. Um toque antes
    // disso já conta: no Chrome a permissão do toque vale para o resto da
    // visita, então o play dos 2 segundos passa.
    const relogio = setTimeout(() => {
      liberado = true;
      void tentar().then((tocou) => tocou && desarmar());
    }, ESPERA_MS);

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
      clearTimeout(relogio);
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
    <div className="fixed top-2.5 right-[4.5rem] z-50 lg:top-auto lg:right-auto lg:bottom-6 lg:left-6 lg:z-40 lg:mb-[env(safe-area-inset-bottom)]">
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
      <div className="flex items-center gap-3 rounded-full lg:border lg:border-ouro/40 lg:bg-papel-claro/95 lg:py-1.5 lg:pr-4 lg:pl-1.5 lg:shadow-lg lg:backdrop-blur">
        <button
          type="button"
          onClick={alternar}
          data-botao-musica
          aria-label={tocando ? "Pausar a música" : "Tocar a música"}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-marinho text-papel-claro shadow-md transition-colors hover:bg-marinho-escuro lg:h-10 lg:w-10 lg:shadow-none ${tocando ? "respirar" : ""}`}
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
        <div className="hidden min-w-0 max-w-52 lg:block">
          <p className="titulo-serif truncate text-sm leading-tight text-marinho">{titulo}</p>
          <p className="truncate text-xs leading-tight text-azul">
            {tocando ? (artista ?? "Tocando agora") : "Toque para ouvir"}
          </p>
        </div>
        {tocando && (
          <span className="equalizar hidden h-4 items-end gap-0.5 lg:flex" aria-hidden="true">
            <span className="h-full w-0.5 rounded-full bg-ouro" />
            <span className="h-full w-0.5 rounded-full bg-ouro" />
            <span className="h-full w-0.5 rounded-full bg-ouro" />
          </span>
        )}
      </div>
    </div>
  );
}
