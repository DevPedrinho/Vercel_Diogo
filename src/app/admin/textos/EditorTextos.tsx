"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { GRUPOS, PADROES, type CampoTexto, type GrupoTextos } from "@/lib/textos";
import { linkSeguro } from "@/lib/formato";
import { urlDoSite } from "@/lib/storage";
import { criarClienteNavegador } from "@/lib/supabase/cliente";
import { Botao } from "@/components/Botao";
import { Ajuda, Aviso, Bloco, Rotulo } from "@/components/Formulario";
import { UploadImagem } from "@/components/UploadImagem";

const AVISO_DEMO = "Modo demonstração: conecte o Supabase para salvar as mudanças.";

/* A data mora no banco como ISO com fuso (-03:00, Fortaleza não tem horário
   de verão); o campo datetime-local quer "2027-01-16T19:00", sem fuso. */
function isoParaCampo(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Date(d.getTime() - 3 * 3_600_000).toISOString().slice(0, 16);
}
function campoParaIso(valor: string): string {
  return valor ? `${valor}:00-03:00` : "";
}

export function EditorTextos({ salvos, demo }: { salvos: Record<string, string>; demo: boolean }) {
  // Os salvos são a fonte da verdade entre um grupo e outro: salvar "Os
  // noivos" não pode apagar o que foi salvo em "Página inicial".
  const [base, setBase] = useState(salvos);

  return (
    <div className="space-y-8">
      <nav className="flex flex-wrap gap-2" aria-label="Seções">
        {GRUPOS.map((g) => (
          <a
            key={g.id}
            href={`#${g.id}`}
            className="inline-flex min-h-10 items-center rounded-full border border-ouro/40 bg-papel-claro px-4 text-sm text-marinho hover:border-marinho"
          >
            {g.titulo}
          </a>
        ))}
      </nav>
      {GRUPOS.map((g) => (
        <Grupo key={g.id} grupo={g} base={base} aoSalvar={setBase} demo={demo} />
      ))}
    </div>
  );
}

function Grupo({
  grupo,
  base,
  aoSalvar,
  demo,
}: {
  grupo: GrupoTextos;
  base: Record<string, string>;
  aoSalvar: (novos: Record<string, string>) => void;
  demo: boolean;
}) {
  const router = useRouter();
  const inicial = Object.fromEntries(grupo.campos.map((c) => [c.chave, base[c.chave]?.trim() ? base[c.chave] : c.padrao]));
  const [valores, setValores] = useState<Record<string, string>>(inicial);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const mudou = grupo.campos.some((c) => valores[c.chave] !== inicial[c.chave]);

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setOk(false);

    for (const c of grupo.campos) {
      const v = valores[c.chave].trim();
      if (c.tipo === "url" && v && !linkSeguro(v)) return setErro(`“${c.rotulo}” precisa ser um link começando com https://`);
      if (c.tipo === "datahora" && Number.isNaN(new Date(v).getTime())) return setErro("Confira a data e a hora.");
      if (c.tipo === "data" && v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) return setErro(`Confira a data de “${c.rotulo}”.`);
    }
    if (demo) return setErro(AVISO_DEMO);

    // Guarda só o que é diferente do padrão: o resto continua seguindo o
    // texto do convite, mesmo se ele for corrigido no código depois.
    const novos = { ...base };
    for (const c of grupo.campos) {
      const v = valores[c.chave].trim();
      if (!v || v === PADROES[c.chave]) delete novos[c.chave];
      else novos[c.chave] = v;
    }

    setSalvando(true);
    const { error } = await criarClienteNavegador().from("site_content").update({ texts: novos }).eq("id", true);
    setSalvando(false);
    if (error) return setErro("Não foi possível salvar. Tente de novo.");
    aoSalvar(novos);
    setOk(true);
    router.refresh();
  }

  const mudar = (chave: string, valor: string) => {
    setOk(false);
    setValores((v) => ({ ...v, [chave]: valor }));
  };

  return (
    <Bloco id={grupo.id} titulo={grupo.titulo} descricao={grupo.descricao}>
      <form onSubmit={salvar} className="space-y-6">
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
          {grupo.campos.map((c) => (
            <Campo key={c.chave} campo={c} valor={valores[c.chave]} aoMudar={(v) => mudar(c.chave, v)} demo={demo} />
          ))}
        </div>
        {erro && <Aviso tipo="erro">{erro}</Aviso>}
        {ok && <Aviso tipo="ok">Salvo! O site já mostra os textos novos.</Aviso>}
        <Botao type="submit" disabled={salvando || !mudou}>
          {salvando ? "Salvando…" : mudou ? "Salvar alterações" : "Nada para salvar"}
        </Botao>
      </form>
    </Bloco>
  );
}

function Campo({
  campo,
  valor,
  aoMudar,
  demo,
}: {
  campo: CampoTexto;
  valor: string;
  aoMudar: (v: string) => void;
  demo: boolean;
}) {
  const id = `t-${campo.chave}`;
  const diferente = campo.padrao && valor.trim() !== campo.padrao && campo.tipo !== "imagem";
  const largo = campo.tipo === "paragrafo" || campo.tipo === "url" || campo.tipo === "imagem";

  return (
    <div className={largo ? "sm:col-span-2" : ""}>
      {campo.tipo === "imagem" ? (
        <UploadImagem
          pasta="site"
          caminhoAtual={valor || null}
          urlAtual={urlDoSite(valor) ?? "/img/casal.png"}
          aoEnviar={aoMudar}
          aoRemover={() => aoMudar("")}
          rotulo={campo.rotulo}
          proporcao="aspect-[730/470]"
          demo={demo}
        />
      ) : (
        <>
          <Rotulo htmlFor={id}>{campo.rotulo}</Rotulo>
          {campo.tipo === "paragrafo" ? (
            <textarea
              id={id}
              rows={Math.min(8, Math.max(3, valor.split("\n").length + 1))}
              className="campo resize-y"
              value={valor}
              onChange={(e) => aoMudar(e.target.value)}
            />
          ) : campo.tipo === "datahora" ? (
            <input
              id={id}
              type="datetime-local"
              className="campo"
              value={isoParaCampo(valor)}
              onChange={(e) => aoMudar(campoParaIso(e.target.value))}
            />
          ) : (
            <input
              id={id}
              type={campo.tipo === "url" ? "url" : campo.tipo === "data" ? "date" : "text"}
              className="campo"
              placeholder={campo.padrao}
              value={valor}
              onChange={(e) => aoMudar(e.target.value)}
            />
          )}
        </>
      )}
      {campo.ajuda && <Ajuda>{campo.ajuda}</Ajuda>}
      {diferente && (
        <button
          type="button"
          onClick={() => aoMudar(campo.padrao)}
          className="mt-1 text-sm text-azul underline underline-offset-4 hover:text-marinho"
        >
          Voltar ao texto do convite
        </button>
      )}
    </div>
  );
}
