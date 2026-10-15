import Link from "next/link";
import { carregarCasamento, carregarHistoria, carregarMusica, carregarPadrinhos, carregarPresentes } from "@/lib/conteudo";
import { carregarRecados } from "@/lib/admin";
import { formatarDataHora } from "@/lib/formato";
import { TituloPagina } from "@/components/Formulario";
import { Icone, type NomeIcone } from "@/components/Icones";

export default async function PainelInicio() {
  const [c, presentes, musica, recados, historia, padrinhos] = await Promise.all([
    carregarCasamento(),
    carregarPresentes({ todos: true }),
    carregarMusica(),
    carregarRecados(5),
    carregarHistoria(),
    carregarPadrinhos(),
  ]);
  const ativos = presentes.filter((p) => p.is_active).length;
  const dias = Math.max(0, Math.ceil((new Date(c.dataISO).getTime() - Date.now()) / 86_400_000));
  const temMusica = musica.enabled && (musica.file_path || musica.title === "Melodia de teste");

  const cartoes: { href: string; icone: NomeIcone; titulo: string; numero: string; texto: string }[] = [
    {
      href: "/admin/presentes",
      icone: "presente",
      titulo: "Presentes",
      numero: String(ativos),
      texto: `${ativos === 1 ? "item visível" : "itens visíveis"} na lista${presentes.length > ativos ? ` · ${presentes.length - ativos} oculto(s)` : ""}`,
    },
    {
      href: "/admin/historia",
      icone: "coracao",
      titulo: "Nossa história",
      numero: String(historia.length),
      texto: historia.length === 1 ? "capítulo na linha do tempo" : "capítulos na linha do tempo",
    },
    {
      href: "/admin/padrinhos",
      icone: "pessoas",
      titulo: "Padrinhos",
      numero: String(padrinhos.length),
      texto: `${padrinhos.filter((p) => p.side === "noiva").length} da noiva · ${padrinhos.filter((p) => p.side === "noivo").length} do noivo`,
    },
    {
      href: "/admin/musica",
      icone: "musica",
      titulo: "Música",
      numero: temMusica ? "♪" : "—",
      texto: temMusica ? (musica.title ?? "Música tocando no site") : "Nenhuma música tocando",
    },
    {
      href: "/admin/textos",
      icone: "texto",
      titulo: "Textos do site",
      numero: "Aa",
      texto: "Nomes, data, locais, convite, dress code",
    },
  ];

  return (
    <>
      <TituloPagina sobretitulo={`${c.noiva} & ${c.noivo}`} titulo="Olá, noivos!">
        Faltam <strong className="font-medium text-marinho">{dias} dias</strong> para {c.dataExtenso}. Daqui vocês
        cuidam de tudo o que aparece no site.
      </TituloPagina>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {cartoes.map((k) => (
          <Link
            key={k.href}
            href={k.href}
            className="group rounded-sm border border-ouro/30 bg-papel-claro p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-marinho/40 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="versalete titulo-serif text-xs font-semibold text-ouro-escuro">{k.titulo}</span>
              <Icone nome={k.icone} className="h-5 w-5 text-ouro-escuro" />
            </div>
            <p className="titulo-serif mt-4 text-5xl text-marinho">{k.numero}</p>
            <p className="mt-2 text-base text-azul">{k.texto}</p>
            <p className="versalete titulo-serif mt-5 text-[0.7rem] font-semibold text-marinho group-hover:underline">Editar →</p>
          </Link>
        ))}
      </div>

      <section className="mt-10 rounded-sm border border-ouro/30 bg-papel-claro p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="titulo-serif text-2xl text-marinho">Últimos recados</h2>
          <Link href="/admin/presentes#recados" className="text-sm text-azul underline underline-offset-4">
            Ver todos
          </Link>
        </div>
        {recados.length === 0 ? (
          <p className="mt-4 text-base text-azul italic">
            Quando alguém presentear e deixar o nome, o recado aparece aqui para vocês agradecerem.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-ouro/20">
            {recados.map((r) => (
              <li key={r.id} className="py-3">
                <p className="text-base text-marinho">
                  <strong className="font-medium">{r.name}</strong>
                  {r.gifts?.title && <span className="text-azul"> · {r.gifts.title}</span>}
                </p>
                {r.message && <p className="mt-0.5 text-base text-marinho italic">“{r.message}”</p>}
                <p className="mt-0.5 text-sm text-azul">{formatarDataHora(r.created_at)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
