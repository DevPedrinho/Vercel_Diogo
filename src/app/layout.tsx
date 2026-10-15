import type { Metadata, Viewport } from "next";
import { Allura, Cormorant_Garamond, EB_Garamond } from "next/font/google";
import { carregarCasamento } from "@/lib/conteudo";
import "./globals.css";

// As versaletes de "SAVE THE DATE" e "CASAMENTO": serifada clássica.
const fonteTitulo = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--fonte-titulo",
  display: "swap",
});

// Texto corrido: Garamond de olho maior, que lê bem no celular.
const fonteCorpo = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--fonte-corpo",
  display: "swap",
});

// A caligrafia dos nomes e do "the".
const fonteScript = Allura({
  subsets: ["latin"],
  weight: "400",
  variable: "--fonte-script",
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
  : process.env.VERCEL_URL
    ? new URL(`https://${process.env.VERCEL_URL}`)
    : new URL("http://localhost:3000");

export async function generateMetadata(): Promise<Metadata> {
  const c = await carregarCasamento();
  const titulo = `${c.noiva} & ${c.noivo} — ${c.dataCurta.replace(/ /g, "")}`;
  const descricao = `${c.convite_abertura} casamento. ${c.dataExtenso}, ${c.hora}.`;
  return {
    metadataBase: baseUrl,
    title: { default: titulo, template: `%s · ${c.noiva} & ${c.noivo}` },
    description: descricao,
    openGraph: {
      title: titulo,
      description: descricao,
      type: "website",
      locale: "pt_BR",
      images: [{ url: "/img/og.jpg", width: 1200, height: 630, alt: titulo }],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#f6f1e9",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${fonteTitulo.variable} ${fonteCorpo.variable} ${fonteScript.variable}`}>
      <head>
        {/* Marca que o JS está ativo antes da primeira pintura: só então as
            seções começam escondidas para a animação de entrada. */}
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add("js-ativo")` }} />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
