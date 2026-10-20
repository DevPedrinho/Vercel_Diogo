import type { EventoHistoria, MusicaDoSite, Padrinho, Presente } from "@/lib/tipos";

/**
 * Conteúdo inicial do site: a lista de presentes da planilha dos noivos, os
 * padrinhos e a linha do tempo. É o que aparece enquanto o Supabase não está
 * ligado — e é o mesmo conteúdo que supabase/seed.sql grava no banco, para o
 * painel já começar preenchido.
 */

const CRIADO = "2026-10-19T12:00:00Z";

/**
 * A arte ilustrada de cada presente, por número da lista (p01 = 1).
 * Ficam em public/img/presentes. As 3 primeiras (18, 21 e 29) foram feitas pelos noivos;
 * as outras 36 seguem o mesmo estilo. Quem não tem arte mostra o raminho.
 */
export const ARTES_PRESENTES: Record<number, string> = {
  1: "/img/presentes/aparelho-de-jantar-dos-sonhos.jpg",
  2: "/img/presentes/faqueiro-tramontina.jpg",
  3: "/img/presentes/fogao-para-as-aventuras-culinarias.jpg",
  4: "/img/presentes/gelagua-para-refrescar-a-vida.jpg",
  5: "/img/presentes/ar-condicionado-para-noites-tranquilas.jpg",
  6: "/img/presentes/cortinas-blackout.jpg",
  7: "/img/presentes/enxoval-de-cama-dos-sonhos.jpg",
  8: "/img/presentes/jogo-de-panelas.jpg",
  9: "/img/presentes/depurador.jpg",
  10: "/img/presentes/torradeira-do-cafe-da-manha.jpg",
  11: "/img/presentes/jogo-de-tacas-e-copos.jpg",
  12: "/img/presentes/panela-de-pressao-eletrica.jpg",
  13: "/img/presentes/1-parcela-da-lava-e-seca.jpg",
  14: "/img/presentes/ajuda-na-1-viagem-internacional-do-casal.jpg",
  15: "/img/presentes/luminarias-para-noites-aconchegantes.jpg",
  16: "/img/presentes/jogo-de-toalhas-macias.jpg",
  17: "/img/presentes/fundo-para-a-geladeira-dos-sonhos.jpg",
  18: "/img/presentes/nosso-primeiro-cafe-de-casados.jpg",
  19: "/img/presentes/vale-jantar-romantico.jpg",
  20: "/img/presentes/patrocine-nossa-proxima-viagem.jpg",
  21: "/img/presentes/cinema-sem-sair-de-casa.jpg",
  22: "/img/presentes/1-dose-de-monjaro-pra-noiva.jpg",
  23: "/img/presentes/dia-de-descanso-dos-recem-casados.jpg",
  24: "/img/presentes/noite-da-pizza.jpg",
  25: "/img/presentes/um-passeio-surpresa.jpg",
  26: "/img/presentes/vale-um-churrasco-na-nossa-casa.jpg",
  27: "/img/presentes/fundo-para-nossas-disputas-de-jogos.jpg",
  28: "/img/presentes/cafe-da-manha-na-cama.jpg",
  29: "/img/presentes/vale-o-primeiro-lugar-na-fila-do-jantar.jpg",
  30: "/img/presentes/uma-escapadinha-a-dois.jpg",
  31: "/img/presentes/ajuda-para-organizar-a-casa.jpg",
  32: "/img/presentes/anti-tpm.jpg",
  33: "/img/presentes/paz-na-escolha-do-filme.jpg",
  34: "/img/presentes/fundo-contra-a-louca-acumulada.jpg",
  35: "/img/presentes/mala-pronta-para-novas-aventuras.jpg",
  36: "/img/presentes/nosso-lar-nosso-refugio.jpg",
  37: "/img/presentes/fundo-para-realizar-um-sonho.jpg",
  38: "/img/presentes/presente-para-nossa-vida-inteira.jpg",
  39: "/img/presentes/minoxidil-para-o-noivo.jpg",
};

const presente = (n: number, category: string, title: string, reais: number | null, description: string | null): Presente => ({
  id: `inicial-${n}`,
  title,
  description,
  category,
  price_cents: reais === null ? null : reais * 100,
  image_path: ARTES_PRESENTES[n] ?? null,
  image_url: null,
  // Sem link: o botão Presentear mostra o PIX do casal.
  gift_url: null,
  is_active: true,
  sort_order: n,
  created_at: CRIADO,
});

export const PRESENTES_INICIAIS: Presente[] = [
  presente(1, "Casa", "Aparelho de jantar dos sonhos", 450, "Para receber a família e os amigos com uma mesa linda."),
  presente(2, "Casa", "Faqueiro Tramontina", 350, "Para nossas refeições, dos almoços simples aos jantares especiais."),
  presente(3, "Casa", "Fogão para as aventuras culinárias", 1400, "Para preparar nossas receitas favoritas e alimentar muitos momentos felizes."),
  presente(4, "Casa", "Gelágua para refrescar a vida", 450, "Porque amor é bom, mas água gelada também é indispensável!"),
  presente(5, "Casa", "Ar-condicionado para noites tranquilas", 1600, "Para dormir juntinhos, com conforto e sem disputar o ventilador."),
  presente(6, "Casa", "Cortinas blackout", 250, "Para garantir escurinho, privacidade e aquelas manhãs de sono prolongado."),
  presente(7, "Casa", "Enxoval de cama dos sonhos", 500, "Para deixar nosso cantinho ainda mais confortável e cheio de carinho."),
  presente(8, "Casa", "Jogo de panelas", 650, "Para nossas experiências gastronômicas, inclusive as que derem errado."),
  presente(9, "Casa", "Depurador", 450, "Para uma cozinha sem fumaça e sem estresse."),
  presente(10, "Casa", "Torradeira do café da manhã", 180, "Para nossas manhãs começarem com pão quentinho."),
  presente(11, "Casa", "Jogo de taças e copos", 300, "Para brindar às pequenas e grandes conquistas."),
  presente(12, "Casa", "Panela de pressão elétrica", 500, "Para preparar refeições deliciosas sem passar horas na cozinha."),
  presente(13, "Casa", "1 Parcela da Lava e Seca", 300, "Uma contribuição para equipar nossa área de serviço."),
  presente(14, "Lua de Mel", "Ajuda na 1° viagem internacional do casal", 500, "Contribua para que possamos realizar nosso sonho de viajar para fora do país."),
  presente(15, "Casa", "Luminárias para noites aconchegantes", 300, "Para criar aquele clima gostoso no fim do dia."),
  presente(16, "Casa", "Jogo de toalhas macias", 200, "Para completar o enxoval com conforto e elegância."),
  presente(17, "Casa", "Fundo para a geladeira dos sonhos", 800, "Uma contribuição para conservar nossos alimentos e abastecer a casa nova."),
  presente(18, "Lua de Mel", "Nosso primeiro café de casados", 150, "Para começar a vida a dois com café, carinho e muito amor."),
  presente(19, "Lua de Mel", "Vale-jantar romântico", 250, "Para um encontro especial depois da correria do casamento."),
  presente(20, "Lua de Mel", "Patrocine nossa próxima viagem", 350, "Para colecionarmos novas paisagens e lembranças."),
  presente(21, "Lua de Mel", "Cinema sem sair de casa", 150, "Para pipoca, filmes e aquela discussão sobre quem escolhe o próximo."),
  presente(22, "Lua de Mel", "1 dose de Monjaro pra Noiva", 250, "Para dançarmos juntos, mesmo quando um de nós errar o passo."),
  presente(23, "Lua de Mel", "Dia de descanso dos recém-casados", 350, "Para desacelerar depois de organizar cada detalhe do casamento."),
  presente(24, "Lua de Mel", "Noite da pizza", 180, "Para cozinhar juntos ou pedir aquela pizza sem culpa."),
  presente(25, "Lua de Mel", "Um passeio surpresa", 250, "Para sair da rotina e criar uma memória inesperada."),
  presente(26, "Lua de Mel", "Vale um churrasco na nossa casa", 200, "Uma contribuição oficial para garantir que sempre te convidaremos."),
  presente(27, "Lua de Mel", "Fundo para nossas disputas de jogos", 180, "Para jogos, risadas e uma competição saudável (ou quase)."),
  presente(28, "Lua de Mel", "Café da manhã na cama", 200, "Para surpreender um ao outro sem precisar sair do quarto."),
  presente(29, "Lua de Mel", "Vale o primeiro lugar na fila do jantar", 150, "Vamos garantir que você seja a primeira pessoa a ser servida no jantar do Buffet."),
  presente(30, "Lua de Mel", "Uma escapadinha a dois", 350, "Para um passeio especial e um tempo só nosso."),
  presente(31, "Casa", "Ajuda para organizar a casa", 250, "Para transformar caixas e bagunça em um lar cheio de personalidade."),
  presente(32, "Cota divertida", "ANTI - TPM", 180, "Para que o noivo sobreviva a esse período"),
  presente(33, "Cota divertida", "Paz na escolha do filme", 200, "Para ver o filme que os dois escolherem sem passar uma hora procurando."),
  presente(34, "Casa", "Fundo contra a louça acumulada", 250, "Uma contribuição para ajudar a comprar nossa máquina de lavar louça"),
  presente(35, "Lua de Mel", "Mala pronta para novas aventuras", 350, "Para ajudar a preparar a próxima viagem do casal."),
  presente(36, "Casa", "Nosso lar, nosso refúgio", 500, "Para investir em detalhes que deixem nossa casa ainda mais acolhedora."),
  presente(37, "Lua de Mel", "Fundo para realizar um sonho", 800, "Uma contribuição para transformar um dos nossos planos em realidade."),
  presente(38, "Lua de Mel", "Presente para nossa vida inteira", 1000, "Para brindar ao amor, à parceria e a todos os sonhos que ainda vamos realizar juntos."),
  presente(39, "Cota divertida", "Minoxidil para o noivo", 250, "Para ajudar o noivo a cuidar do visual e manter a esperança de uma cabeleira de respeito no grande dia! 😂"),
];

const capitulo = (n: number, date_label: string, title: string, description: string, foto: string | null = null): EventoHistoria => ({
  id: `inicial-h${n}`,
  title,
  date_label,
  description,
  image_path: foto,
  sort_order: n,
  created_at: CRIADO,
});

export const HISTORIA_INICIAL: EventoHistoria[] = [
  capitulo(1, "2022", "Um match inesperado", "Tudo começou com uma conversa inesperada, daquelas que a gente nem imagina onde podem chegar.", "/img/historia/o-comeco.jpg"),
  capitulo(2, "Amor e companheirismo", "Do match ao amor", "O que começou com um match se transformou em amor e companheirismo.", "/img/historia/vercia-e-diogo.jpg"),
  capitulo(3, "Um lar compartilhado", "Nosso lar", "Dividimos a mesma casa, a mesma rotina e os mesmos sonhos."),
  capitulo(4, "Quatro anos juntos", "Sonhos e viagens", "Quatro anos de sonhos, viagens e tantas histórias para contar.", "/img/historia/viagem.jpg"),
  capitulo(5, "16 de janeiro de 2027", "O nosso sim", "Diante de Deus e de quem amamos, vamos celebrar tudo o que nos trouxe até aqui e dizer sim a uma vida inteira juntos — e não poderíamos imaginar esse dia sem você.", "/img/casal.png"),
];

const padrinho = (n: number, side: "noiva" | "noivo", name: string, foto: string | null = null): Padrinho => ({
  id: `inicial-p${n}`,
  name,
  role: "Padrinhos",
  side,
  description: null,
  image_path: foto,
  sort_order: n,
  created_at: CRIADO,
});

export const PADRINHOS_INICIAIS: Padrinho[] = [
  padrinho(1, "noiva", "Rita & Roberto", "/img/padrinhos/rita-e-roberto.jpg"),
  padrinho(2, "noiva", "Bárbara & Jean"),
  padrinho(3, "noiva", "Ismênia & José"),
  padrinho(4, "noiva", "Ludmylla & João Victor", "/img/padrinhos/ludmylla-e-joao-victor.jpg"),
  padrinho(5, "noivo", "Priscila & Breno"),
  padrinho(6, "noivo", "Thyago & Gleiciane", "/img/padrinhos/thyago-e-gleiciane.jpg"),
  padrinho(7, "noivo", "Patrick & Letícia"),
  padrinho(8, "noivo", "Yuri & Lara"),
];

/** A música escolhida pelos noivos, servida de /public. Uma música enviada
 *  pelo painel toma o lugar dela. */
export const MUSICA_PADRAO: MusicaDoSite = {
  file_path: null,
  title: "Partilhar",
  artist: "Rubel",
  enabled: true,
  volume: 0.5,
};

export const ARQUIVO_MUSICA_PADRAO = "/audio/partilhar-rubel.mp3";
