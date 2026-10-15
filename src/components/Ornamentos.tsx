/**
 * Os enfeites da IDV, redesenhados em SVG para ficarem nítidos em qualquer
 * tela: o coraçãozinho dourado entre filetes, os raminhos de mosquitinho,
 * a aquarela azul dos cantos e o selo de cera com o monograma V | D.
 */

export function Coracao({ className = "", cheio = false }: { className?: string; cheio?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 22"
      aria-hidden="true"
      className={className}
      fill={cheio ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={cheio ? 0 : 1.6}
    >
      <path d="M12 20.3 3.9 12.3C1.6 10 1.7 6.3 4.1 4.2a5.2 5.2 0 0 1 7.4.5l.5.6.5-.6a5.2 5.2 0 0 1 7.4-.5c2.4 2.1 2.5 5.8.2 8.1L12 20.3Z" />
    </svg>
  );
}

/** Filete — coração — filete, como abaixo do "Save the date". */
export function Divisor({ className = "", claro = false }: { className?: string; claro?: boolean }) {
  const linha = claro ? "bg-papel/45" : "bg-ouro/70";
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <span className={`h-px w-20 sm:w-36 ${linha}`} />
      <Coracao className={`w-3.5 ${claro ? "text-papel/80" : "text-ouro"}`} />
      <span className={`h-px w-20 sm:w-36 ${linha}`} />
    </div>
  );
}

/** Filete simples com o texto em versalete no meio ("— CASAMENTO —"). */
export function Faixa({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 sm:gap-6 ${className}`}>
      <span className="h-px flex-1 max-w-28 bg-ouro/60" aria-hidden="true" />
      <span className="versalete titulo-serif text-ouro-escuro">{children}</span>
      <span className="h-px flex-1 max-w-28 bg-ouro/60" aria-hidden="true" />
    </div>
  );
}

/* ---------- Raminho de mosquitinho (gypsophila) ----------
   Gerado uma vez com um aleatório de semente fixa: o desenho é sempre o
   mesmo, e ninguém precisa manter centenas de coordenadas à mão. */

function aleatorio(semente: number) {
  let s = semente;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

type Galho = { d: string; flores: [number, number, number][] };

function desenharRamo(semente: number): Galho[] {
  const r = aleatorio(semente);
  const galhos: Galho[] = [];

  // Haste principal: do canto (0,200) subindo em curva até (190,20).
  const pontos: [number, number][] = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    pontos.push([8 + t * 175 + Math.sin(t * 3) * 8, 196 - t * 172 - Math.sin(t * 2.4) * 18]);
  }
  galhos.push({ d: "M" + pontos.map((p) => p.map((n) => n.toFixed(1)).join(" ")).join(" L"), flores: [] });

  // Raminhos saindo da haste, cada um com um cacho na ponta.
  for (let i = 2; i < pontos.length; i++) {
    for (const lado of [-1, 1]) {
      if (r() < 0.25) continue;
      const [x, y] = pontos[i];
      const angulo = -Math.PI / 4 + lado * (0.5 + r() * 0.6);
      const comp = 26 + r() * 34;
      const fx = x + Math.cos(angulo) * comp;
      const fy = y + Math.sin(angulo) * comp;
      const cx = (x + fx) / 2 + lado * 6;
      const cy = (y + fy) / 2 - 4;
      const flores: [number, number, number][] = [];
      const n = 3 + Math.floor(r() * 4);
      for (let k = 0; k < n; k++) {
        const a = r() * Math.PI * 2;
        const d = 3 + r() * 9;
        flores.push([fx + Math.cos(a) * d, fy + Math.sin(a) * d, 2 + r() * 1.6]);
      }
      // Pequenos talos até cada florzinha.
      const talos = flores.map(([px, py]) => `M${fx.toFixed(1)} ${fy.toFixed(1)} L${px.toFixed(1)} ${py.toFixed(1)}`).join(" ");
      galhos.push({
        d: `M${x.toFixed(1)} ${y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${fx.toFixed(1)} ${fy.toFixed(1)} ${talos}`,
        flores,
      });
    }
  }
  return galhos;
}

const RAMO = desenharRamo(7);

export function Ramo({ className = "", espelhado = false }: { className?: string; espelhado?: boolean }) {
  return (
    <svg
      viewBox="0 0 220 210"
      aria-hidden="true"
      className={className}
      style={espelhado ? { transform: "scaleX(-1)" } : undefined}
    >
      <g fill="none" stroke="#a88a5e" strokeLinecap="round" strokeWidth="0.9" opacity="0.9">
        {RAMO.map((g, i) => (
          <path key={i} d={g.d} />
        ))}
      </g>
      {RAMO.flatMap((g, i) =>
        g.flores.map(([x, y, raio], k) => (
          <g key={`${i}-${k}`}>
            <circle cx={x} cy={y} r={raio} fill="#fffdf8" stroke="#cdb894" strokeWidth="0.6" />
            <circle cx={x} cy={y} r={raio * 0.35} fill="#d9c7a4" />
          </g>
        )),
      )}
    </svg>
  );
}

/* ---------- Aquarela azul dos cantos ----------
   Manchas sobrepostas com a borda "comida" por ruído — o mesmo efeito do
   papel molhado do save the date. */

export function Aquarela({
  id,
  className = "",
  canto = "topo-direita",
}: {
  /** Único na página: dá nome aos filtros do SVG. */
  id: string;
  className?: string;
  canto?: "topo-direita" | "base-esquerda";
}) {
  const giro = canto === "base-esquerda" ? "rotate(180 200 200)" : undefined;
  return (
    <svg viewBox="0 0 400 400" aria-hidden="true" className={className} preserveAspectRatio="xMaxYMin slice">
      <defs>
        <filter id={`${id}-borda`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="4" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="58" />
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
        <filter id={`${id}-nevoa`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="9" />
          <feDisplacementMap in="SourceGraphic" scale="70" />
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id={`${id}-grao`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="8" result="ruido" />
          <feColorMatrix in="ruido" type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.18" />
          </feComponentTransfer>
          <feComposite in2="SourceGraphic" operator="in" />
          <feBlend in2="SourceGraphic" mode="multiply" />
        </filter>
      </defs>
      <g transform={giro}>
        {/* Halo aguado em volta, como a tinta que escorre no papel. */}
        <g filter={`url(#${id}-nevoa)`}>
          <path d="M90 -30 C 170 50, 250 90, 290 170 C 320 235, 370 275, 430 330 L 430 -30 Z" fill="#dbe3ec" opacity="0.8" />
        </g>
        <g filter={`url(#${id}-borda)`}>
          <path d="M120 -20 C 190 40, 260 70, 300 150 C 330 210, 380 250, 430 300 L 430 -20 Z" fill="#c4d0dc" opacity="0.7" />
          <path d="M190 -20 C 245 35, 290 80, 322 140 C 350 190, 392 215, 430 238 L 430 -20 Z" fill="#9fb1c4" opacity="0.6" />
          <path d="M250 -20 C 290 25, 325 60, 348 110 C 365 145, 395 170, 430 185 L 430 -20 Z" fill="#6f859c" opacity="0.6" />
          <path d="M300 -20 C 330 15, 352 40, 372 80 C 388 105, 408 122, 430 132 L 430 -20 Z" fill="#46607d" opacity="0.6" />
          <path d="M350 -20 C 368 5, 382 28, 398 52 C 408 66, 418 76, 430 82 L 430 -20 Z" fill="#2a3d55" opacity="0.65" />
          <ellipse cx="335" cy="95" rx="22" ry="12" fill="#2a3d55" opacity="0.25" />
          <ellipse cx="300" cy="150" rx="18" ry="9" fill="#46607d" opacity="0.3" />
        </g>
        <rect width="400" height="400" fill="transparent" filter={`url(#${id}-grao)`} />
        {/* O filete dourado que acompanha a borda da aquarela. */}
        <path
          d="M150 -10 C 215 45, 268 85, 305 160 C 332 215, 372 248, 420 285"
          fill="none"
          stroke="#b89a6a"
          strokeWidth="1.3"
          opacity="0.85"
        />
      </g>
    </svg>
  );
}

/* ---------- Selo de cera V | D ---------- */

function contornoDoSelo() {
  const r = aleatorio(11);
  const pts: string[] = [];
  const n = 26;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const raio = 46 + Math.sin(i * 1.7) * 2.2 + r() * 2.4;
    pts.push(`${(60 + Math.cos(a) * raio).toFixed(1)} ${(60 + Math.sin(a) * raio).toFixed(1)}`);
  }
  return `M${pts.join(" L")} Z`;
}

const CONTORNO_SELO = contornoDoSelo();

export function Selo({
  className = "",
  iniciais = ["V", "D"],
  cor = "azul",
}: {
  className?: string;
  iniciais?: [string, string];
  cor?: "azul" | "ouro";
}) {
  const [claro, medio, escuro, letra] =
    cor === "ouro" ? ["#d8bf8f", "#b6955f", "#8a6c3f", "#6d532f"] : ["#6b819a", "#46607d", "#2a3d55", "#1f2f44"];
  const id = `selo-${cor}`;
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label={`Selo ${iniciais[0]} | ${iniciais[1]}`} className={className}>
      <defs>
        <radialGradient id={`${id}-cera`} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor={claro} />
          <stop offset="55%" stopColor={medio} />
          <stop offset="100%" stopColor={escuro} />
        </radialGradient>
        <radialGradient id={`${id}-miolo`} cx="60%" cy="65%" r="70%">
          <stop offset="0%" stopColor={medio} />
          <stop offset="100%" stopColor={claro} />
        </radialGradient>
      </defs>
      <path d={CONTORNO_SELO} fill={`url(#${id}-cera)`} />
      <circle cx="60" cy="60" r="33" fill={`url(#${id}-miolo)`} stroke={escuro} strokeOpacity="0.55" strokeWidth="1.6" />
      <circle cx="60" cy="60" r="35.5" fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="1" />
      <g fill={letra} fillOpacity="0.85" fontFamily="var(--fonte-titulo), Georgia, serif" fontSize="25" textAnchor="middle">
        <text x="45" y="69">{iniciais[0]}</text>
        <text x="76" y="69">{iniciais[1]}</text>
      </g>
      <line x1="60.5" y1="44" x2="60.5" y2="76" stroke={letra} strokeOpacity="0.7" strokeWidth="1.2" />
    </svg>
  );
}

/** A moldura de filete dourado fino que contorna o convite. */
export function Moldura({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-3 border border-ouro/55 sm:inset-6 ${className}`} />
  );
}
