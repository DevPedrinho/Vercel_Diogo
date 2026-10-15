/**
 * O Supabase está configurado? Sem as duas variáveis o site não quebra:
 * abre em modo demonstração, com os textos padrão de config.ts, presentes
 * de exemplo e o painel aberto só para olhar.
 */
export const supabaseConfigurado = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
