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
};

/** A lista da planilha dos noivos: entra na aba Presentes quando ela é criada. */
var PRESENTES_INICIAIS = [
  ["p01", "Aparelho de jantar dos sonhos", "Casa", 450, "Para receber a família e os amigos com uma mesa linda.", "", "", "sim", 1],
  ["p02", "Faqueiro Tramontina", "Casa", 350, "Para nossas refeições, dos almoços simples aos jantares especiais.", "", "", "sim", 2],
  ["p03", "Fogão para as aventuras culinárias", "Casa", 1400, "Para preparar nossas receitas favoritas e alimentar muitos momentos felizes.", "", "", "sim", 3],
  ["p04", "Gelágua para refrescar a vida", "Casa", 450, "Porque amor é bom, mas água gelada também é indispensável!", "", "", "sim", 4],
  ["p05", "Ar-condicionado para noites tranquilas", "Casa", 1600, "Para dormir juntinhos, com conforto e sem disputar o ventilador.", "", "", "sim", 5],
  ["p06", "Cortinas blackout", "Casa", 250, "Para garantir escurinho, privacidade e aquelas manhãs de sono prolongado.", "", "", "sim", 6],
  ["p07", "Enxoval de cama dos sonhos", "Casa", 500, "Para deixar nosso cantinho ainda mais confortável e cheio de carinho.", "", "", "sim", 7],
  ["p08", "Jogo de panelas", "Casa", 650, "Para nossas experiências gastronômicas, inclusive as que derem errado.", "", "", "sim", 8],
  ["p09", "Depurador", "Casa", 450, "Para uma cozinha sem fumaça e sem estresse.", "", "", "sim", 9],
  ["p10", "Torradeira do café da manhã", "Casa", 180, "Para nossas manhãs começarem com pão quentinho.", "", "", "sim", 10],
  ["p11", "Jogo de taças e copos", "Casa", 300, "Para brindar às pequenas e grandes conquistas.", "", "", "sim", 11],
  ["p12", "Panela de pressão elétrica", "Casa", 500, "Para preparar refeições deliciosas sem passar horas na cozinha.", "", "", "sim", 12],
  ["p13", "1 Parcela da Lava e Seca", "Casa", 300, "Uma contribuição para equipar nossa área de serviço.", "", "", "sim", 13],
  ["p14", "Ajuda na 1° viagem internacional do casal", "Lua de Mel", 500, "Contribua para que possamos realizar nosso sonho de viajar para fora do país.", "", "", "sim", 14],
  ["p15", "Luminárias para noites aconchegantes", "Casa", 300, "Para criar aquele clima gostoso no fim do dia.", "", "", "sim", 15],
  ["p16", "Jogo de toalhas macias", "Casa", 200, "Para completar o enxoval com conforto e elegância.", "", "", "sim", 16],
  ["p17", "Fundo para a geladeira dos sonhos", "Casa", 800, "Uma contribuição para conservar nossos alimentos e abastecer a casa nova.", "", "", "sim", 17],
  ["p18", "Nosso primeiro café de casados", "Lua de Mel", 150, "Para começar a vida a dois com café, carinho e muito amor.", "", "", "sim", 18],
  ["p19", "Vale-jantar romântico", "Lua de Mel", 250, "Para um encontro especial depois da correria do casamento.", "", "", "sim", 19],
  ["p20", "Patrocine nossa próxima viagem", "Lua de Mel", 350, "Para colecionarmos novas paisagens e lembranças.", "", "", "sim", 20],
  ["p21", "Cinema sem sair de casa", "Lua de Mel", 150, "Para pipoca, filmes e aquela discussão sobre quem escolhe o próximo.", "", "", "sim", 21],
  ["p22", "1 dose de Monjaro pra Noiva", "Lua de Mel", 250, "Para dançarmos juntos, mesmo quando um de nós errar o passo.", "", "", "sim", 22],
  ["p23", "Dia de descanso dos recém-casados", "Lua de Mel", 350, "Para desacelerar depois de organizar cada detalhe do casamento.", "", "", "sim", 23],
  ["p24", "Noite da pizza", "Lua de Mel", 180, "Para cozinhar juntos ou pedir aquela pizza sem culpa.", "", "", "sim", 24],
  ["p25", "Um passeio surpresa", "Lua de Mel", 250, "Para sair da rotina e criar uma memória inesperada.", "", "", "sim", 25],
  ["p26", "Vale um churrasco na nossa casa", "Lua de Mel", 200, "Uma contribuição oficial para garantir que sempre te convidaremos.", "", "", "sim", 26],
  ["p27", "Fundo para nossas disputas de jogos", "Lua de Mel", 180, "Para jogos, risadas e uma competição saudável (ou quase).", "", "", "sim", 27],
  ["p28", "Café da manhã na cama", "Lua de Mel", 200, "Para surpreender um ao outro sem precisar sair do quarto.", "", "", "sim", 28],
  ["p29", "Vale o primeiro lugar na fila do jantar", "Lua de Mel", 150, "Vamos garantir que você seja a primeira pessoa a ser servida no jantar do Buffet.", "", "", "sim", 29],
  ["p30", "Uma escapadinha a dois", "Lua de Mel", 350, "Para um passeio especial e um tempo só nosso.", "", "", "sim", 30],
  ["p31", "Ajuda para organizar a casa", "Casa", 250, "Para transformar caixas e bagunça em um lar cheio de personalidade.", "", "", "sim", 31],
  ["p32", "ANTI - TPM", "Cota divertida", 180, "Para que o noivo sobreviva a esse período", "", "", "sim", 32],
  ["p33", "Paz na escolha do filme", "Cota divertida", 200, "Para ver o filme que os dois escolherem sem passar uma hora procurando.", "", "", "sim", 33],
  ["p34", "Fundo contra a louça acumulada", "Casa", 250, "Uma contribuição para ajudar a comprar nossa máquina de lavar louça", "", "", "sim", 34],
  ["p35", "Mala pronta para novas aventuras", "Lua de Mel", 350, "Para ajudar a preparar a próxima viagem do casal.", "", "", "sim", 35],
  ["p36", "Nosso lar, nosso refúgio", "Casa", 500, "Para investir em detalhes que deixem nossa casa ainda mais acolhedora.", "", "", "sim", 36],
  ["p37", "Fundo para realizar um sonho", "Lua de Mel", 800, "Uma contribuição para transformar um dos nossos planos em realidade.", "", "", "sim", 37],
  ["p38", "Presente para nossa vida inteira", "Lua de Mel", 1000, "Para brindar ao amor, à parceria e a todos os sonhos que ainda vamos realizar juntos.", "", "", "sim", 38],
  ["p39", "Minoxidil para o noivo", "Cota divertida", 250, "Para ajudar o noivo a cuidar do visual e manter a esperança de uma cabeleira de respeito no grande dia! 😂", "", "", "sim", 39]
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

    if (pedido.acao === 'ler') return responder({ ok: true, linhas: ler(aba) });
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
