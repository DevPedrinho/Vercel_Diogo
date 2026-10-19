"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { Presente } from "@/lib/tipos";
import { formatarPreco, linkSeguro } from "@/lib/formato";
import { urlDoSite } from "@/lib/storage";
import { criarClienteNavegador } from "@/lib/supabase/cliente";
import { Botao, BotaoExterno } from "@/components/Botao";
import { Coracao, Ramo } from "@/components/Ornamentos";

const TODOS = "Todos";

export type DadosPix = { chave: string; titular: string; banco: string };

export function ListaPresentes({
  presentes,
  obrigado,
  pix,
  salvarRecados,
}: {
  presentes: Presente[];
  obrigado: string;
  pix: DadosPix;
  /** false no modo demonstração: o recado não tem para onde ir. */
  salvarRecados: boolean;
}) {
  const categorias = useMemo(() => {
    const unicas = Array.from(new Set(presentes.map((p) => p.category))).sort((a, b) => a.localeCompare(b, "pt-BR"));
    return [TODOS, ...unicas];
  }, [presentes]);

  const [categoria, setCategoria] = useState(TODOS);
  const [escolhido, setEscolhido] = useState<Presente | null>(null);

  const visiveis = categoria === TODOS ? presentes : presentes.filter((p) => p.category === categoria);

  if (presentes.length === 0) {
    return (
      <p className="titulo-serif py-10 text-center text-2xl text-azul italic">
        A lista está sendo preparada com carinho. Volte em breve!
      </p>
    );
  }

  return (
    <>
      {categorias.length > 2 && (
        <div className="mb-12 flex flex-wrap items-center justify-center gap-2.5">
          {categorias.map((cat) => {
            const ativa = categoria === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoria(cat)}
                aria-pressed={ativa}
                className={`versalete titulo-serif inline-flex min-h-11 items-center rounded-full border px-5 text-xs font-semibold transition-colors ${
                  ativa ? "border-marinho bg-marinho text-papel-claro" : "border-ouro/50 text-marinho hover:border-marinho"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}

      <ul className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {visiveis.map((p) => (
          <Cartao key={p.id} presente={p} aoPresentear={() => setEscolhido(p)} />
        ))}
      </ul>

      {escolhido && (
        <Agradecimento
          presente={escolhido}
          obrigado={obrigado}
          pix={pix}
          salvarRecados={salvarRecados}
          aoFechar={() => setEscolhido(null)}
        />
      )}
    </>
  );
}

function Foto({ presente }: { presente: Presente }) {
  const imagem = urlDoSite(presente.image_path) ?? linkSeguro(presente.image_url);
  if (imagem) {
    return (
      <Image
        src={imagem}
        alt={presente.title}
        fill
        sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 90vw"
        className="object-cover"
      />
    );
  }
  // Sem foto, o raminho da IDV ocupa o espaço — com um giro diferente por
  // item, para a lista não virar papel de parede.
  const semente = presente.id.charCodeAt(0) + presente.id.charCodeAt(presente.id.length - 1);
  return (
    <div className="flex h-full items-center justify-center bg-linear-to-br from-nevoa to-papel-escuro">
      <Ramo
        espelhado={semente % 2 === 1}
        className="w-1/2 opacity-90"
      />
    </div>
  );
}

function Cartao({ presente, aoPresentear }: { presente: Presente; aoPresentear: () => void }) {
  const preco = formatarPreco(presente.price_cents);
  const destino = linkSeguro(presente.gift_url);

  return (
    <li className="group flex flex-col overflow-hidden border border-ouro/35 bg-papel transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-4/3 w-full overflow-hidden">
        <Foto presente={presente} />
        <span className="versalete absolute top-4 left-0 bg-marinho/90 px-3.5 py-1.5 text-[0.7rem] text-papel-claro">
          {presente.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6 text-center">
        <h3 className="titulo-serif text-2xl text-marinho">{presente.title}</h3>
        {presente.description && <p className="mt-2 text-base leading-relaxed text-azul">{presente.description}</p>}
        <p className="titulo-serif mt-4 mb-6 text-3xl text-ouro-escuro tabular-nums lining-nums">
          {preco ?? <span className="text-2xl italic">Valor livre</span>}
        </p>
        <div className="mt-auto">
          {destino ? (
            <BotaoExterno href={destino} onClick={aoPresentear} className="w-full">
              <Coracao cheio className="w-3.5" />
              Presentear
            </BotaoExterno>
          ) : (
            // Sem link próprio: o PIX do casal abre na janela de presentear.
            <Botao type="button" onClick={aoPresentear} className="w-full">
              <Coracao cheio className="w-3.5" />
              Presentear
            </Botao>
          )}
        </div>
      </div>
    </li>
  );
}

/**
 * Abre junto com o link de pagamento (nunca antes: o presente é mais
 * importante que o recado). Pede o nome para os noivos saberem a quem
 * agradecer — tudo opcional.
 */
function Agradecimento({
  presente,
  obrigado,
  pix,
  salvarRecados,
  aoFechar,
}: {
  presente: Presente;
  obrigado: string;
  pix: DadosPix;
  salvarRecados: boolean;
  aoFechar: () => void;
}) {
  const [nome, setNome] = useState("");
  const [recado, setRecado] = useState("");
  const [estado, setEstado] = useState<"aberto" | "enviando" | "enviado" | "erro">("aberto");
  const primeiroCampo = useRef<HTMLInputElement>(null);
  const porPix = !linkSeguro(presente.gift_url);
  const [copiado, setCopiado] = useState(false);

  async function copiarChave() {
    try {
      await navigator.clipboard.writeText(pix.chave);
    } catch {
      // Navegador sem permissão de área de transferência: a chave segue
      // selecionável na tela.
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  }

  useEffect(() => {
    if (!porPix) primeiroCampo.current?.focus();
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && aoFechar();
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aoFechar]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;
    setEstado("enviando");
    const supabase = criarClienteNavegador();
    const { error } = await supabase.from("gift_messages").insert({
      gift_id: presente.id,
      name: nome.trim().slice(0, 80),
      message: recado.trim().slice(0, 500) || null,
    });
    setEstado(error ? "erro" : "enviado");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-marinho-escuro/55 sm:items-center sm:p-5" onClick={aoFechar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-obrigado"
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[94vh] w-full max-w-md overflow-y-auto border border-ouro/40 bg-papel-claro px-7 pt-10 pb-[max(2rem,env(safe-area-inset-bottom))] text-center shadow-2xl sm:pb-9"
      >
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar"
          className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center text-marinho"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <Coracao cheio className="mx-auto w-6 text-ouro" />
        <h2 id="titulo-obrigado" className="script mt-3 text-5xl text-marinho">
          {porPix ? presente.title : "Obrigado!"}
        </h2>
        {porPix ? (
          <div className="mt-4">
            {presente.price_cents !== null && (
              <p className="titulo-serif text-4xl text-ouro-escuro tabular-nums lining-nums">{formatarPreco(presente.price_cents)}</p>
            )}
            {pix.chave ? (
              <div className="mt-5 border border-ouro/40 bg-papel px-4 py-4">
                <p className="versalete titulo-serif text-[0.7rem] font-semibold text-ouro-escuro">Chave PIX</p>
                <p className="mt-1 text-lg break-all text-marinho select-all">{pix.chave}</p>
                {(pix.titular || pix.banco) && (
                  <p className="mt-1 text-sm text-azul">{[pix.titular, pix.banco].filter(Boolean).join(" · ")}</p>
                )}
                <Botao type="button" variante="contorno" onClick={copiarChave} className="mt-4 w-full">
                  {copiado ? "Chave copiada!" : "Copiar chave PIX"}
                </Botao>
              </div>
            ) : (
              <p className="mt-5 border border-ouro/40 bg-papel px-4 py-4 text-base text-marinho">
                A chave PIX dos noivos será informada aqui em breve. 💙
              </p>
            )}
            <p className="mt-4 text-sm text-azul">
              No app do seu banco, escolha PIX, cole a chave e informe o valor.
            </p>
          </div>
        ) : (
          <p className="mt-2 text-base text-marinho">{obrigado}</p>
        )}

        {estado === "enviado" ? (
          <p className="titulo-serif mt-8 text-xl text-marinho italic">Recado entregue aos noivos. 💙</p>
        ) : !salvarRecados ? null : (
          <form onSubmit={enviar} className="mt-7 space-y-4 text-left">
            <p className="text-center text-sm text-azul">
              {porPix ? (
                <>Depois do PIX, deixe seu nome para a gente saber de quem veio o carinho:</>
              ) : (
                <>
                  O pagamento de <strong className="font-medium text-marinho">{presente.title}</strong> abriu em outra aba.
                  Quer deixar seu nome para a gente agradecer?
                </>
              )}
            </p>
            <input
              ref={primeiroCampo}
              className="campo"
              placeholder="Seu nome"
              maxLength={80}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
            <textarea
              className="campo resize-none"
              rows={3}
              placeholder="Um recado para os noivos (opcional)"
              maxLength={500}
              value={recado}
              onChange={(e) => setRecado(e.target.value)}
            />
            {estado === "erro" && <p className="text-sm text-red-800">Não deu para enviar agora. Tente de novo.</p>}
            <Botao type="submit" disabled={estado === "enviando" || !nome.trim()} className="w-full">
              {estado === "enviando" ? "Enviando…" : "Enviar recado"}
            </Botao>
          </form>
        )}
      </div>
    </div>
  );
}
