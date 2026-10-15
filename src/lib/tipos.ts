export type Presente = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  price_cents: number | null;
  image_path: string | null;
  image_url: string | null;
  gift_url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

/** O recado que o convidado deixa ao clicar em Presentear. */
export type Recado = {
  id: string;
  gift_id: string | null;
  name: string;
  message: string | null;
  created_at: string;
};

export type MusicaDoSite = {
  file_path: string | null;
  title: string | null;
  artist: string | null;
  enabled: boolean;
  volume: number;
};

/** Um capítulo da linha do tempo da nossa história. */
export type EventoHistoria = {
  id: string;
  title: string;
  date_label: string | null;
  description: string | null;
  image_path: string | null;
  sort_order: number;
  created_at: string;
};

/** Um padrinho, uma madrinha ou um casal de padrinhos. */
export type Padrinho = {
  id: string;
  name: string;
  role: string;
  side: "noiva" | "noivo";
  description: string | null;
  image_path: string | null;
  sort_order: number;
  created_at: string;
};
