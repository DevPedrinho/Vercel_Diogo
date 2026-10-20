/**
 * Endereços dos arquivos guardados no Supabase Storage.
 *
 * Vive fora dos componentes de propósito: as páginas do servidor também
 * montam essas URLs, e uma função exportada de um arquivo "use client"
 * não pode ser chamada no servidor.
 */

/** URL pública de um arquivo do bucket "site". */
export function urlDoSite(caminho: string | null | undefined): string | null {
  if (!caminho) return null;
  // Caminho começando com "/" é arquivo do próprio site (pasta public),
  // como as fotos que entraram junto com o código.
  if (caminho.startsWith("/")) return caminho;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return base ? `${base}/storage/v1/object/public/site/${caminho}` : null;
}
