# Casamento Vércia & Diogo — 16.01.2027

Site do casamento, feito a partir da identidade visual do save the date e do
convite: papel creme, azul-marinho dos nomes, filetes dourados, aquarela azul
nos cantos e o selo de cera **V | D**.

Mesma base do site da Deysiane & Pedro (Next.js + Supabase + Tailwind), mas
com um painel enxuto: os noivos cuidam **só dos presentes, da música e dos
textos do site**. Não há cadastro de convidado — o site é aberto.

## Páginas

| Página | Endereço | O que faz |
| --- | --- | --- |
| Início | `/` | Save the date, contagem regressiva, o convite, locais com mapa, nossa história e a bênção |
| Presentes | `/presentes` | Lista com filtro por categoria; o botão **Presentear** abre o link de pagamento e pede nome e recado (opcional) |
| Entrar | `/entrar` | Login dos noivos |
| Painel | `/admin` | Resumo e últimos recados |
| Presentes (painel) | `/admin/presentes` | Adicionar, editar, ocultar, reordenar e remover presentes; ler e apagar recados |
| Música (painel) | `/admin/musica` | Enviar o MP3, nome e artista, volume e liga/desliga |
| Textos (painel) | `/admin/textos` | Nomes, pais, data e hora, cerimônia, recepção, mapas, textos da capa, do convite, da história, da lista e do rodapé, e a ilustração da capa |

A música toca numa pílula no canto da tela, em todas as páginas do site. Como
nenhum navegador deixa tocar som antes de a pessoa encostar na tela, ela entra
no primeiro toque.

## Modo demonstração

Sem as variáveis do Supabase o site abre igual, com os textos do convite,
seis presentes de exemplo e a melodia de teste. O painel abre sem login, só
para olhar — os botões de salvar avisam que falta conectar o banco.

## Colocando no ar

1. **Supabase** — crie um projeto e rode `supabase/migrations/20261015120000_site_vercia_diogo.sql`
   no SQL Editor. Ele cria as tabelas, as regras de acesso (RLS) e o bucket `site`.
2. **Conta dos noivos** — em *Authentication → Users → Add user*, crie o
   e-mail e a senha (marque *Auto Confirm User*). Depois, no SQL Editor:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'email-dos-noivos@exemplo.com';
   ```
   Repita para cada pessoa que vai mexer no painel.
3. **Vercel** — importe o repositório e cadastre `NEXT_PUBLIC_SUPABASE_URL` e
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase → *Settings → API*). Opcional:
   `NEXT_PUBLIC_SITE_URL` com o domínio final.

## Rodando local

```bash
npm install
cp .env.example .env.local   # preencha, ou deixe vazio para o modo demonstração
npm run dev
```

## Onde mexer no código

- `src/lib/textos.ts` — todos os campos de texto, com os padrões tirados do convite.
  Para criar um texto editável novo, basta acrescentar um campo aqui e usá-lo na página.
- `src/app/globals.css` — paleta e tipografia da IDV.
- `src/components/Ornamentos.tsx` — aquarela, raminhos, selo e divisores em SVG.
