"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { criarClienteNavegador } from "@/lib/supabase/cliente";
import type { ConvitePublico, OpcaoConvite } from "@/lib/convidados";
import { formatarDataHora } from "@/lib/formato";
import { Botao } from "@/components/Botao";
import { Ajuda, Aviso, Rotulo } from "@/components/Formulario";
import { Coracao, Divisor } from "@/components/Ornamentos";

const MAX_ACOMPANHANTES = 6;

const pareceTelefone = (v: string) => v.replace(/\D/g, "").length >= 8;

/** ["Ana", "Bia", "Caio"] → "Ana, Bia e Caio". */
const juntarNomes = (nomes: string[]) =>
  nomes.length < 2 ? nomes.join("") : `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;

export function FormConfirmacao({
  aberto,
  prazo,
  encerrado,
  whatsapp,
  dataExtenso,
  fonte,
  temLista,
  conviteInicial,
}: {
  aberto: boolean;
  prazo: string | null;
  encerrado: string;
  whatsapp: string | null;
  dataExtenso: string;
  /** Onde a resposta é guardada; null = ainda não há onde. */
  fonte: "planilha" | "supabase" | null;
  /** Há lista de convidados na planilha: começa pela busca do convite. */
  temLista: boolean;
  /** Convite aberto pelo link pessoal (/confirmar?convite=CODIGO). */
  conviteInicial: ConvitePublico | null;
}) {
  const [etapa, setEtapa] = useState<"busca" | "form">(conviteInicial || !temLista ? "form" : "busca");
  const [convite, setConvite] = useState<ConvitePublico | null>(conviteInicial);
  const [busca, setBusca] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [avisoBusca, setAvisoBusca] = useState<string | null>(null);
  const [opcoes, setOpcoes] = useState<OpcaoConvite[] | null>(null);

  const [nome, setNome] = useState("");
  const [vai, setVai] = useState<"sim" | "nao" | null>(null);
  const [acompanhantes, setAcompanhantes] = useState(0);
  const [nomesAcomp, setNomesAcomp] = useState("");
  const [telefone, setTelefone] = useState("");
  const [recado, setRecado] = useState("");
  const [estado, setEstado] = useState<"aberto" | "enviando" | "enviado">("aberto");
  const [erro, setErro] = useState<string | null>(null);
  // Campo invisível: gente não vê nem preenche; robô de formulário preenche.
  const [armadilha, setArmadilha] = useState("");

  // O convite já traz quem vem junto: o formulário nasce preenchido.
  const [preenchido, setPreenchido] = useState<string | null>(null);
  if (convite && preenchido !== convite.id) {
    setPreenchido(convite.id);
    setNome(convite.nome);
    const anterior = convite.respostaAnterior;
    const qtd = anterior?.vai ? anterior.acompanhantes : (convite.acompanhantes ?? 0);
    setAcompanhantes(qtd);
    setNomesAcomp(convite.nomesAcompanhantes.join("\n"));
  }

  const maxAcomp = convite?.acompanhantes ?? MAX_ACOMPANHANTES;

  async function procurar(e: FormEvent) {
    e.preventDefault();
    setAvisoBusca(null);
    const termo = busca.trim();
    setOpcoes(null);
    if (!pareceTelefone(termo) && termo.replace(/[^\p{L}]/gu, "").length < 2) {
      return setAvisoBusca("Escreva seu nome ou o seu WhatsApp com DDD.");
    }
    setBuscando(true);
    try {
      const resposta = await fetch("/api/convite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ busca: termo }),
      });
      const json = (await resposta.json().catch(() => ({}))) as {
        status?: string;
        convite?: ConvitePublico;
        opcoes?: OpcaoConvite[];
        erro?: string;
      };
      if (json.status === "achou" && json.convite) {
        setConvite(json.convite);
        setEtapa("form");
      } else if (json.status === "opcoes" && json.opcoes?.length) {
        setOpcoes(json.opcoes);
      } else if (json.status === "ambiguo") {
        setAvisoBusca("Encontramos muitos convites com esse nome. Escreva também o sobrenome ou o seu WhatsApp com DDD.");
      } else if (json.status === "nao_achou") {
        // Fora da lista não impede ninguém: segue para o formulário em branco.
        setConvite(null);
        setNome(pareceTelefone(termo) ? "" : termo);
        if (pareceTelefone(termo)) setTelefone(termo);
        setErro(null);
        setEtapa("form");
        setAvisoBusca("nao_achou");
      } else {
        setAvisoBusca(json.erro || "Não deu para procurar agora. Tente de novo em instantes.");
      }
    } catch {
      setAvisoBusca("Não deu para procurar agora. Confira a conexão e tente de novo.");
    } finally {
      setBuscando(false);
    }
  }

  /** Abre o convite que a pessoa escolheu entre os de mesmo nome. */
  async function escolher(id: string) {
    setAvisoBusca(null);
    setBuscando(true);
    try {
      const resposta = await fetch("/api/convite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: id }),
      });
      const json = (await resposta.json().catch(() => ({}))) as { status?: string; convite?: ConvitePublico };
      if (json.status === "achou" && json.convite) {
        setOpcoes(null);
        setConvite(json.convite);
        setEtapa("form");
      } else {
        setAvisoBusca("Não deu para abrir esse convite agora. Tente de novo em instantes.");
      }
    } catch {
      setAvisoBusca("Não deu para abrir esse convite agora. Confira a conexão e tente de novo.");
    } finally {
      setBuscando(false);
    }
  }

  function buscarDeNovo() {
    setOpcoes(null);
    setConvite(null);
    setPreenchido(null);
    setNome("");
    setVai(null);
    setAcompanhantes(0);
    setNomesAcomp("");
    setTelefone("");
    setErro(null);
    setAvisoBusca(null);
    setEtapa("busca");
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    if (nome.trim().length < 2) return setErro("Escreva seu nome completo.");
    if (!vai) return setErro("Conte pra gente se você vai.");
    if (vai === "sim" && acompanhantes > 0 && !nomesAcomp.trim()) return setErro("Escreva o nome de quem vem com você.");
    if (!fonte) return setErro("As confirmações abrem em instantes. Tente de novo mais tarde, por favor.");

    setEstado("enviando");
    const qtd = vai === "sim" ? acompanhantes : 0;
    let falha: string | null = null;
    if (fonte === "planilha") {
      try {
        const resposta = await fetch("/api/confirmar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: nome.trim(),
            convite: convite?.id ?? null,
            vai: vai === "sim",
            acompanhantes: qtd,
            nomesAcompanhantes: qtd > 0 ? nomesAcomp.trim() : "",
            whatsapp: telefone.trim(),
            recado: recado.trim(),
            site: armadilha,
          }),
        });
        const json = (await resposta.json().catch(() => ({}))) as { ok?: boolean; erro?: string };
        if (!json.ok) falha = json.erro || "Não deu para enviar agora. Tente de novo em instantes.";
      } catch {
        falha = "Não deu para enviar agora. Confira a conexão e tente de novo.";
      }
    } else {
      const { error } = await criarClienteNavegador()
        .from("rsvps")
        .insert({
          name: nome.trim().slice(0, 120),
          attending: vai === "sim",
          companions: qtd,
          companion_names: qtd > 0 ? nomesAcomp.trim().slice(0, 600) : null,
          phone: telefone.trim().slice(0, 30) || null,
          message: recado.trim().slice(0, 600) || null,
        });
      if (error) falha = "Não deu para enviar agora. Confira a conexão e tente de novo.";
    }
    if (falha) {
      setEstado("aberto");
      return setErro(falha);
    }
    setEstado("enviado");
  }

  const cartao = "mx-auto max-w-xl border border-ouro/40 bg-papel px-6 py-10 shadow-[0_20px_60px_-35px_rgba(27,43,63,0.45)] sm:px-10";

  if (!aberto) {
    return (
      <div className={`${cartao} text-center`}>
        <p className="script text-5xl text-marinho">Confirmações encerradas</p>
        <Divisor className="mt-5" />
        <p className="mt-5 text-lg text-marinho">{encerrado}</p>
        {whatsapp && (
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 items-center text-base text-azul underline underline-offset-4">
            Falar com os noivos
          </a>
        )}
      </div>
    );
  }

  if (estado === "enviado") {
    return (
      <div className={`${cartao} text-center`}>
        <Coracao cheio className="bater mx-auto w-7 text-ouro" />
        <p className="script mt-3 text-6xl text-marinho">{vai === "sim" ? "Te esperamos!" : "Obrigado por avisar"}</p>
        <Divisor className="mt-5" />
        <p className="mt-5 text-lg text-marinho">
          {vai === "sim"
            ? `Sua presença está confirmada${acompanhantes > 0 ? ` com mais ${acompanhantes}` : ""}. Nos vemos em ${dataExtenso}!`
            : "Vamos sentir sua falta — obrigado pelo carinho de responder."}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/presentes" className="text-base text-azul underline underline-offset-4">
            Ver a lista de presentes
          </Link>
        </div>
      </div>
    );
  }

  if (etapa === "busca") {
    return (
      <form onSubmit={procurar} className={`${cartao} space-y-7`}>
        {prazo && (
          <p className="versalete titulo-serif text-center text-xs font-semibold text-ouro-escuro">
            Confirme até {prazo}
          </p>
        )}
        <div className="text-center">
          <p className="script text-5xl text-marinho">Encontre seu convite</p>
          <Divisor className="mt-4" />
          <p className="mt-4 text-lg text-marinho">Digite seu nome ou seu WhatsApp. Seu convite já vem preenchido, é só dizer se vai.</p>
        </div>
        <div>
          <Rotulo htmlFor="r-busca">Seu nome ou WhatsApp</Rotulo>
          <input
            id="r-busca"
            className="campo"
            autoComplete="name"
            maxLength={120}
            placeholder="Ex.: Maria ou (85) 9 9999-9999"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setOpcoes(null);
            }}
          />
        </div>
        {opcoes && (
          <div>
            <p className="text-center text-base text-marinho">Encontramos {opcoes.length} convites com esse nome. Qual é o seu?</p>
            <ul className="mt-4 space-y-3">
              {opcoes.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => escolher(o.id)}
                    disabled={buscando}
                    className="w-full border border-ouro/50 bg-papel-claro px-5 py-4 text-left transition-colors hover:border-marinho focus-visible:border-marinho disabled:opacity-60"
                  >
                    <span className="titulo-serif block text-2xl text-marinho">{o.nome}</span>
                    <span className="mt-1 block text-base text-azul">
                      {o.acompanhantes.length ? `Com ${juntarNomes(o.acompanhantes)}` : "Convite individual"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {avisoBusca && <Aviso tipo="info">{avisoBusca}</Aviso>}
        <Botao type="submit" disabled={buscando} className="w-full">
          {buscando ? "Procurando…" : "Encontrar meu convite"}
        </Botao>
        <p className="text-center">
          <button
            type="button"
            onClick={() => {
              setAvisoBusca(null);
              setEtapa("form");
            }}
            className="min-h-11 text-base text-azul underline underline-offset-4"
          >
            Prefiro preencher meus dados
          </button>
        </p>
      </form>
    );
  }

  const primeiroNome = convite?.nome.split(/\s+/)[0] ?? "";
  const anterior = convite?.respostaAnterior ?? null;

  return (
    <form onSubmit={enviar} className={`${cartao} relative space-y-7`}>
      {prazo && (
        <p className="versalete titulo-serif text-center text-xs font-semibold text-ouro-escuro">
          Confirme até {prazo}
        </p>
      )}

      {convite ? (
        <div className="text-center">
          <p className="script text-5xl text-marinho">Olá, {primeiroNome}!</p>
          <Divisor className="mt-4" />
          <p className="mt-4 text-lg text-marinho">
            Encontramos seu convite
            {convite.acompanhantes === null
              ? "."
              : convite.acompanhantes === 0
                ? ": ele é individual."
                : `: ele vale para você e mais ${convite.acompanhantes === 1 ? "1 pessoa" : `${convite.acompanhantes} pessoas`}.`}
          </p>
          <p className="titulo-serif mt-3 text-xl text-marinho">{convite.nome}</p>
          {convite.nomesAcompanhantes.length > 0 && (
            <p className="mt-1 text-lg text-azul">Com {juntarNomes(convite.nomesAcompanhantes)}</p>
          )}
          {temLista && (
            <button type="button" onClick={buscarDeNovo} className="mt-1 min-h-11 text-base text-azul underline underline-offset-4">
              Não é você? Buscar de novo
            </button>
          )}
          {anterior && (
            <div className="mt-4 text-left">
              <Aviso tipo="info">
                Você já respondeu {anterior.vai ? "que vai" : "que não vai"}
                {anterior.data && !Number.isNaN(new Date(anterior.data).getTime()) ? ` em ${formatarDataHora(anterior.data).split(" ")[0].replace(",", "")}` : ""}. Se mudou de ideia, é só responder de novo.
              </Aviso>
            </div>
          )}
        </div>
      ) : (
        <>
          {avisoBusca === "nao_achou" && (
            <Aviso tipo="info">Não encontramos esse nome na lista, mas tudo bem: preencha abaixo que a resposta chega aos noivos.</Aviso>
          )}
          <div>
            <Rotulo htmlFor="r-nome">Seu nome completo</Rotulo>
            <input id="r-nome" className="campo" autoComplete="name" maxLength={120} value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
        </>
      )}

      <fieldset>
        <legend className="versalete titulo-serif mb-3 block text-[0.72rem] font-semibold text-ouro-escuro">Você vai?</legend>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { valor: "sim", texto: "Sim, estarei lá!" },
              { valor: "nao", texto: "Não poderei ir" },
            ] as const
          ).map((o) => (
            <label
              key={o.valor}
              className={`flex min-h-14 cursor-pointer items-center justify-center rounded-sm border px-3 text-center text-lg transition-colors ${
                vai === o.valor ? "border-marinho bg-marinho text-papel-claro" : "border-ouro/50 bg-papel-claro text-marinho hover:border-marinho"
              }`}
            >
              <input type="radio" name="vai" value={o.valor} checked={vai === o.valor} onChange={() => setVai(o.valor)} className="sr-only" />
              {o.texto}
            </label>
          ))}
        </div>
      </fieldset>

      {vai === "sim" && maxAcomp > 0 && (
        <div className="space-y-5">
          <div>
            <Rotulo htmlFor="r-acomp">Quantas pessoas vêm com você?</Rotulo>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setAcompanhantes((n) => Math.max(0, n - 1))}
                aria-label="Menos um acompanhante"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-ouro/50 text-xl text-marinho"
              >
                −
              </button>
              <output id="r-acomp" className="titulo-serif w-10 text-center text-3xl text-marinho tabular-nums">
                {acompanhantes}
              </output>
              <button
                type="button"
                onClick={() => setAcompanhantes((n) => Math.min(maxAcomp, n + 1))}
                aria-label="Mais um acompanhante"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-ouro/50 text-xl text-marinho"
              >
                +
              </button>
            </div>
            <Ajuda>
              {convite?.acompanhantes != null
                ? `Seu convite inclui até ${convite.acompanhantes === 1 ? "1 acompanhante" : `${convite.acompanhantes} acompanhantes`}.`
                : "Conte só quem está incluído no seu convite."}
            </Ajuda>
          </div>
          {acompanhantes > 0 && (
            <div>
              <Rotulo htmlFor="r-nomes">Nome de quem vem com você</Rotulo>
              <textarea
                id="r-nomes"
                rows={Math.min(6, acompanhantes + 1)}
                className="campo resize-y"
                placeholder="Um nome por linha"
                maxLength={600}
                value={nomesAcomp}
                onChange={(e) => setNomesAcomp(e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {!convite?.temWhatsapp && (
        <div>
          <Rotulo htmlFor="r-tel">WhatsApp (opcional)</Rotulo>
          <input id="r-tel" type="tel" inputMode="tel" autoComplete="tel" className="campo" placeholder="(85) 9 9999-9999" maxLength={30} value={telefone} onChange={(e) => setTelefone(e.target.value)} />
        </div>
      )}

      <div>
        <Rotulo htmlFor="r-recado">Um recado para os noivos (opcional)</Rotulo>
        <textarea id="r-recado" rows={3} className="campo resize-y" maxLength={600} value={recado} onChange={(e) => setRecado(e.target.value)} />
      </div>

      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Site
          <input tabIndex={-1} autoComplete="off" value={armadilha} onChange={(e) => setArmadilha(e.target.value)} />
        </label>
      </div>

      {erro && <Aviso tipo="erro">{erro}</Aviso>}

      <Botao type="submit" disabled={estado === "enviando"} className="w-full">
        {estado === "enviando" ? "Enviando…" : anterior ? "Atualizar minha resposta" : "Enviar confirmação"}
      </Botao>

      {!convite && temLista && (
        <p className="text-center">
          <button type="button" onClick={buscarDeNovo} className="min-h-11 text-base text-azul underline underline-offset-4">
            Buscar meu convite pelo nome
          </button>
        </p>
      )}
    </form>
  );
}
