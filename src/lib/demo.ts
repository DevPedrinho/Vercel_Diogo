import type { MusicaDoSite, Presente } from "@/lib/tipos";

/**
 * O que o site mostra enquanto o Supabase não está ligado: presentes de
 * exemplo e a melodia de teste. Assim dá para ver o site inteiro funcionando
 * antes de criar o banco. Com o Supabase configurado, nada daqui aparece.
 */

const item = (
  n: number,
  title: string,
  category: string,
  reais: number | null,
  description: string,
): Presente => ({
  id: `demo-${n}`,
  title,
  description,
  category,
  price_cents: reais === null ? null : reais * 100,
  image_path: null,
  image_url: null,
  gift_url: "https://exemplo.com/pagamento",
  is_active: true,
  sort_order: n,
  created_at: "2026-10-15T12:00:00Z",
});

export const PRESENTES_DEMO: Presente[] = [
  item(1, "Jogo de panelas", "Cozinha", 480, "Para os primeiros almoços de domingo da casa nova."),
  item(2, "Jogo de cama queen", "Quarto", 320, "Lençóis macios para descansar depois da festa."),
  item(3, "Jantar a dois", "Lua de mel", 250, "Uma noite especial na viagem de lua de mel."),
  item(4, "Cafeteira", "Cozinha", 390, "Café fresquinho todas as manhãs — prometemos convidar."),
  item(5, "Passeio de barco", "Lua de mel", 600, "O pôr do sol mais bonito da viagem."),
  item(6, "Cota livre", "Casa", null, "Escolha o valor que o seu coração mandar."),
];

export const MUSICA_DEMO: MusicaDoSite = {
  file_path: null,
  title: "Melodia de teste",
  artist: "Instrumental provisório",
  enabled: true,
  volume: 0.5,
};

/** Arquivo servido de /public enquanto não há música enviada pelo painel. */
export const ARQUIVO_MUSICA_DEMO = "/audio/melodia-de-teste.wav";
