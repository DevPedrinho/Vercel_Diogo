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
