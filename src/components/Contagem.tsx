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

export function Contagem({ dataISO }: { dataISO: string }) {
  const alvo = new Date(dataISO).getTime();
  // Começa vazio e preenche no cliente: o horário do servidor e o do
  // navegador nunca batem no segundo, e isso quebraria a hidratação.
  const [restante, setRestante] = useState<Restante | null | undefined>(undefined);

  useEffect(() => {
    setRestante(calcular(alvo));
    const id = setInterval(() => setRestante(calcular(alvo)), 1000);
    return () => clearInterval(id);
  }, [alvo]);

  if (restante === null) {
    return <p className="script text-center text-5xl text-marinho">Chegou o grande dia!</p>;
  }

  const itens = [
    { rotulo: "Dias", valor: restante?.dias },
    { rotulo: "Horas", valor: restante?.horas },
    { rotulo: "Minutos", valor: restante?.minutos },
    { rotulo: "Segundos", valor: restante?.segundos },
  ];

  return (
    <div className="mx-auto grid max-w-3xl grid-cols-4 gap-2 sm:gap-6" role="timer" aria-live="off">
      {itens.map((item, i) => (
        <div key={item.rotulo} className={`text-center ${i > 0 ? "border-l border-ouro/40" : ""}`}>
          <p className="titulo-serif text-4xl text-marinho tabular-nums lining-nums sm:text-6xl">
            {item.valor === undefined ? "··" : String(item.valor).padStart(2, "0")}
          </p>
          <p className="versalete mt-2 text-[0.7rem] text-ouro-escuro sm:text-xs">{item.rotulo}</p>
        </div>
      ))}
    </div>
  );
}
