import type { ReactNode } from "react";

export function Rotulo({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="versalete titulo-serif mb-2 block text-[0.72rem] font-semibold text-ouro-escuro">
      {children}
    </label>
  );
}

export function Ajuda({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-sm leading-snug text-azul">{children}</p>;
}

export function Aviso({ tipo, children }: { tipo: "erro" | "ok" | "info"; children: ReactNode }) {
  const estilos = {
    erro: "border-red-800/30 bg-red-50 text-red-900",
    ok: "border-marinho/25 bg-nevoa text-marinho",
    info: "border-ouro/40 bg-papel text-marinho",
  } as const;
  return (
    <p role={tipo === "erro" ? "alert" : "status"} className={`rounded-sm border px-4 py-3 text-base ${estilos[tipo]}`}>
      {children}
    </p>
  );
}

/** Cartão branco do painel, com título e descrição. */
export function Bloco({
  titulo,
  descricao,
  acao,
  children,
  id,
}: {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-sm border border-ouro/30 bg-papel-claro p-6 shadow-sm sm:p-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="titulo-serif text-2xl text-marinho">{titulo}</h2>
          {descricao && <p className="mt-1 text-base text-azul">{descricao}</p>}
        </div>
        {acao}
      </header>
      {children}
    </section>
  );
}

export function TituloPagina({ sobretitulo, titulo, children }: { sobretitulo: string; titulo: string; children?: ReactNode }) {
  return (
    <header className="mb-8 sm:mb-10">
      <p className="versalete titulo-serif text-xs font-semibold text-ouro-escuro">{sobretitulo}</p>
      <h1 className="titulo-serif mt-2 text-4xl text-marinho sm:text-5xl">{titulo}</h1>
      {children && <div className="mt-3 max-w-2xl text-lg text-azul">{children}</div>}
    </header>
  );
}
