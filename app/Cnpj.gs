/**
 * Capital Fornecedores — identificação de empresa por CNPJ
 *
 * Três fontes, nesta ordem, e a ordem importa:
 *
 *   1. cadastro interno  — instantâneo, é o dado que a operação já corrigiu
 *   2. cache de 24h      — evita repetir a mesma consulta na mesma semana
 *   3. BrasilAPI         — rede, pode falhar, nunca bloqueia o trabalho
 *
 * A base local vem primeiro de propósito. O nome que a operação ajustou à
 * mão vale mais que a razão social crua da Receita, e o cadastro se
 * constrói sozinho a partir das cotações que já são feitas.
 *
 * BrasilAPI é serviço comunitário, sem SLA. Não é "a Receita Federal" —
 * é um agregador dos dados públicos dela. Falha dela nunca impede gravar
 * uma equalização: o comprador digita o nome e segue.
 */

const CF_CNPJ_CACHE_SEG = 24 * 60 * 60;
const CF_CNPJ_URL = 'https://brasilapi.com.br/api/cnpj/v1/';

/** Dígitos verificadores. Evita gastar rede com número digitado errado. */
function cfCnpjValido_(valor) {
  const d = cfSoDigitos_(valor);
  if (d.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(d)) return false;   // 00000000000000 e afins

  const calcula = function (base, pesos) {
    let soma = 0;
    for (let i = 0; i < pesos.length; i++) soma += Number(base[i]) * pesos[i];
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const dv1 = calcula(d, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const dv2 = calcula(d, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return Number(d[12]) === dv1 && Number(d[13]) === dv2;
}

/** Formata para exibição. Devolve o que veio se não tiver 14 dígitos. */
function cfCnpjFormatado_(valor) {
  const d = cfSoDigitos_(valor);
  if (d.length !== 14) return String(valor || '');
  return d.slice(0, 2) + '.' + d.slice(2, 5) + '.' + d.slice(5, 8) +
         '/' + d.slice(8, 12) + '-' + d.slice(12);
}

function cfConsultarCnpj_(valor) {
  const d = cfSoDigitos_(valor);
  if (!cfCnpjValido_(d)) {
    return { achou: false, fonte: 'invalido', erro: 'CNPJ inválido — confira os dígitos.' };
  }

  // 1. cadastro interno
  const local = cfLerTudo_('Fornecedores').filter(function (f) {
    return cfSoDigitos_(f.CNPJ) === d;
  })[0];
  if (local && local.RAZAO_SOCIAL) {
    return {
      achou: true, fonte: 'cadastro', cnpj: d,
      razaoSocial: local.RAZAO_SOCIAL,
      nomeFantasia: local.NOME_FANTASIA || '',
      cidade: local.CIDADE || '', uf: local.UF || '',
      situacao: local.SITUACAO_CNPJ || '', cnae: local.CNAE_PRINCIPAL || '',
      telefone: local.CONTATO_TEL || '', email: local.CONTATO_EMAIL || ''
    };
  }

  // 2. cache
  const cache = CacheService.getScriptCache();
  const guardado = cache.get('cnpj_' + d);
  if (guardado) {
    try {
      const o = JSON.parse(guardado);
      o.fonte = 'cache';
      return o;
    } catch (erro) { /* cache corrompido: segue para a rede */ }
  }

  // 3. BrasilAPI
  let resposta;
  try {
    resposta = UrlFetchApp.fetch(CF_CNPJ_URL + d, {
      muteHttpExceptions: true,
      followRedirects: true,
      validateHttpsCertificates: true
    });
  } catch (erro) {
    return { achou: false, fonte: 'rede', erro: 'Não consegui falar com a Receita agora. Digite o nome à mão.' };
  }

  const codigo = resposta.getResponseCode();
  if (codigo === 404) {
    return { achou: false, fonte: 'receita', erro: 'CNPJ não encontrado na base da Receita.' };
  }
  if (codigo !== 200) {
    return { achou: false, fonte: 'receita', erro: 'A consulta falhou (HTTP ' + codigo + '). Digite o nome à mão.' };
  }

  let dados;
  try {
    dados = JSON.parse(resposta.getContentText());
  } catch (erro) {
    return { achou: false, fonte: 'receita', erro: 'Resposta ilegível da consulta.' };
  }

  const saida = {
    achou: true, fonte: 'receita', cnpj: d,
    razaoSocial: dados.razao_social || '',
    nomeFantasia: dados.nome_fantasia || '',
    cidade: dados.municipio || '',
    uf: dados.uf || '',
    situacao: dados.descricao_situacao_cadastral || '',
    cnae: dados.cnae_fiscal ? (dados.cnae_fiscal + ' — ' + (dados.cnae_fiscal_descricao || '')) : '',
    telefone: dados.ddd_telefone_1 || '',
    email: dados.email || ''
  };

  try { cache.put('cnpj_' + d, JSON.stringify(saida), CF_CNPJ_CACHE_SEG); } catch (erro) {}
  return saida;
}

/**
 * Um campo só: CNPJ ou nome.
 *
 * Com dígitos suficientes, trata como CNPJ e vai à Receita. Com texto,
 * procura no cadastro interno — que é onde estão os fornecedores com quem
 * a empresa já trabalhou, e é a busca que o comprador faz 9 vezes em 10.
 */
function cfBuscarFornecedor_(termo) {
  const bruto = String(termo || '').trim();
  if (bruto.length < 2) return { tipo: 'vazio', achados: [] };

  const digitos = cfSoDigitos_(bruto);

  // Só trata como CNPJ quando o termo é predominantemente numérico: nome de
  // empresa com número ("Alfa 2000") não pode disparar consulta à Receita.
  if (digitos.length >= 11 && digitos.length >= bruto.replace(/\s/g, '').length - 4) {
    const r = cfConsultarCnpj_(digitos);
    return r.achou
      ? { tipo: 'cnpj', achados: [r] }
      : { tipo: 'cnpj', achados: [], erro: r.erro };
  }

  const alvo = cfNormalizar_(bruto);
  const achados = cfLerTudo_('Fornecedores').filter(function (f) {
    const nome = cfNormalizar_(f.RAZAO_SOCIAL || '');
    const fantasia = cfNormalizar_(f.NOME_FANTASIA || '');
    return nome.indexOf(alvo) >= 0 || fantasia.indexOf(alvo) >= 0;
  }).slice(0, 8).map(function (f) {
    return {
      achou: true, fonte: 'cadastro', cnpj: cfSoDigitos_(f.CNPJ),
      razaoSocial: f.RAZAO_SOCIAL || '',
      nomeFantasia: f.NOME_FANTASIA || '',
      cidade: f.CIDADE || '', uf: f.UF || '',
      situacao: f.SITUACAO_CNPJ || '', cnae: f.CNAE_PRINCIPAL || '',
      telefone: f.CONTATO_TEL || '', email: f.CONTATO_EMAIL || ''
    };
  });

  return { tipo: 'nome', achados: achados };
}
