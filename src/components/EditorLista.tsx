"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { urlDoSite } from "@/lib/storage";
import { criarClienteNavegador } from "@/lib/supabase/cliente";
import { Botao } from "@/components/Botao";
import { Ajuda, Aviso, Bloco, Rotulo } from "@/components/Formulario";
import { Icone } from "@/components/Icones";
import { UploadImagem } from "@/components/UploadImagem";

/**
 * Cadastro genérico de uma lista ordenada do painel (capítulos da história,
 * padrinhos): formulário em cima, lista com setas de ordem embaixo.
 */

export type CampoLista = {
  chave: string;
  rotulo: string;
  tipo?: "linha" | "paragrafo" | "imagem" | "escolha";
  opcoes?: { valor: string; rotulo: string }[];
  placeholder?: string;
  ajuda?: string;
  obrigatorio?: boolean;
  max?: number;
  /** Ocupa as duas colunas do formulário. */
  largo?: boolean;
};

type Item = { id: string; sort_order: number; image_path?: string | null } & Record<string, unknown>;

const AVISO_DEMO = "Modo demonstração: conecte o Supabase para salvar as mudanças.";

export function EditorLista({
  tabela,
  itens,
  campos,
  novo,
  pasta,
  nomeItem,
  titulo,
  resumo,
  demo,
}: {
  tabela: string;
  itens: Item[];
  campos: CampoLista[];
  /** Valores iniciais de um item novo. */
  novo: Record<string, string>;
  /** Pasta das fotos no bucket. */
  pasta: string;
  /** "capítulo", "padrinho" — usado nos botões e avisos. */
  nomeItem: string;
  titulo: string;
  resumo: (item: Item) => { principal: string; detalhe?: string };
  demo: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>(novo);
  const [editando, setEditando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const cliente = () => criarClienteNavegador();

  function limpar() {
    setForm(novo);
    setEditando(null);
    setErro(null);
  }

  function editar(item: Item) {
    setEditando(item.id);
    setErro(null);
    setOk(null);
    setForm(Object.fromEntries(campos.map((c) => [c.chave, String(item[c.chave] ?? "")])));
    document.getElementById("formulario")?.scrollIntoView({ behavior: "smooth" });
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setOk(null);
    for (const c of campos) {
      if (c.obrigatorio && !form[c.chave]?.trim()) return setErro(`Preencha “${c.rotulo}”.`);
    }
    if (demo) return setErro(AVISO_DEMO);

    const dados = Object.fromEntries(campos.map((c) => [c.chave, form[c.chave]?.trim() || null]));
    const ultimo = itens.reduce((m, i) => Math.max(m, i.sort_order), 0);
    setSalvando(true);
    const { error } = editando
      ? await cliente().from(tabela).update(dados).eq("id", editando)
      : await cliente().from(tabela).insert({ ...dados, sort_order: ultimo + 1 });
    setSalvando(false);
    if (error) return setErro("Não foi possível salvar. Confira os dados e tente de novo.");
    setOk(editando ? "Alterações salvas!" : `${nomeItem[0].toUpperCase()}${nomeItem.slice(1)} adicionado!`);
    limpar();
    router.refresh();
  }

  async function executar(acao: () => PromiseLike<{ error: unknown }>) {
    setErro(null);
    setOk(null);
    if (demo) return setErro(AVISO_DEMO);
    const { error } = await acao();
    if (error) setErro("Não deu certo agora. Tente de novo.");
    router.refresh();
  }

  function mover(i: number, direcao: -1 | 1) {
    const a = itens[i];
    const b = itens[i + direcao];
    if (!a || !b) return;
    void executar(async () => {
      const ordemA = a.sort_order === b.sort_order ? i : a.sort_order;
      const ordemB = a.sort_order === b.sort_order ? i + direcao : b.sort_order;
      const r = await cliente().from(tabela).update({ sort_order: ordemB }).eq("id", a.id);
      if (r.error) return r;
      return cliente().from(tabela).update({ sort_order: ordemA }).eq("id", b.id);
    });
  }

  function remover(item: Item) {
    if (!confirm(`Remover “${resumo(item).principal}”? Isso não pode ser desfeito.`)) return;
    if (editando === item.id) limpar();
    void executar(() => cliente().from(tabela).delete().eq("id", item.id));
  }

  return (
    <div className="space-y-10">
      <Bloco id="formulario" titulo={editando ? `Editar ${nomeItem}` : `Adicionar ${nomeItem}`}>
        <form onSubmit={salvar} className="space-y-5">
          {erro && <Aviso tipo="erro">{erro}</Aviso>}
          {ok && <Aviso tipo="ok">{ok}</Aviso>}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {campos.map((c) => {
              const id = `l-${c.chave}`;
              const valor = form[c.chave] ?? "";
              const mudar = (v: string) => setForm((f) => ({ ...f, [c.chave]: v }));
              return (
                <div key={c.chave} className={c.largo || c.tipo === "paragrafo" ? "sm:col-span-2" : ""}>
                  {c.tipo === "imagem" ? (
                    <UploadImagem
                      pasta={pasta}
                      caminhoAtual={valor || null}
                      urlAtual={urlDoSite(valor)}
                      aoEnviar={mudar}
                      aoRemover={() => mudar("")}
                      rotulo={c.rotulo}
                      demo={demo}
                    />
                  ) : (
                    <>
                      <Rotulo htmlFor={id}>{c.rotulo}</Rotulo>
                      {c.tipo === "paragrafo" ? (
                        <textarea id={id} rows={4} maxLength={c.max} className="campo resize-y" placeholder={c.placeholder} value={valor} onChange={(e) => mudar(e.target.value)} />
                      ) : c.tipo === "escolha" ? (
                        <select id={id} className="campo" value={valor} onChange={(e) => mudar(e.target.value)}>
                          {c.opcoes?.map((o) => (
                            <option key={o.valor} value={o.valor}>
                              {o.rotulo}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input id={id} className="campo" maxLength={c.max} placeholder={c.placeholder} value={valor} onChange={(e) => mudar(e.target.value)} />
                      )}
                    </>
                  )}
                  {c.ajuda && <Ajuda>{c.ajuda}</Ajuda>}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Botao type="submit" disabled={salvando}>
              {salvando ? "Salvando…" : editando ? "Salvar alterações" : `Adicionar ${nomeItem}`}
            </Botao>
            {editando && (
              <Botao type="button" variante="contorno" onClick={limpar}>
                Cancelar
              </Botao>
            )}
          </div>
        </form>
      </Bloco>

      <Bloco titulo={titulo} descricao="Use as setas para mudar a ordem em que aparecem no site.">
        {itens.length === 0 ? (
          <p className="text-base text-azul italic">Nada cadastrado ainda.</p>
        ) : (
          <ul className="space-y-3">
            {itens.map((item, i) => {
              const { principal, detalhe } = resumo(item);
              const foto = urlDoSite(item.image_path ?? null);
              return (
                <li key={item.id} className="flex flex-wrap items-center gap-4 rounded-sm border border-ouro/25 bg-papel px-4 py-3">
                  <div className="flex flex-col">
                    <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} aria-label={`Subir ${principal}`} className="flex h-8 w-8 items-center justify-center text-marinho disabled:opacity-25">
                      <Icone nome="seta_cima" className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => mover(i, 1)} disabled={i === itens.length - 1} aria-label={`Descer ${principal}`} className="flex h-8 w-8 items-center justify-center text-marinho disabled:opacity-25">
                      <Icone nome="seta_baixo" className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-ouro/30 bg-nevoa">
                    {foto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={foto} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Icone nome="imagem" className="h-5 w-5 text-ouro-escuro" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="titulo-serif text-xl text-marinho">{principal}</p>
                    {detalhe && <p className="truncate text-sm text-azul">{detalhe}</p>}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button type="button" onClick={() => editar(item)} className="min-h-11 px-2 text-base text-marinho underline underline-offset-4">
                      Editar
                    </button>
                    <button type="button" onClick={() => remover(item)} className="min-h-11 px-2 text-base text-red-800 underline underline-offset-4">
                      Remover
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Bloco>
    </div>
  );
}
