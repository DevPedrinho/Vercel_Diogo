"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Entra suave quando chega na tela. `de` escolhe a direção — a linha do
 * tempo usa esquerda e direita alternadas.
 */
export function Revelar({
  children,
  de = "baixo",
  atraso = 0,
  className = "",
}: {
  children: ReactNode;
  de?: "baixo" | "esquerda" | "direita";
  atraso?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisivel(true);
          obs.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -50px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`revelar revelar-${de} ${visivel ? "revelado" : ""} ${className}`}
      style={atraso ? { transitionDelay: `${atraso}ms` } : undefined}
    >
      {children}
    </div>
  );
}
