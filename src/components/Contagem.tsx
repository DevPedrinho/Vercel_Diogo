"use client";

import { useEffect, useState } from "react";

type Restante = { dias: number; horas: number; minutos: number; segundos: number };

function calcular(alvo: number): Restante | null {
  const diff = alvo - Date.now();
  if (diff <= 0) return null;
  return {
    dias: Math.floor(diff / 86_400_000),
    horas: Math.floor((diff / 3_600_000) % 24),
    minutos: Math.floor((diff / 60_000) % 60),
    segundos: Math.floor((diff / 1000) % 60),
  };
}

const RAIO = 44;
const VOLTA = 2 * Math.PI * RAIO;

/** Um algarismo que "cai" no lugar quando muda — a key força a animação. */
function Algarismo({ valor }: { valor: string }) {
  return (
    <span className="relative inline-block w-[0.62em] overflow-hidden text-center">
      <span key={valor} className="virar inline-block">
        {valor}
      </span>
    </span>
  );
}

function Unidade({ valor, rotulo, fracao }: { valor?: number; rotulo: string; fracao: number }) {
  const texto = valor === undefined ? "··" : String(valor).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div className="relative aspect-square w-[4.6rem] sm:w-36">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="50" cy="50" r={RAIO} fill="none" stroke="#a88a5e" strokeOpacity="0.22" strokeWidth="1.5" />
          <circle
            cx="50"
            cy="50"
            r={RAIO}
            fill="none"
            stroke="#253a54"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={VOLTA}
            strokeDashoffset={VOLTA * (1 - fracao)}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        {/* Pontinho dourado na ponta do arco, girando com ele. */}
        <span
          aria-hidden="true"
          className="absolute inset-0 transition-transform duration-700 ease-out"
          style={{ transform: `rotate(${fracao * 360}deg)` }}
        >
          <span className="absolute top-[3%] left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ouro sm:h-2 sm:w-2" />
        </span>
        <p className="titulo-serif absolute inset-0 flex items-center justify-center text-3xl text-marinho tabular-nums lining-nums sm:text-6xl">
          {texto.split("").map((c, i) => (
            <Algarismo key={i} valor={c} />
          ))}
        </p>
      </div>
      <p className="versalete mt-3 text-[0.68rem] text-ouro-escuro sm:text-xs">{rotulo}</p>
    </div>
  );
}

export function Contagem({ dataISO }: { dataISO: string }) {
  const alvo = new Date(dataISO).getTime();
  // Começa vazio e preenche no cliente: o relógio do servidor e o do
  // navegador nunca batem no segundo, e isso quebraria a hidratação.
  const [restante, setRestante] = useState<Restante | null | undefined>(undefined);

  useEffect(() => {
    setRestante(calcular(alvo));
    const id = setInterval(() => setRestante(calcular(alvo)), 1000);
    return () => clearInterval(id);
  }, [alvo]);

  if (restante === null) {
    return <p className="script text-center text-6xl text-marinho">Chegou o grande dia!</p>;
  }

  // Os dias enchem ao longo do último ano; os outros, a cada volta do relógio.
  const r = restante;
  const itens = [
    { rotulo: "Dias", valor: r?.dias, fracao: r ? Math.max(0.03, 1 - r.dias / 365) : 0 },
    { rotulo: "Horas", valor: r?.horas, fracao: r ? r.horas / 24 : 0 },
    { rotulo: "Minutos", valor: r?.minutos, fracao: r ? r.minutos / 60 : 0 },
    { rotulo: "Segundos", valor: r?.segundos, fracao: r ? r.segundos / 60 : 0 },
  ];

  return (
    <div role="timer" aria-live="off" aria-label={r ? `Faltam ${r.dias} dias, ${r.horas} horas e ${r.minutos} minutos` : undefined}>
      <div className="mx-auto flex max-w-3xl items-start justify-center gap-2.5 sm:gap-8">
        {itens.map((item) => (
          <Unidade key={item.rotulo} {...item} />
        ))}
      </div>
      <p className="script mt-8 text-center text-4xl text-ouro sm:text-5xl">até o nosso sim</p>
    </div>
  );
}
