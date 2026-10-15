"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Divisor } from "./Ornamentos";

/** Bloco com título centralizado e entrada suave ao chegar na tela. */
export function Secao({
  id,
  sobretitulo,
  titulo,
  children,
  className = "",
  fundo = "papel",
}: {
  id?: string;
  sobretitulo?: string;
  titulo?: string;
  children: ReactNode;
  className?: string;
  fundo?: "papel" | "claro" | "azul";
}) {
  const ref = useRef<HTMLElement>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisivel(true);
          observador.disconnect();
        }
      },
      // threshold 0: uma lista longa no celular é mais alta que a tela, e
      // uma fração dela nunca caberia — o conteúdo ficaria invisível.
      { threshold: 0, rootMargin: "0px 0px -60px 0px" },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  const fundos = {
    papel: "papel",
    claro: "bg-papel-claro",
    azul: "bg-azul text-papel-claro",
  } as const;
  const escuro = fundo === "azul";

  return (
    <section id={id} ref={ref} className={`relative scroll-mt-16 px-5 py-20 sm:py-28 ${fundos[fundo]} ${className}`}>
      <div className={`relative mx-auto max-w-5xl revelar ${visivel ? "revelado" : ""}`}>
        {(sobretitulo || titulo) && (
          <header className="mb-12 text-center sm:mb-16">
            {sobretitulo && (
              <p className={`versalete titulo-serif mb-4 text-xs font-semibold ${escuro ? "text-papel/75" : "text-ouro-escuro"}`}>
                {sobretitulo}
              </p>
            )}
            {titulo && (
              <h2 className={`titulo-serif text-3xl leading-tight sm:text-5xl ${escuro ? "text-papel-claro" : "text-marinho"}`}>
                {titulo}
              </h2>
            )}
            <Divisor className="mt-7" claro={escuro} />
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
