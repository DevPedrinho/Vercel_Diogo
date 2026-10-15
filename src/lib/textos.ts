/**
 * Todos os textos editáveis do site, em um só lugar.
 *
 * Cada campo tem uma chave, o rótulo que aparece no painel e o texto padrão
 * — tirado do convite e do save the date da IDV. O painel salva só o que foi
 * mudado; o que estiver vazio no banco cai de volta no padrão daqui, então o
 * site nunca abre com um buraco no lugar de um texto.
 */

export type TipoCampo = "linha" | "paragrafo" | "url" | "datahora" | "imagem";

export type CampoTexto = {
  chave: string;
  rotulo: string;
  padrao: string;
  tipo?: TipoCampo;
  ajuda?: string;
};

export type GrupoTextos = {
  id: string;
  titulo: string;
  descricao: string;
  campos: CampoTexto[];
};

const mapa = (endereco: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;

export const GRUPOS: GrupoTextos[] = [
  {
    id: "noivos",
    titulo: "Os noivos",
    descricao: "Nomes, sobrenomes e os pais, como estão no convite.",
    campos: [
      { chave: "noiva", rotulo: "Nome da noiva", padrao: "Vércia" },
      { chave: "noiva_sobrenome", rotulo: "Sobrenome da noiva", padrao: "Barreto de Lima" },
      { chave: "noivo", rotulo: "Nome do noivo", padrao: "Diogo" },
      { chave: "noivo_sobrenome", rotulo: "Sobrenome do noivo", padrao: "Rufino Conde" },
      {
        chave: "pais_noiva",
        rotulo: "Pais da noiva",
        tipo: "paragrafo",
        padrao: "Maria Aparecida Barreto\nFrancisco Valdemir de Lima (em memória)",
        ajuda: "Um nome por linha. O que estiver entre parênteses sai em itálico.",
      },
      {
        chave: "pais_noivo",
        rotulo: "Pais do noivo",
        tipo: "paragrafo",
        padrao: "Francisca Marcia Conde Paz\nFernando Rufino da Silva",
        ajuda: "Um nome por linha.",
      },
      {
        chave: "imagem_casal",
        rotulo: "Ilustração do casal (capa)",
        tipo: "imagem",
        padrao: "",
        ajuda: "Sem imagem enviada, fica a ilustração do save the date.",
      },
    ],
  },
  {
    id: "data-e-locais",
    titulo: "Data e locais",
    descricao: "Dia, hora, cerimônia e recepção. A contagem regressiva segue a data daqui.",
    campos: [
      {
        chave: "data_hora",
        rotulo: "Data e hora da cerimônia",
        tipo: "datahora",
        padrao: "2027-01-16T19:00:00-03:00",
        ajuda: "Horário de Fortaleza.",
      },
      { chave: "cerimonia_nome", rotulo: "Cerimônia · local", padrao: "Capela da Sagrada Família de Nazaré" },
      { chave: "cerimonia_endereco", rotulo: "Cerimônia · endereço", padrao: "Rua Júlio César, 1743 · Montese" },
      {
        chave: "cerimonia_mapa",
        rotulo: "Cerimônia · link do mapa",
        tipo: "url",
        padrao: mapa("Capela da Sagrada Família de Nazaré, Rua Júlio César, 1743, Montese, Fortaleza"),
      },
      { chave: "recepcao_nome", rotulo: "Recepção · local", padrao: "Espaço Jardins Buffet" },
      { chave: "recepcao_endereco", rotulo: "Recepção · endereço", padrao: "Rua Holanda, 1690 · Maraponga" },
      {
        chave: "recepcao_mapa",
        rotulo: "Recepção · link do mapa",
        tipo: "url",
        padrao: mapa("Espaço Jardins Buffet, Rua Holanda, 1690, Maraponga, Fortaleza"),
      },
    ],
  },
  {
    id: "inicio",
    titulo: "Página inicial",
    descricao: "Os textos da capa, do convite e da nossa história.",
    campos: [
      { chave: "capa_sobretitulo", rotulo: "Capa · acima dos nomes", padrao: "Save the date" },
      {
        chave: "convite_abertura",
        rotulo: "Convite · abertura",
        padrao: "Com muito amor, convidamos para o nosso",
      },
      {
        chave: "convite_texto",
        rotulo: "Convite · chamada",
        tipo: "paragrafo",
        padrao: "Você é nosso convidado especial para celebrar este momento tão importante de nossas vidas.",
      },
      { chave: "citacao", rotulo: "Citação", padrao: "Por fim, só o amor permanece." },
      { chave: "citacao_autor", rotulo: "Autor da citação", padrao: "Santa Teresinha do Menino Jesus" },
      { chave: "lema", rotulo: "Lema", padrao: "Que seja sempre amor" },
      { chave: "historia_titulo", rotulo: "Nossa história · título", padrao: "Nossa história" },
      {
        chave: "historia_texto",
        rotulo: "Nossa história · texto",
        tipo: "paragrafo",
        padrao:
          "Algumas histórias começam devagar, quase sem a gente perceber. A nossa foi assim: uma conversa que virou costume, um costume que virou saudade, e uma saudade que virou certeza.\n\nHoje, diante de Deus e de quem a gente ama, queremos dizer sim um ao outro — e dividir esse dia com você.",
        ajuda: "Deixe uma linha em branco entre os parágrafos.",
      },
      {
        chave: "fe_frase",
        rotulo: "Bênção · frase",
        padrao: "Sob a tua proteção, entregamos o nosso amor.",
      },
      { chave: "fe_versiculo", rotulo: "Bênção · versículo", padrao: "Fazei tudo o que Ele vos disser." },
      { chave: "fe_referencia", rotulo: "Bênção · referência", padrao: "João 2,5" },
    ],
  },
  {
    id: "historia",
    titulo: "Nossa história",
    descricao: "Os textos em volta da linha do tempo. Os capítulos em si ficam em Painel → História.",
    campos: [
      { chave: "historia_linha_titulo", rotulo: "Título da página", padrao: "Nossa história" },
      {
        chave: "historia_linha_intro",
        rotulo: "Abertura da página",
        tipo: "paragrafo",
        padrao: "Cada capítulo que nos trouxe até aqui — e o mais bonito ainda está por vir.",
      },
    ],
  },
  {
    id: "dress-code",
    titulo: "Dress code",
    descricao: "O traje e a paleta sugerida para os convidados.",
    campos: [
      { chave: "traje", rotulo: "Traje", padrao: "Esporte fino" },
      {
        chave: "dress_texto",
        rotulo: "Texto de abertura",
        tipo: "paragrafo",
        padrao:
          "Queremos todo mundo elegante e confortável para celebrar com a gente — a festa vai até tarde e o calor de Fortaleza não tira folga.",
      },
      {
        chave: "dress_cores",
        rotulo: "Paleta sugerida",
        tipo: "paragrafo",
        padrao: "Azul sereno | #a9b9ca\nAzul empoeirado | #5b7189\nAreia | #e3d5bf\nDourado suave | #c8ab7a\nVerde sálvia | #a7b39b",
        ajuda: "Uma cor por linha: nome | código da cor. Ex.: Azul sereno | #a9b9ca",
      },
      {
        chave: "dress_elas",
        rotulo: "Para elas",
        tipo: "paragrafo",
        padrao: "Vestidos midi ou longos, em tecidos leves. A cerimônia é numa capela: prefira ombros cobertos ou um xale.",
      },
      {
        chave: "dress_eles",
        rotulo: "Para eles",
        tipo: "paragrafo",
        padrao: "Calça social, camisa de botão e sapato. Blazer é bem-vindo; gravata, opcional.",
      },
      {
        chave: "dress_evitar",
        rotulo: "Evitar",
        padrao: "Branco, off-white e tons muito claros — essas cores são da noiva.",
      },
    ],
  },
  {
    id: "padrinhos",
    titulo: "Padrinhos e madrinhas",
    descricao: "Os textos da página. Os nomes e fotos ficam em Painel → Padrinhos.",
    campos: [
      { chave: "padrinhos_titulo", rotulo: "Título", padrao: "Padrinhos e madrinhas" },
      {
        chave: "padrinhos_intro",
        rotulo: "Texto de abertura",
        tipo: "paragrafo",
        padrao: "Pessoas que caminham com a gente há tempos e que escolhemos para estar ao nosso lado no altar.",
      },
    ],
  },
  {
    id: "presentes",
    titulo: "Lista de presentes",
    descricao: "O que aparece em cima da lista e no agradecimento.",
    campos: [
      { chave: "presentes_titulo", rotulo: "Título", padrao: "Lista de presentes" },
      {
        chave: "presentes_intro",
        rotulo: "Texto de abertura",
        tipo: "paragrafo",
        padrao:
          "Sua presença já é o nosso maior presente. Mas, se quiser abençoar o começo da nossa vida juntos, escolha um item abaixo — o botão leva direto para o pagamento.",
      },
      {
        chave: "presentes_obrigado",
        rotulo: "Agradecimento depois de presentear",
        padrao: "Obrigado pelo carinho! Que Deus te abençoe.",
      },
    ],
  },
  {
    id: "rodape",
    titulo: "Rodapé e contato",
    descricao: "A despedida no fim de todas as páginas.",
    campos: [
      { chave: "rodape_frase", rotulo: "Frase final", padrao: "Será uma alegria ter vocês conosco!" },
      {
        chave: "contato_whatsapp",
        rotulo: "WhatsApp para dúvidas",
        padrao: "",
        ajuda: "Só números, com DDD. Ex.: 85999998888. Vazio = o botão não aparece.",
      },
    ],
  },
];

export const CAMPOS: CampoTexto[] = GRUPOS.flatMap((g) => g.campos);

export type Textos = Record<string, string>;

/** Os padrões, por chave. */
export const PADROES: Textos = Object.fromEntries(CAMPOS.map((c) => [c.chave, c.padrao]));

/** Junta o que veio do banco com os padrões. Vazio no banco = padrão. */
export function completarTextos(doBanco: Record<string, unknown> | null | undefined): Textos {
  const textos: Textos = { ...PADROES };
  for (const campo of CAMPOS) {
    const valor = doBanco?.[campo.chave];
    if (typeof valor === "string" && valor.trim()) textos[campo.chave] = valor;
  }
  return textos;
}
