"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Confirmacao } from "@/lib/tipos";
import { formatarDataHora } from "@/lib/formato";
import { criarClienteNavegador } from "@/lib/supabase/cliente";
import { Botao } from "@/components/Botao";
import { Aviso, Bloco } from "@/components/Formulario";
import { Icone } from "@/components/Icones";

type Filtro = "todos" | "vao" | "nao";

/** Aspas e ponto e vírgula: o Excel em português abre direto, com acento. */
function paraCsv(linhas: Confirmacao[]) {
  const cel = (v: string | number | null) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const cabecalho = ["Nome", "Vai?", "Acompanhantes", "Nomes dos acompanhantes", "Total de pessoas", "WhatsApp", "Recado", "Respondeu em"];
  const corpo = linhas.map((r) =>
    [
      r.name,
      r.attending ? "Sim" : "Não",
      r.companions,
      (r.companion_names ?? "").replace(/\n+/g, ", "),
      r.attending ? 1 + r.companions : 0,
      r.phone,
      r.message,
      formatarDataHora(r.created_at),
    ]
      .map(cel)
      .join(";"),
  );
  return "﻿" + [cabecalho.map(cel).join(";"), ...corpo].join("\r\n");
}

export function PainelConfirmacoes({ respostas, demo }: { respostas: Confirmacao[]; demo: boolean }) {
  const router = useRouter();
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const vao = respostas.filter((r) => r.attending);
  const pessoas = vao.reduce((t, r) => t + 1 + r.companions, 0);

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return respostas.filter(
      (r) =>
        (filtro === "todos" || (filtro === "vao") === r.attending) &&
        (!termo || `${r.name} ${r.companion_names ?? ""}`.toLowerCase().includes(termo)),
    );
  }, [respostas, filtro, busca]);

  function baixar() {
    const blob = new Blob([paraCsv(respostas)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "confirmacoes-vercia-e-diogo.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function apagar(r: Confirmacao) {
    if (!confirm(`Apagar a resposta de ${r.name}? Use para respostas repetidas.`)) return;
    setErro(null);
    const { error } = await criarClienteNavegador().from("rsvps").delete().eq("id", r.id);
    if (error) setErro("Não deu para apagar agora. Tente de novo.");
    router.refresh();
  }

  const numeros = [
    { rotulo: "Pessoas confirmadas", valor: pessoas, destaque: true },
    { rotulo: "Respostas “vou”", valor: vao.length },
    { rotulo: "Não vão", valor: respostas.length - vao.length },
    { rotulo: "Respostas no total", valor: respostas.length },
  ];

  return (
    <div className="space-y-8">
      {demo && (
        <Aviso tipo="info">
          No modo demonstração o formulário não guarda respostas. Conectem o Supabase antes de divulgar o link de
          confirmação.
        </Aviso>
      )}
      {erro && <Aviso tipo="erro">{erro}</Aviso>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {numeros.map((n) => (
          <div key={n.rotulo} className={`rounded-sm border p-5 ${n.destaque ? "border-marinho bg-marinho text-papel-claro" : "border-ouro/30 bg-papel-claro"}`}>
            <p className={`titulo-serif text-5xl tabular-nums ${n.destaque ? "" : "text-marinho"}`}>{n.valor}</p>
            <p className={`mt-1 text-sm ${n.destaque ? "text-papel/80" : "text-azul"}`}>{n.rotulo}</p>
          </div>
        ))}
      </div>

      <Bloco
        titulo="Respostas"
        descricao="Mais novas primeiro. Se alguém responder duas vezes, apague a repetida."
        acao={
          <Botao type="button" variante="contorno" onClick={baixar} disabled={respostas.length === 0}>
            Baixar planilha
          </Botao>
        }
      >
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <input className="campo max-w-xs" placeholder="Buscar por nome" value={busca} onChange={(e) => setBusca(e.target.value)} />
          {(
            [
              ["todos", "Todos"],
              ["vao", "Vão"],
              ["nao", "Não vão"],
            ] as const
          ).map(([v, t]) => (
            <button
              key={v}
              type="button"
              onClick={() => setFiltro(v)}
              aria-pressed={filtro === v}
              className={`min-h-10 rounded-full border px-4 text-sm ${filtro === v ? "border-marinho bg-marinho text-papel-claro" : "border-ouro/40 text-marinho"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {visiveis.length === 0 ? (
          <p className="text-base text-azul italic">{respostas.length === 0 ? "Nenhuma confirmação ainda." : "Ninguém com esse filtro."}</p>
        ) : (
          <ul className="divide-y divide-ouro/20">
            {visiveis.map((r) => (
              <li key={r.id} className="flex items-start gap-4 py-4">
                <span
                  className={`mt-1 inline-flex h-7 shrink-0 items-center rounded-full px-3 text-xs ${r.attending ? "bg-marinho text-papel-claro" : "bg-papel-escuro text-marinho"}`}
                >
                  {r.attending ? `Vai${r.companions ? ` +${r.companions}` : ""}` : "Não vai"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="titulo-serif text-xl text-marinho">{r.name}</p>
                  {r.companion_names && <p className="text-base whitespace-pre-line text-marinho">Com: {r.companion_names.replace(/\n+/g, ", ")}</p>}
                  {r.message && <p className="mt-0.5 text-base text-marinho italic">“{r.message}”</p>}
                  <p className="mt-0.5 text-sm text-azul">
                    {[r.phone, formatarDataHora(r.created_at)].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <button type="button" onClick={() => apagar(r)} aria-label={`Apagar resposta de ${r.name}`} className="flex h-11 w-11 shrink-0 items-center justify-center text-red-800">
                  <Icone nome="fechar" className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Bloco>
    </div>
  );
}
