/**
 * Casamento Vércia & Diogo — a planilha como banco de dados do site.
 *
 * Como instalar (uma vez só):
 *   1. Na planilha, menu Extensões → Apps Script.
 *   2. Apague o que estiver lá, cole este arquivo inteiro e troque o TOKEN
 *      abaixo por uma senha longa (a mesma vai na Vercel, em
 *      GOOGLE_PLANILHA_TOKEN).
 *   3. Salve, escolha a função "configurar" e clique em Executar. Autorize.
 *      Ela cria as abas que faltarem e os cabeçalhos.
 *   4. Implantar → Nova implantação → tipo "App da Web".
 *      Executar como: Eu. Quem pode acessar: Qualquer pessoa.
 *      Copie a URL que termina em /exec e cole na Vercel, em
 *      GOOGLE_PLANILHA_URL.
 *
 * "Qualquer pessoa" só quer dizer que o site consegue chamar o script: sem o
 * TOKEN ele não lê nem grava nada.
 */

var TOKEN = 'TROQUE-POR-UMA-SENHA-LONGA';

var CABECALHOS = {
  'Presentes': ['id', 'titulo', 'categoria', 'valor', 'descricao', 'imagem', 'link', 'ativo', 'ordem'],
  'Confirmações': ['id', 'data', 'nome', 'vai', 'acompanhantes', 'nomes_acompanhantes', 'whatsapp', 'recado'],
  'Recados': ['id', 'data', 'presente', 'nome', 'recado'],
  // Lista de convidados dos noivos: quem está aqui é reconhecido no formulário.
  // acompanhantes = quantas pessoas o convite inclui além do titular.
  'Convidados': ['id', 'nome', 'whatsapp', 'acompanhantes', 'nomes_acompanhantes', 'grupo'],
};

/** A lista da planilha dos noivos: entra na aba Presentes quando ela é criada. */
var PRESENTES_INICIAIS = [
  ["p01", "Aparelho de jantar dos sonhos", "Cozinha", 450, "Para receber a família e os amigos com uma mesa linda.", "/img/presentes/aparelho-de-jantar-dos-sonhos-v2.jpg", "", "sim", 1],
  ["p02", "Faqueiro Tramontina", "Cozinha", 350, "Para nossas refeições, dos almoços simples aos jantares especiais.", "/img/presentes/faqueiro-tramontina-v2.jpg", "", "sim", 2],
  ["p03", "Fogão para as aventuras culinárias", "Cozinha", 1400, "Para preparar nossas receitas favoritas e alimentar muitos momentos felizes.", "/img/presentes/fogao-para-as-aventuras-culinarias.jpg", "", "sim", 3],
  ["p04", "Gelágua para refrescar a vida", "Cozinha", 450, "Porque amor é bom, mas água gelada também é indispensável!", "/img/presentes/gelagua-para-refrescar-a-vida-v2.jpg", "", "sim", 4],
  ["p05", "Ar-condicionado para noites tranquilas", "Casa e conforto", 1600, "Para dormir juntinhos, com conforto e sem disputar o ventilador.", "/img/presentes/ar-condicionado-para-noites-tranquilas.jpg", "", "sim", 5],
  ["p06", "Cortinas blackout", "Casa e conforto", 250, "Para garantir escurinho, privacidade e aquelas manhãs de sono prolongado.", "/img/presentes/cortinas-blackout-v2.jpg", "", "sim", 6],
  ["p07", "Enxoval de cama dos sonhos", "Casa e conforto", 500, "Para deixar nosso cantinho ainda mais confortável e cheio de carinho.", "/img/presentes/enxoval-de-cama-dos-sonhos-v2.jpg", "", "sim", 7],
  ["p08", "Jogo de panelas", "Cozinha", 650, "Para nossas experiências gastronômicas, inclusive as que derem errado.", "/img/presentes/jogo-de-panelas.jpg", "", "sim", 8],
  ["p09", "Depurador", "Cozinha", 450, "Para uma cozinha sem fumaça e sem estresse.", "/img/presentes/depurador-v2.jpg", "", "sim", 9],
  ["p10", "Torradeira do café da manhã", "Cozinha", 180, "Para nossas manhãs começarem com pão quentinho.", "/img/presentes/torradeira-do-cafe-da-manha.jpg", "", "sim", 10],
  ["p11", "Jogo de taças e copos", "Cozinha", 300, "Para brindar às pequenas e grandes conquistas.", "/img/presentes/jogo-de-tacas-e-copos-v2.jpg", "", "sim", 11],
  ["p12", "Panela de pressão elétrica", "Cozinha", 500, "Para preparar refeições deliciosas sem passar horas na cozinha.", "/img/presentes/panela-de-pressao-eletrica.jpg", "", "sim", 12],
  ["p13", "1 Parcela da Lava e Seca", "Casa e conforto", 300, "Uma contribuição para equipar nossa área de serviço.", "/img/presentes/1-parcela-da-lava-e-seca-v2.jpg", "", "sim", 13],
  ["p14", "Ajuda na 1° viagem internacional do casal", "Viagens e sonhos", 500, "Contribua para que possamos realizar nosso sonho de viajar para fora do país.", "/img/presentes/ajuda-na-1-viagem-internacional-do-casal-v2.jpg", "", "sim", 14],
  ["p15", "Luminárias para noites aconchegantes", "Casa e conforto", 300, "Para criar aquele clima gostoso no fim do dia.", "/img/presentes/luminarias-para-noites-aconchegantes-v2.jpg", "", "sim", 15],
  ["p16", "Jogo de toalhas macias", "Casa e conforto", 200, "Para completar o enxoval com conforto e elegância.", "/img/presentes/jogo-de-toalhas-macias.jpg", "", "sim", 16],
  ["p17", "Fundo para a geladeira dos sonhos", "Cozinha", 800, "Uma contribuição para conservar nossos alimentos e abastecer a casa nova.", "/img/presentes/fundo-para-a-geladeira-dos-sonhos.jpg", "", "sim", 17],
  ["p18", "Nosso primeiro café de casados", "Momentos a dois", 150, "Para começar a vida a dois com café, carinho e muito amor.", "/img/presentes/nosso-primeiro-cafe-de-casados.jpg", "", "sim", 18],
  ["p19", "Vale-jantar romântico", "Momentos a dois", 250, "Para um encontro especial depois da correria do casamento.", "/img/presentes/vale-jantar-romantico-v2.jpg", "", "sim", 19],
  ["p20", "Patrocine nossa próxima viagem", "Viagens e sonhos", 350, "Para colecionarmos novas paisagens e lembranças.", "/img/presentes/patrocine-nossa-proxima-viagem-v2.jpg", "", "sim", 20],
  ["p21", "Cinema sem sair de casa", "Momentos a dois", 150, "Para pipoca, filmes e aquela discussão sobre quem escolhe o próximo.", "/img/presentes/cinema-sem-sair-de-casa.jpg", "", "sim", 21],
  ["p22", "1 dose de Monjaro pra Noiva", "Cotas divertidas", 250, "Noiva em fuga dos kilinhos", "/img/presentes/1-dose-de-monjaro-pra-noiva-v3.jpg", "", "sim", 22],
  ["p23", "Dia de descanso dos recém-casados", "Momentos a dois", 350, "Para desacelerar depois de organizar cada detalhe do casamento.", "/img/presentes/dia-de-descanso-dos-recem-casados-v2.jpg", "", "sim", 23],
  ["p24", "Noite da pizza", "Momentos a dois", 180, "Para cozinhar juntos ou pedir aquela pizza sem culpa.", "/img/presentes/noite-da-pizza.jpg", "", "sim", 24],
  ["p25", "Um passeio surpresa", "Momentos a dois", 250, "Para sair da rotina e criar uma memória inesperada.", "/img/presentes/um-passeio-surpresa-v2.jpg", "", "sim", 25],
  ["p26", "Vale um churrasco na nossa casa", "Cotas divertidas", 200, "Uma contribuição oficial para garantir que sempre te convidaremos.", "/img/presentes/vale-um-churrasco-na-nossa-casa-v2.jpg", "", "sim", 26],
  ["p27", "Fundo para nossas disputas de jogos", "Momentos a dois", 180, "Para jogos, risadas e uma competição saudável (ou quase).", "/img/presentes/fundo-para-nossas-disputas-de-jogos.jpg", "", "sim", 27],
  ["p28", "Café da manhã na cama", "Momentos a dois", 200, "Para surpreender um ao outro sem precisar sair do quarto.", "/img/presentes/cafe-da-manha-na-cama-v2.jpg", "", "sim", 28],
  ["p29", "Vale o primeiro lugar na fila do jantar", "Cotas divertidas", 150, "Vamos garantir que você seja a primeira pessoa a ser servida no jantar do Buffet.", "/img/presentes/vale-o-primeiro-lugar-na-fila-do-jantar.jpg", "", "sim", 29],
  ["p30", "Uma escapadinha a dois", "Viagens e sonhos", 350, "Para um passeio especial e um tempo só nosso.", "/img/presentes/uma-escapadinha-a-dois-v2.jpg", "", "sim", 30],
  ["p31", "Ajuda para organizar a casa", "Casa e conforto", 250, "Para transformar caixas e bagunça em um lar cheio de personalidade.", "/img/presentes/ajuda-para-organizar-a-casa-v2.jpg", "", "sim", 31],
  ["p32", "ANTI - TPM", "Cotas divertidas", 180, "Para que o noivo sobreviva a esse período", "/img/presentes/anti-tpm.jpg", "", "sim", 32],
  ["p33", "Paz na escolha do filme", "Cotas divertidas", 200, "Para ver o filme que os dois escolherem sem passar uma hora procurando.", "/img/presentes/paz-na-escolha-do-filme-v2.jpg", "", "sim", 33],
  ["p34", "Fundo contra a louça acumulada", "Cozinha", 250, "Uma contribuição para ajudar a comprar nossa máquina de lavar louça", "/img/presentes/fundo-contra-a-louca-acumulada-v2.jpg", "", "sim", 34],
  ["p35", "Mala pronta para novas aventuras", "Viagens e sonhos", 350, "Para ajudar a preparar a próxima viagem do casal.", "/img/presentes/mala-pronta-para-novas-aventuras-v2.jpg", "", "sim", 35],
  ["p36", "Nosso lar, nosso refúgio", "Casa e conforto", 500, "Para investir em detalhes que deixem nossa casa ainda mais acolhedora.", "/img/presentes/nosso-lar-nosso-refugio.jpg", "", "sim", 36],
  ["p37", "Fundo para realizar um sonho", "Viagens e sonhos", 800, "Uma contribuição para transformar um dos nossos planos em realidade.", "/img/presentes/fundo-para-realizar-um-sonho.jpg", "", "sim", 37],
  ["p38", "Presente para nossa vida inteira", "Viagens e sonhos", 1000, "Para brindar ao amor, à parceria e a todos os sonhos que ainda vamos realizar juntos.", "/img/presentes/presente-para-nossa-vida-inteira.jpg", "", "sim", 38],
  ["p39", "Minoxidil para o noivo", "Cotas divertidas", 250, "Para ajudar o noivo a cuidar do visual e manter a esperança de uma cabeleira de respeito no grande dia! 😂", "/img/presentes/minoxidil-para-o-noivo-v2.jpg", "", "sim", 39]
];

function configurar() {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  // Uma aba vazia sem nome próprio ("Página1") vira a aba Presentes, em vez
  // de ficar sobrando ao lado.
  if (!planilha.getSheetByName('Presentes')) {
    var primeira = planilha.getSheets()[0];
    var cabecalho = primeira.getLastRow() > 0 ? chave(primeira.getRange(1, 2).getValue()) : '';
    if (primeira.getLastRow() === 0 || cabecalho === 'titulo') primeira.setName('Presentes');
  }
  Object.keys(CABECALHOS).forEach(function (nome) {
    var aba = planilha.getSheetByName(nome) || planilha.insertSheet(nome);
    if (aba.getLastRow() === 0) {
      aba.appendRow(CABECALHOS[nome]);
      aba.setFrozenRows(1);
      aba.getRange(1, 1, 1, CABECALHOS[nome].length).setFontWeight('bold').setBackground('#253a54').setFontColor('#ffffff');
      if (nome === 'Presentes') {
        aba.getRange(2, 1, PRESENTES_INICIAIS.length, CABECALHOS[nome].length).setValues(PRESENTES_INICIAIS);
        aba.getRange(2, 4, PRESENTES_INICIAIS.length, 1).setNumberFormat('#,##0.00');
      }
      aba.autoResizeColumns(1, CABECALHOS[nome].length);
    }
  });
}

function doPost(e) {
  try {
    var pedido = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!pedido.token || pedido.token !== TOKEN) return responder({ ok: false, erro: 'token inválido' });

    var aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(pedido.aba || '');
    if (!aba || !CABECALHOS[pedido.aba]) return responder({ ok: false, erro: 'aba não encontrada' });

    if (pedido.acao === 'ler') {
      if (pedido.aba === 'Convidados') garantirIds(aba);
      return responder({ ok: true, linhas: ler(aba) });
    }
    if (pedido.acao === 'anexar') return responder({ ok: true, id: anexar(aba, pedido.dados || {}) });
    if (pedido.acao === 'apagar') return responder({ ok: true, apagou: apagar(aba, String(pedido.id || '')) });
    return responder({ ok: false, erro: 'ação desconhecida' });
  } catch (erro) {
    return responder({ ok: false, erro: String(erro) });
  }
}

// O site só usa POST; o GET responde para dar para testar a URL no navegador.
function doGet() {
  return responder({ ok: true, mensagem: 'Planilha do casamento no ar.' });
}

/** "Título" → "titulo": os cabeçalhos aceitam acento e maiúscula. */
function chave(texto) {
  return String(texto).trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '_');
}

function ler(aba) {
  var valores = aba.getDataRange().getValues();
  if (valores.length < 2) return [];
  var cabecalho = valores[0].map(chave);
  return valores.slice(1)
    .filter(function (linha) { return linha.some(function (c) { return c !== '' && c !== null; }); })
    .map(function (linha) {
      var objeto = {};
      cabecalho.forEach(function (nome, i) {
        var valor = linha[i];
        objeto[nome] = valor instanceof Date ? valor.toISOString() : valor;
      });
      return objeto;
    });
}

/**
 * Convidado colado na planilha sem id ganha um código curto, que vira o link
 * pessoal do convite (/confirmar?convite=CODIGO). Quem já tem código mantém.
 */
function garantirIds(aba) {
  var total = aba.getLastRow();
  if (total < 2) return;
  var cabecalho = aba.getRange(1, 1, 1, aba.getLastColumn()).getValues()[0].map(chave);
  var colId = cabecalho.indexOf('id');
  var colNome = cabecalho.indexOf('nome');
  if (colId < 0 || colNome < 0) return;
  var ids = aba.getRange(2, colId + 1, total - 1, 1).getValues();
  var nomes = aba.getRange(2, colNome + 1, total - 1, 1).getValues();
  var mudou = false;
  for (var i = 0; i < ids.length; i++) {
    if (!String(ids[i][0]).trim() && String(nomes[i][0]).trim()) {
      ids[i][0] = codigoCurto();
      mudou = true;
    }
  }
  if (mudou) aba.getRange(2, colId + 1, total - 1, 1).setValues(ids);
}

function codigoCurto() {
  var letras = 'abcdefghjkmnpqrstuvwxyz23456789';
  var codigo = '';
  for (var i = 0; i < 8; i++) codigo += letras.charAt(Math.floor(Math.random() * letras.length));
  return codigo;
}

function anexar(aba, dados) {
  var trava = LockService.getScriptLock();
  trava.waitLock(10000);
  try {
    var cabecalho = aba.getRange(1, 1, 1, aba.getLastColumn()).getValues()[0].map(chave);
    var id = Utilities.getUuid();
    var linha = cabecalho.map(function (nome) {
      if (nome === 'id') return id;
      if (nome === 'data') return new Date();
      var valor = dados[nome];
      if (valor === undefined || valor === null) return '';
      // Texto que começa com = + - @ viraria fórmula: entra como texto puro.
      if (typeof valor === 'string' && /^[=+\-@]/.test(valor)) return "'" + valor;
      return valor;
    });
    aba.appendRow(linha);
    return id;
  } finally {
    trava.releaseLock();
  }
}

function apagar(aba, id) {
  if (!id) return false;
  var trava = LockService.getScriptLock();
  trava.waitLock(10000);
  try {
    var ids = aba.getRange(1, 1, aba.getLastRow(), 1).getValues();
    for (var i = ids.length - 1; i >= 1; i--) {
      if (String(ids[i][0]) === id) {
        aba.deleteRow(i + 1);
        return true;
      }
    }
    return false;
  } finally {
    trava.releaseLock();
  }
}

function responder(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(ContentService.MimeType.JSON);
}
