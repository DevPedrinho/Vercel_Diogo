"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import type { Presente } from "@/lib/tipos";
import type { RecadoComPresente } from "@/lib/admin";
import { formatarDataHora, formatarPreco, linkSeguro, paraCampo, paraCentavos } from "@/lib/formato";
import { urlDoSite } from "@/lib/storage";
import { criarClienteNavegador } from "@/lib/supabase/cliente";
import { Botao } from "@/components/Botao";
import { Ajuda, Aviso, Bloco, Rotulo } from "@/components/Formulario";
import { Icone } from "@/components/Icones";
import { UploadImagem } from "@/components/UploadImagem";

const VAZIO = {
  title: "",
  description: "",
  category: "Casa e conforto",
  preco: "",
  image_path: "",
  image_url: "",
  gift_url: "",
};

const AVISO_DEMO = "Modo demonstração: conecte o Supabase para salvar as mudanças.";

export function PainelPresentes({
  presentes,
  recados,
  demo,
  planilha,
}: {
  presentes: Presente[];
  recados: RecadoComPresente[];
  demo: boolean;
  /** Com a planilha ligada, os presentes são editados nela, não aqui. */
  planilha: { link: string | null } | null;
}) {
  const router = useRouter();
  const [form, setForm] = useState(VAZIO);
  const [editando, setEditando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const categorias = useMemo(
    () => Array.from(new Set(["Cozinha", "Casa e conforto", "Momentos a dois", "Viagens e sonhos", "Cotas divertidas", ...presentes.map((p) => p.category)])),
    [presentes],
  );

  function limpar() {
    setForm(VAZIO);
    setEditando(null);
    setErro(null);
  }

  function editar(p: Presente) {
    setEditando(p.id);
    setErro(null);
    setOk(null);
    setForm({
      title: p.title,
      description: p.description ?? "",
      category: p.category,
      preco: paraCampo(p.price_cents),
      image_path: p.image_path ?? "",
      image_url: p.image_url ?? "",
      gift_url: p.gift_url ?? "",
    });
    document.getElementById("formulario")?.scrollIntoView({ behavior: "smooth" });
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setOk(null);

    if (!form.title.trim()) return setErro("Dê um nome ao presente.");
    if (form.gift_url.trim() && !linkSeguro(form.gift_url)) return setErro("O link do botão Presentear precisa começar com https://");
    if (form.image_url.trim() && !linkSeguro(form.image_url)) return setErro("O link da foto precisa começar com https://");
    const centavos = paraCentavos(form.preco);
    if (form.preco.trim() && centavos === null) return setErro("O valor precisa ser um número, como 250 ou 1.299,90.");
    if (demo) return setErro(AVISO_DEMO);

    setSalvando(true);
    const supabase = criarClienteNavegador();
    const dados = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category.trim() || "Casa e conforto",
      price_cents: centavos,
      image_path: form.image_path || null,
      image_url: form.image_url.trim() || null,
      gift_url: form.gift_url.trim() || null,
    };
    const ultimo = presentes.reduce((m, p) => Math.max(m, p.sort_order), 0);
    const { error } = editando
      ? await supabase.from("gifts").update(dados).eq("id", editando)
      : await supabase.from("gifts").insert({ ...dados, sort_order: ultimo + 1 });
    setSalvando(false);

    if (error) return setErro("Não foi possível salvar. Confira os dados e tente de novo.");
    setOk(editando ? "Presente atualizado!" : "Presente adicionado à lista!");
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

  const supabase = () => criarClienteNavegador();

  function alternarAtivo(p: Presente) {
    void executar(() => supabase().from("gifts").update({ is_active: !p.is_active }).eq("id", p.id));
  }

  function remover(p: Presente) {
    if (!confirm(`Remover "${p.title}" da lista? Isso não pode ser desfeito.`)) return;
    if (editando === p.id) limpar();
    void executar(() => supabase().from("gifts").delete().eq("id", p.id));
  }

  /** Troca a posição com o vizinho de cima ou de baixo. */
  function mover(indice: number, direcao: -1 | 1) {
    const a = presentes[indice];
    const b = presentes[indice + direcao];
    if (!a || !b) return;
    void executar(async () => {
      const cliente = supabase();
      // Posições iguais (itens antigos) viram distintas antes da troca.
      const ordemA = a.sort_order === b.sort_order ? indice : a.sort_order;
      const ordemB = a.sort_order === b.sort_order ? indice + direcao : b.sort_order;
      const r1 = await cliente.from("gifts").update({ sort_order: ordemB }).eq("id", a.id);
      if (r1.error) return r1;
      return cliente.from("gifts").update({ sort_order: ordemA }).eq("id", b.id);
    });
  }

  function apagarRecado(r: RecadoComPresente) {
    if (!confirm(`Apagar o recado de ${r.name}?`)) return;
    if (planilha) {
      setErro(null);
      void fetch("/api/admin/apagar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aba: "recados", id: r.id }),
      }).then((x) => {
        if (!x.ok) setErro("Não deu para apagar agora. Tente de novo.");
        router.refresh();
      });
      return;
    }
    void executar(() => supabase().from("gift_messages").delete().eq("id", r.id));
  }

  const fotoAtual = urlDoSite(form.image_path) ?? linkSeguro(form.image_url);

  return (
    <div className="space-y-10">
      {planilha ? (
        <Bloco titulo="Os presentes ficam na planilha" descricao="Para incluir, mudar, esconder ou pôr foto num presente, edite a aba Presentes. O site atualiza em até 1 minuto.">
          <ul className="space-y-2 text-base text-marinho">
            <li><strong className="font-medium">imagem</strong> — cole o link da foto. Serve link de loja ou de foto do Google Drive (compartilhada como “qualquer pessoa com o link”).</li>
            <li><strong className="font-medium">valor</strong> — só o número, como 450 ou 1250,50. Vazio = valor livre.</li>
            <li><strong className="font-medium">ativo</strong> — escreva “não” para esconder o presente sem apagar a linha.</li>
            <li><strong className="font-medium">link</strong> — opcional; vazio = o convidado só deixa o nome e um recado.</li>
          </ul>
          {erro && <div className="mt-4"><Aviso tipo="erro">{erro}</Aviso></div>}
          {planilha.link && (
            <a
              href={planilha.link}
              target="_blank"
              rel="noopener noreferrer"
              className="versalete titulo-serif mt-6 inline-flex min-h-11 items-center rounded-sm bg-marinho px-6 text-xs font-semibold text-papel-claro hover:bg-marinho-escuro"
            >
              Abrir a planilha
            </a>
          )}
        </Bloco>
      ) : (
      <Bloco id="formulario" titulo={editando ? "Editar presente" : "Adicionar presente"}>
        <form onSubmit={salvar} className="space-y-5">
          {erro && <Aviso tipo="erro">{erro}</Aviso>}
          {ok && <Aviso tipo="ok">{ok}</Aviso>}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Rotulo htmlFor="g-titulo">Nome do presente</Rotulo>
              <input
                id="g-titulo"
                className="campo"
                placeholder="Jogo de panelas"
                maxLength={120}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <Rotulo htmlFor="g-categoria">Categoria</Rotulo>
              <input
                id="g-categoria"
                list="categorias"
                className="campo"
                maxLength={40}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
              <datalist id="categorias">
                {categorias.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <Rotulo htmlFor="g-descricao">Descrição (opcional)</Rotulo>
            <textarea
              id="g-descricao"
              rows={2}
              maxLength={600}
              className="campo resize-y"
              placeholder="Uma frase carinhosa sobre o presente"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Rotulo htmlFor="g-preco">Valor em R$</Rotulo>
              <input
                id="g-preco"
                inputMode="decimal"
                className="campo"
                placeholder="450,00"
                value={form.preco}
                onChange={(e) => setForm({ ...form, preco: e.target.value })}
              />
              <Ajuda>Deixe vazio para “valor livre”.</Ajuda>
            </div>
            <div>
              <Rotulo htmlFor="g-link">Link de pagamento (opcional)</Rotulo>
              <input
                id="g-link"
                type="url"
                className="campo"
                placeholder="https://…"
                value={form.gift_url}
                onChange={(e) => setForm({ ...form, gift_url: e.target.value })}
              />
              <Ajuda>Vazio = o convidado só deixa o nome e um recado.</Ajuda>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <UploadImagem
              pasta="presentes"
              caminhoAtual={form.image_path || null}
              urlAtual={fotoAtual}
              aoEnviar={(caminho) => setForm((f) => ({ ...f, image_path: caminho, image_url: "" }))}
              aoRemover={() => setForm((f) => ({ ...f, image_path: "", image_url: "" }))}
              rotulo="Foto do presente"
              demo={demo}
            />
            <div>
              <Rotulo htmlFor="g-foto-url">…ou cole o link de uma foto</Rotulo>
              <input
                id="g-foto-url"
                type="url"
                className="campo"
                placeholder="https://loja.com/foto.jpg"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value, image_path: "" })}
              />
              <Ajuda>Sem foto, o cartão mostra o raminho da identidade visual.</Ajuda>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Botao type="submit" disabled={salvando}>
              {salvando ? "Salvando…" : editando ? "Salvar alterações" : "Adicionar presente"}
            </Botao>
            {editando && (
              <Botao type="button" variante="contorno" onClick={limpar}>
                Cancelar
              </Botao>
            )}
          </div>
        </form>
      </Bloco>
      )}

      <Bloco titulo="Presentes cadastrados" descricao={planilha ? "Como estão agora na planilha. No site, a lista aparece do menor para o maior valor." : "No site, a lista aparece do menor para o maior valor. As setas só desempatam presentes de mesmo valor."}>
        {presentes.length === 0 ? (
          <p className="text-base text-azul italic">Nenhum presente cadastrado ainda.</p>
        ) : (
          <ul className="space-y-3">
            {presentes.map((p, i) => {
              const foto = urlDoSite(p.image_path) ?? linkSeguro(p.image_url);
              return (
                <li
                  key={p.id}
                  className={`flex flex-wrap items-center gap-4 rounded-sm border border-ouro/25 bg-papel px-4 py-3 ${p.is_active ? "" : "opacity-55"}`}
                >
                  {!planilha && (
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => mover(i, -1)}
                      disabled={i === 0}
                      aria-label={`Subir ${p.title}`}
                      className="flex h-8 w-8 items-center justify-center text-marinho disabled:opacity-25"
                    >
                      <Icone nome="seta_cima" className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => mover(i, 1)}
                      disabled={i === presentes.length - 1}
                      aria-label={`Descer ${p.title}`}
                      className="flex h-8 w-8 items-center justify-center text-marinho disabled:opacity-25"
                    >
                      <Icone nome="seta_baixo" className="h-4 w-4" />
                    </button>
                  </div>
                  )}
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-sm border border-ouro/25 bg-nevoa">
                    {foto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={foto} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Icone nome="presente" className="m-auto mt-4 h-6 w-6 text-ouro-escuro" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="titulo-serif text-xl text-marinho">
                      {p.title}
                      <span className="versalete ml-3 text-[0.7rem] text-ouro-escuro">{p.category}</span>
                      {!p.is_active && <span className="ml-2 text-sm text-azul italic">(oculto)</span>}
                    </p>
                    <p className="truncate text-sm text-azul">
                      {formatarPreco(p.price_cents) ?? "Valor livre"} · {p.gift_url ?? "sem link"}
                    </p>
                  </div>
                  {!planilha && (
                  <div className="flex shrink-0 gap-1">
                    <button type="button" onClick={() => editar(p)} className="min-h-11 px-2 text-base text-marinho underline underline-offset-4">
                      Editar
                    </button>
                    <button type="button" onClick={() => alternarAtivo(p)} className="min-h-11 px-2 text-base text-azul underline underline-offset-4">
                      {p.is_active ? "Ocultar" : "Mostrar"}
                    </button>
                    <button type="button" onClick={() => remover(p)} className="min-h-11 px-2 text-base text-red-800 underline underline-offset-4">
                      Remover
                    </button>
                  </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Bloco>

      <Bloco id="recados" titulo="Recados de quem presenteou" descricao="Nome e recado deixados depois do clique em Presentear.">
        {recados.length === 0 ? (
          <p className="text-base text-azul italic">Nenhum recado ainda.</p>
        ) : (
          <ul className="divide-y divide-ouro/20">
            {recados.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-4 py-3">
                <div>
                  <p className="text-base text-marinho">
                    <strong className="font-medium">{r.name}</strong>
                    {r.gifts?.title && <span className="text-azul"> · {r.gifts.title}</span>}
                  </p>
                  {r.message && <p className="mt-0.5 text-base text-marinho italic">“{r.message}”</p>}
                  <p className="mt-0.5 text-sm text-azul">{formatarDataHora(r.created_at)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => apagarRecado(r)}
                  aria-label={`Apagar recado de ${r.name}`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center text-red-800"
                >
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
