/**
 * Capital Fornecedores — utilitários
 *
 * Coisas pequenas que o resto do código usa o tempo todo.
 * Nada aqui conhece regra de negócio.
 */

// ─────────────────────────────────────────────────────────────
//  Concorrência
// ─────────────────────────────────────────────────────────────

/**
 * Envolve uma escrita em trava de script.
 *
 * Sheets não tem transação: dois usuários gravando ao mesmo tempo
 * corrompem linha em silêncio. Toda escrita passa por aqui.
 */
function cfComTrava_(fn, segundos) {
  const trava = LockService.getScriptLock();
  if (!trava.tryLock((segundos || 30) * 1000)) {
    throw new Error('Outra operação está em andamento. Tente de novo em alguns segundos.');
  }
  try {
    return fn();
  } finally {
    trava.releaseLock();
  }
}

// ─────────────────────────────────────────────────────────────
//  Texto
// ─────────────────────────────────────────────────────────────

/**
 * Chave de busca: minúscula, sem acento, sem pontuação, espaço colapsado.
 *
 * É o que faz "Café Melita 500G" e "café melitta 500g" se aproximarem.
 * Não resolve marca diferente (Pato x Coala) — isso é decisão humana.
 */
function cfNormalizar_(texto) {
  if (texto === null || texto === undefined) return '';
  return String(texto)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')  // tira acento
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** CNPJ com só dígitos. O acervo tem "44.983.675 0001-73", sem a barra. */
function cfSoDigitos_(valor) {
  return String(valor === null || valor === undefined ? '' : valor).replace(/\D/g, '');
}

/** Formata CNPJ para exibição. Devolve o original se não tiver 14 dígitos. */
function cfFormatarCnpj_(valor) {
  const d = cfSoDigitos_(valor);
  if (d.length !== 14) return String(valor || '');
  return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

// ─────────────────────────────────────────────────────────────
//  Números e datas
// ─────────────────────────────────────────────────────────────

/**
 * Lê número em formato brasileiro ou americano, ou já numérico.
 * Devolve null quando não é número — nunca 0, porque no acervo
 * "não cotou" e "cotou por zero" são coisas diferentes.
 */
function cfNumero_(valor) {
  if (valor === null || valor === undefined || valor === '') return null;
  if (typeof valor === 'number') return isNaN(valor) ? null : valor;

  let s = String(valor).trim()
    .replace(/R\$/gi, '')
    .replace(/\s/g, '')
    .replace(/[()]/g, '');           // (1.234,56) aparece como negativo no acervo

  if (!s || /^[-–—]$/.test(s)) return null;

  const temVirgula = s.indexOf(',') >= 0;
  const temPonto = s.indexOf('.') >= 0;
  if (temVirgula && temPonto) {
    // "1.234,56" (BR) ou "1,234.56" (US) — o último separador manda
    s = s.lastIndexOf(',') > s.lastIndexOf('.')
      ? s.replace(/\./g, '').replace(',', '.')
      : s.replace(/,/g, '');
  } else if (temVirgula) {
    s = s.replace(',', '.');
  }

  const n = Number(s);
  return isNaN(n) ? null : n;
}

/** Lê data de Date, serial do Sheets ou texto dd/mm/aaaa. Devolve null se não der. */
function cfData_(valor) {
  if (!valor && valor !== 0) return null;
  if (valor instanceof Date) return isNaN(valor.getTime()) ? null : valor;

  if (typeof valor === 'number') {                     // serial do Sheets
    const d = new Date(Date.UTC(1899, 11, 30) + valor * 86400000);
    return isNaN(d.getTime()) ? null : d;
  }

  const m = String(valor).trim().match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (m) {
    let ano = Number(m[3]);
    if (ano < 100) ano += 2000;
    const d = new Date(ano, Number(m[2]) - 1, Number(m[1]));
    return isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(valor);
  return isNaN(d.getTime()) ? null : d;
}

// ─────────────────────────────────────────────────────────────
//  Identidade e registro
// ─────────────────────────────────────────────────────────────

/** Quem está usando. Funciona porque o deployment é "executar como eu". */
function cfUsuario_() {
  try {
    return Session.getActiveUser().getEmail() || 'desconhecido';
  } catch (erro) {
    return 'desconhecido';
  }
}

/** ID único e legível: EQU-20260905-A3F2 */
function cfNovoId_(prefixo) {
  const agora = new Date();
  const data = Utilities.formatDate(agora, 'America/Sao_Paulo', 'yyyyMMdd');
  const aleatorio = Utilities.getUuid().replace(/-/g, '').slice(0, 4).toUpperCase();
  return prefixo + '-' + data + '-' + aleatorio;
}

/** Hash do conteúdo de um arquivo — impede reimportar o mesmo duas vezes. */
function cfHash_(conteudo) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(conteudo));
  return bytes.map(function (b) {
    return ('0' + (b & 0xFF).toString(16)).slice(-2);
  }).join('');
}

/** Grava uma linha na aba Log. Nunca derruba a operação principal. */
function cfLog_(acao, entidade, idAlvo, detalhe) {
  try {
    const aba = cfPlanilha_().getSheetByName('Log');
    if (!aba) return;
    aba.appendRow([new Date(), cfUsuario_(), acao, entidade || '', idAlvo || '', detalhe || '']);
  } catch (erro) {
    Logger.log('CF: não consegui gravar no Log — ' + erro);
  }
}
