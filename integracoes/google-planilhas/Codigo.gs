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

function configurar() {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  // A planilha nasce com uma aba só (importada do CSV dos presentes): ela
  // vira a aba Presentes, em vez de ganhar uma vazia ao lado.
  if (!planilha.getSheetByName('Presentes')) {
    var primeira = planilha.getSheets()[0];
    if (chave(primeira.getRange(1, 2).getValue()) === 'titulo') primeira.setName('Presentes');
  }
  Object.keys(CABECALHOS).forEach(function (nome) {
    var aba = planilha.getSheetByName(nome) || planilha.insertSheet(nome);
    if (aba.getLastRow() === 0) {
      aba.appendRow(CABECALHOS[nome]);
      aba.setFrozenRows(1);
      aba.getRange(1, 1, 1, CABECALHOS[nome].length).setFontWeight('bold');
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
