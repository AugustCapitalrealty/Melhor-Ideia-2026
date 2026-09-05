/**
 * Capital Fornecedores — leitura de equalizações em Google Sheets
 *
 * Escrito contra dois arquivos reais (19/05/2026 e 12/08/2026), não contra
 * o template em branco. As duas planilhas têm o mesmo layout em LINHAS
 * DIFERENTES — por isso tudo aqui é localizado por RÓTULO, nunca por
 * número de linha.
 *
 * Comece por analisarEqualizacao(fileId): ela lê e relata sem gravar nada.
 */

// ─────────────────────────────────────────────────────────────
//  Mapa dos rótulos
// ─────────────────────────────────────────────────────────────

/** Cabeçalho: o valor fica na LINHA DE BAIXO do rótulo. */
const CF_ROTULOS_CABECALHO = {
  empresa:            'empresa:',
  empreendimento:     'empreendimento:',
  projeto:            'projeto:',
  grupoCentroCusto:   'grupo centro de custo:',
  dataEqualizacao:    'data da equalizacao:',
  parecerFavoravel:   'favoravel a contratacao e por que?'
};

/** Por proponente: o valor fica À DIREITA, nas colunas E, F, G… */
const CF_ROTULOS_PROPONENTE = {
  codFornecedor:      'cod. fornecedor:',
  razaoSocial:        'razao:',
  contatoNome:        'contato:',
  cidadeUf:           'cidade/estado:',
  contatoTel:         'telefone:',
  cnpj:               'cnpj:',
  contatoEmail:       'email:',
  numeroProposta:     'numero da proposta:',
  dataProposta:       'data da proposta:',
  condicoesPagamento: 'condicoes de pagamento:',
  leadTime:           'lead time para inicio:',
  prazoExecucao:      'prazo de execucao:',
  validade:           'validade proposta:',
  faturamentoDireto:  'faturamento direto:',
  nomeCentroCusto:    'nome centro de custo:',
  dataPrevInicio:     'data prevista para inicio:',
  dataPrevTermino:    'data prevista para termino:',
  propostaInicial:    'proposta inicial:',
  propostaR01:        'proposta r01:',
  propostaR02:        'proposta r02:',
  reducaoTotal:       'reducao total da negociacao:',
  notasCr:            'notas capital realty:'
};

const CF_ROTULO_VALOR_TOTAL   = 'valor total';
const CF_ROTULO_DETALHAMENTO  = 'detalhar o servico a ser aprovado:';
const CF_ROTULO_ANCORA        = 'informacoes obrigatorias';

/** Código de EAP: "1.", "1.1", "1.1.1", "01.", "02.01.03" */
const CF_RE_CODIGO_EAP = /^\d{1,3}(\.\d{1,3})*\.?$/;

// ─────────────────────────────────────────────────────────────
//  Entrada
// ─────────────────────────────────────────────────────────────

/**
 * Lê um arquivo e relata o que encontrou, SEM GRAVAR NADA.
 * É por aqui que se confere um arquivo novo antes de importar.
 */
function analisarEqualizacao(fileId) {
  const id = cfExtrairId_(fileId);

  let ss;
  try {
    ss = SpreadsheetApp.openById(id);
  } catch (erro) {
    throw new Error('Não consegui abrir a planilha "' + id + '". ' +
      'Confira se o ID está certo e se você tem acesso a ela. (' + erro + ')');
  }
  const resultado = { arquivo: ss.getName(), id: fileId, equalizacoes: [], ignoradas: [] };

  ss.getSheets().forEach(function (aba) {
    const grid = aba.getDataRange().getValues();
    if (!cfPareceEqualizacao_(grid)) {
      resultado.ignoradas.push({ aba: aba.getName(), motivo: 'não parece uma equalização' });
      return;
    }
    try {
      resultado.equalizacoes.push(cfLerAba_(grid, aba.getName()));
    } catch (erro) {
      resultado.ignoradas.push({ aba: aba.getName(), motivo: String(erro) });
    }
  });

  cfImprimirAnalise_(resultado);
  return resultado;
}

/**
 * Aceita ID puro ou URL completa do Sheets.
 *
 * Falha com mensagem útil quando vem vazio — que é o que acontece ao rodar
 * esta função pelo menu Executar, porque o Apps Script não passa argumentos.
 */
function cfExtrairId_(entrada) {
  const texto = String(entrada === null || entrada === undefined ? '' : entrada).trim();

  if (!texto) {
    throw new Error(
      'analisarEqualizacao() precisa do ID da planilha, e o menu "Executar" do ' +
      'Apps Script não passa argumentos.\n\n' +
      'Rode "testarLeitura" ou "testarLeituraMeta" — ou crie a sua:\n\n' +
      '  function meuTeste() {\n' +
      '    analisarEqualizacao("COLE_O_ID_AQUI");\n' +
      '  }'
    );
  }

  const naUrl = texto.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]{20,})/);
  if (naUrl) return naUrl[1];

  if (/^[a-zA-Z0-9_-]{20,}$/.test(texto)) return texto;

  throw new Error('Não reconheci "' + texto + '" como ID nem como URL de planilha do Google Sheets.');
}

/** Reconhece a planilha pela âncora do template ou pelo rótulo Razão:. */
function cfPareceEqualizacao_(grid) {
  const alvo = [CF_ROTULO_ANCORA, CF_ROTULOS_PROPONENTE.razaoSocial].map(cfNormalizar_);
  for (let l = 0; l < Math.min(grid.length, 30); l++) {
    for (let c = 0; c < grid[l].length; c++) {
      if (alvo.indexOf(cfNormalizar_(grid[l][c])) >= 0) return true;
    }
  }
  return false;
}

// ─────────────────────────────────────────────────────────────
//  Leitura de uma aba
// ─────────────────────────────────────────────────────────────

function cfLerAba_(grid, nomeAba) {
  const pendencias = [];
  const idx = cfIndexarRotulos_(grid);

  const colunas = cfDetectarColunasProponente_(grid, idx, pendencias);
  if (!colunas.length) {
    const achados = Object.keys(idx).filter(function (k) { return k.length > 3; }).slice(0, 12);
    throw new Error('não achei coluna de proponente. Procurei por "' +
      CF_ROTULOS_PROPONENTE.razaoSocial + '" e "' + CF_ROTULOS_PROPONENTE.cnpj +
      '". Rótulos encontrados na aba: ' + achados.join(' · '));
  }

  const cabecalho  = cfLerCabecalho_(grid, idx);
  const proponentes = cfLerProponentes_(grid, idx, colunas, pendencias);
  const eap        = cfLerEap_(grid, colunas, pendencias);
  const validacao  = cfValidar_(grid, idx, colunas, eap, proponentes, pendencias);

  return {
    aba: nomeAba,
    cabecalho: cabecalho,
    proponentes: proponentes,
    eap: eap,
    validacao: validacao,
    pendencias: pendencias
  };
}

/**
 * Busca um rótulo no índice.
 *
 * Os dois lados passam pela MESMA normalização — foi exatamente aqui que
 * quebrou: "Razão:" normaliza para "razao" (a pontuação cai), mas a
 * constante tinha o dois-pontos e nunca casava.
 */
function cfBuscar_(idx, rotulo) {
  return idx[cfNormalizar_(rotulo)] || null;
}

/**
 * Índice de rótulo → posição. Guarda a PRIMEIRA ocorrência: os rótulos
 * do rodapé vêm mesclados de B a D e repetem o texto em cada célula.
 */
function cfIndexarRotulos_(grid) {
  const idx = {};
  for (let l = 0; l < grid.length; l++) {
    for (let c = 0; c < grid[l].length; c++) {
      const chave = cfNormalizar_(grid[l][c]);
      if (chave && !idx[chave]) idx[chave] = { linha: l, coluna: c };
    }
  }
  return idx;
}

/**
 * Descobre quais colunas são de proponente.
 *
 * NÃO assume E, F, G: parte da linha do rótulo "Razão:" e pega todas as
 * colunas à direita que tenham conteúdo. Assim 4, 5 ou 7 proponentes
 * funcionam sem mudar nada.
 */
function cfDetectarColunasProponente_(grid, idx, pendencias) {
  const ancora = cfBuscar_(idx, CF_ROTULOS_PROPONENTE.razaoSocial) ||
                 cfBuscar_(idx, CF_ROTULOS_PROPONENTE.cnpj);
  if (!ancora) return [];

  const linha = grid[ancora.linha] || [];
  const colunas = [];
  for (let c = ancora.coluna + 1; c < linha.length; c++) {
    if (String(linha[c] || '').trim() !== '') colunas.push(c);
  }

  // Coluna vazia no meio: o fornecedor existe mas a Razão ficou em branco.
  const posCnpj = cfBuscar_(idx, CF_ROTULOS_PROPONENTE.cnpj);
  const linhaCnpj = posCnpj ? grid[posCnpj.linha] : null;
  if (linhaCnpj) {
    for (let c = ancora.coluna + 1; c < linhaCnpj.length; c++) {
      if (String(linhaCnpj[c] || '').trim() !== '' && colunas.indexOf(c) < 0) {
        colunas.push(c);
        pendencias.push({ tipo: 'proponente_sem_razao', descricao: 'Coluna ' + (c + 1) + ' tem CNPJ mas não tem Razão Social.' });
      }
    }
  }
  return colunas.sort(function (a, b) { return a - b; });
}

/** Cabeçalho: valor na linha DE BAIXO do rótulo. */
function cfLerCabecalho_(grid, idx) {
  const saida = {};
  Object.keys(CF_ROTULOS_CABECALHO).forEach(function (campo) {
    const pos = cfBuscar_(idx, CF_ROTULOS_CABECALHO[campo]);
    if (!pos) { saida[campo] = null; return; }
    const abaixo = grid[pos.linha + 1];
    saida[campo] = abaixo ? String(abaixo[pos.coluna] || '').trim() || null : null;
  });
  if (saida.dataEqualizacao) saida.dataEqualizacao = cfData_(saida.dataEqualizacao);
  return saida;
}

/** Proponentes: valor À DIREITA do rótulo, uma coluna por proponente. */
function cfLerProponentes_(grid, idx, colunas, pendencias) {
  const lista = colunas.map(function (col, i) { return { ordem: i + 1, coluna: col }; });

  Object.keys(CF_ROTULOS_PROPONENTE).forEach(function (campo) {
    const pos = cfBuscar_(idx, CF_ROTULOS_PROPONENTE[campo]);
    if (!pos) return;
    const linha = grid[pos.linha] || [];
    lista.forEach(function (p) {
      const bruto = linha[p.coluna];
      p[campo] = (bruto === null || bruto === undefined || String(bruto).trim() === '') ? null : bruto;
    });
  });

  lista.forEach(function (p) {
    p.cnpjLimpo   = cfSoDigitos_(p.cnpj);
    p.razaoSocial = p.razaoSocial ? String(p.razaoSocial).trim() : null;

    if (p.cnpjLimpo && p.cnpjLimpo.length !== 14) {
      pendencias.push({
        tipo: 'cnpj_invalido',
        descricao: 'CNPJ com ' + p.cnpjLimpo.length + ' dígitos no proponente ' + p.ordem + '.',
        dadoBruto: String(p.cnpj)
      });
    }
    // "Golden Phone / Carryer" com dois CNPJs numa coluna só — acontece.
    if (p.cnpjLimpo.length > 14) {
      pendencias.push({ tipo: 'multiplas_empresas', descricao: 'A coluna ' + p.ordem + ' parece ter mais de uma empresa.', dadoBruto: String(p.cnpj) });
    }
    if (p.contatoEmail && String(p.contatoEmail).indexOf('@') < 0) {
      pendencias.push({ tipo: 'email_invalido', descricao: 'E-mail sem @ no proponente ' + p.ordem + '.', dadoBruto: String(p.contatoEmail) });
    }

    ['propostaInicial', 'propostaR01', 'propostaR02', 'reducaoTotal'].forEach(function (c) {
      p[c] = cfNumero_(p[c]);
    });
    ['dataProposta', 'dataPrevInicio', 'dataPrevTermino'].forEach(function (c) {
      p[c] = cfData_(p[c]);
    });

    // "Redução total" vem quebrada quando a inicial está vazia: a fórmula
    // copia o total e reporta 100% de economia. Derivamos sempre.
    const ultima = p.propostaR02 || p.propostaR01;
    p.reducaoCalculada = (p.propostaInicial && ultima) ? p.propostaInicial - ultima : 0;
    if (p.reducaoTotal && !p.propostaInicial) {
      pendencias.push({
        tipo: 'reducao_invalida',
        descricao: 'Proponente ' + p.ordem + ': "Redução total" preenchida sem Proposta inicial. Ignorada.',
        dadoBruto: String(p.reducaoTotal)
      });
      p.reducaoTotal = null;
    }
  });

  // Mesmo CNPJ em duas colunas (aconteceu com a Eletrobarras).
  const vistos = {};
  lista.forEach(function (p) {
    if (!p.cnpjLimpo) return;
    if (vistos[p.cnpjLimpo]) {
      pendencias.push({ tipo: 'cnpj_duplicado', descricao: 'CNPJ repetido nas colunas ' + vistos[p.cnpjLimpo] + ' e ' + p.ordem + '.', dadoBruto: p.cnpj });
    } else {
      vistos[p.cnpjLimpo] = p.ordem;
    }
  });

  return lista;
}

// ─────────────────────────────────────────────────────────────
//  Árvore
// ─────────────────────────────────────────────────────────────

/**
 * Monta a árvore pela PROFUNDIDADE do código (contagem de pontos) e pela
 * ordem de aparição — o código gravado só é guardado para auditoria.
 *
 * Efeito colateral proposital: "2.1" com filhos numerados "2.2.1" entra
 * errado e sai certo, porque a posição manda e o número não.
 */
function cfLerEap_(grid, colunas, pendencias) {
  const nos = [];
  const pilha = [];
  let seq = 0;

  for (let l = 0; l < grid.length; l++) {
    const codigo = String(grid[l][1] || '').trim();     // coluna B
    if (!CF_RE_CODIGO_EAP.test(codigo)) continue;

    const descricao = String(grid[l][2] || '').trim();  // coluna C
    const profundidade = codigo.replace(/\.$/, '').split('.').length - 1;

    const precos = colunas.map(function (col, i) {
      return cfLerPreco_(grid[l][col], i + 1);
    });

    if (!descricao && precos.every(function (p) { return p.valor === null; })) {
      continue;   // linha de placeholder ("1.2.2" sem nada) — some sem alarde
    }

    while (pilha.length && pilha[pilha.length - 1].profundidade >= profundidade) pilha.pop();

    const no = {
      id: 'no' + (++seq),
      idPai: pilha.length ? pilha[pilha.length - 1].id : null,
      ordem: seq,
      profundidade: profundidade,
      codigoOriginal: codigo,
      descricao: descricao,
      precos: precos,
      linha: l + 1
    };
    nos.push(no);
    pilha.push(no);
  }

  cfClassificarNos_(nos, pendencias);
  return nos;
}

/**
 * Lê uma célula de preço.
 *
 * Preço não é sempre número: "INCLUSO", "R$ -" e vazio são três coisas
 * diferentes, e ler vazio como zero já fez uma proposta parecer
 * R$ 182 mil mais barata do que era.
 */
function cfLerPreco_(bruto, ordemProponente) {
  const texto = String(bruto === null || bruto === undefined ? '' : bruto).trim();

  if (texto === '') return { proponente: ordemProponente, valor: null, status: 'nao_cotado', bruto: '' };
  if (/^incluso/i.test(texto)) return { proponente: ordemProponente, valor: null, status: 'incluso_em_outro_item', bruto: texto };
  if (/^n\/?a$/i.test(texto) || /^nao se aplica/i.test(cfNormalizar_(texto))) {
    return { proponente: ordemProponente, valor: null, status: 'nao_aplicavel', bruto: texto };
  }
  // "R$ -" é "não cotou", diferente de "cotou por zero"
  if (/^r?\$?\s*[-–—]\s*$/i.test(texto)) return { proponente: ordemProponente, valor: null, status: 'nao_cotado', bruto: texto };

  const valor = cfNumero_(texto);
  if (valor === null) return { proponente: ordemProponente, valor: null, status: 'nao_cotado', bruto: texto };
  return { proponente: ordemProponente, valor: valor, status: 'cotado', bruto: texto };
}

/**
 * Decide o que é grupo e o que é item.
 *
 * A regra "folha tem preço, pai é soma" não basta: no arquivo de maio,
 * "1.2 MÃO DE OBRA LOCAL" tem R$ 2.200,00 e os cinco filhos estão vazios
 * — é verba fechada com o escopo detalhado embaixo.
 */
function cfClassificarNos_(nos, pendencias) {
  const porPai = {};
  nos.forEach(function (n) {
    if (!n.idPai) return;
    (porPai[n.idPai] = porPai[n.idPai] || []).push(n);
  });

  nos.forEach(function (no) {
    const filhos = porPai[no.id] || [];
    const temPreco = no.precos.some(function (p) { return p.valor !== null; });
    const filhosComPreco = filhos.some(function (f) {
      return f.precos.some(function (p) { return p.valor !== null; });
    });

    if (!filhos.length) {
      no.tipo = 'item';
    } else if (temPreco && !filhosComPreco) {
      no.tipo = 'item';                    // verba fechada
      no.escopoDescritivo = true;
      // Os filhos descrevem o que está incluso na verba. Não são itens
      // cotáveis — contá-los como "sem cotação" gera falso positivo.
      filhos.forEach(function (f) { f.tipo = 'escopo'; });
    } else {
      no.tipo = 'grupo';
    }
  });

  // Reclassificar pode ter marcado como escopo um nó que já era grupo.
  nos.forEach(function (no) {
    if (no.tipo !== 'escopo') return;
    const filhos = porPai[no.id] || [];
    if (filhos.length) filhos.forEach(function (f) { f.tipo = 'escopo'; });
  });
}

// ─────────────────────────────────────────────────────────────
//  Validação
// ─────────────────────────────────────────────────────────────

/**
 * Confere as somas. É aqui que o app pega, sozinho, o que passou por gente:
 * no arquivo de 12/08 o grupo "1." diz R$ 4.050,55 e o VALOR TOTAL diz
 * R$ 4.765,55, porque a fórmula do pai esqueceu o "1.2".
 */
function cfValidar_(grid, idx, colunas, eap, proponentes, pendencias) {
  const TOL = 0.01;
  const saida = { totaisDeclarados: [], divergencias: [] };

  const posTotal = cfBuscar_(idx, CF_ROTULO_VALOR_TOTAL);
  if (posTotal) {
    const linha = grid[posTotal.linha] || [];
    colunas.forEach(function (col, i) {
      saida.totaisDeclarados.push({ proponente: i + 1, valor: cfNumero_(linha[col]) });
    });
  }

  const porPai = {};
  eap.forEach(function (n) {
    if (n.idPai) (porPai[n.idPai] = porPai[n.idPai] || []).push(n);
  });

  // 1) pai declarado x soma dos filhos
  eap.forEach(function (no) {
    if (no.tipo !== 'grupo') return;
    const filhos = porPai[no.id] || [];
    no.precos.forEach(function (preco, i) {
      if (preco.valor === null) return;
      const soma = filhos.reduce(function (acc, f) {
        const p = f.precos[i];
        return acc + (p && p.valor !== null ? p.valor : 0);
      }, 0);
      if (Math.abs(soma - preco.valor) > TOL) {
        const periodo = cfDetectarPeriodicidade_(no, filhos, preco.valor, soma);
        if (periodo) {
          no.derivacaoPeriodica = periodo;
          return;                          // não é defeito: é anual x mensal
        }
        saida.divergencias.push({
          tipo: 'soma_do_grupo',
          no: no.codigoOriginal + ' ' + no.descricao,
          proponente: i + 1,
          declarado: preco.valor,
          somaDosFilhos: soma,
          diferenca: preco.valor - soma
        });
      }
    });
  });

  // 2) VALOR TOTAL x soma das raízes
  const raizes = eap.filter(function (n) { return !n.idPai; });
  saida.totaisDeclarados.forEach(function (t, i) {
    if (t.valor === null) return;
    const soma = raizes.reduce(function (acc, r) {
      const p = r.precos[i];
      return acc + (p && p.valor !== null ? p.valor : 0);
    }, 0);
    if (Math.abs(soma - t.valor) > TOL) {
      saida.divergencias.push({
        tipo: 'valor_total',
        proponente: t.proponente,
        declarado: t.valor,
        somaDasRaizes: soma,
        diferenca: t.valor - soma
      });
    }
  });

  // 3) blocos alternativos: um vende kit integrado, outro vende componentes
  const alternativos = cfDetectarBlocosAlternativos_(eap, colunas.length);
  if (alternativos.length) {
    saida.blocosAlternativos = alternativos;
  }
  const idsAlternativos = {};
  alternativos.forEach(function (b) {
    b.nos.forEach(function (id) { idsAlternativos[id] = true; });
  });

  // 4) cesta incompleta — só sobre itens que TODOS deveriam cotar
  const itens = eap.filter(function (n) {
    return n.tipo === 'item' && !idsAlternativos[n.id];
  });
  colunas.forEach(function (col, i) {
    const naoCotados = itens.filter(function (n) {
      return n.precos[i] && n.precos[i].status === 'nao_cotado';
    });
    if (naoCotados.length && naoCotados.length < itens.length) {
      saida.divergencias.push({
        tipo: 'cesta_incompleta',
        proponente: i + 1,
        naoCotados: naoCotados.length,
        deUmTotalDe: itens.length,
        itens: naoCotados.slice(0, 5).map(function (n) { return n.codigoOriginal + ' ' + n.descricao; })
      });
    }
  });

  saida.diagnostico = cfDiagnosticar_(saida, eap);

  saida.divergencias.forEach(function (d) {
    pendencias.push({ tipo: 'divergencia_' + d.tipo, descricao: JSON.stringify(d) });
  });

  return saida;
}

/**
 * Detecta blocos que os proponentes cotam de forma mutuamente exclusiva.
 *
 * No arquivo de maio: CAS e Alma cotaram sensores, medidores e monitoramento
 * separados; a GreenPulse cotou um KIT integrado. Nenhum "deixou de cotar" —
 * são arquiteturas de solução diferentes. Marcar isso como cesta incompleta
 * é ruído, e ruído numa demo mata a credibilidade da ferramenta.
 */
function cfDetectarBlocosAlternativos_(eap, totalProponentes) {
  const porPai = {};
  eap.forEach(function (n) { if (n.idPai) (porPai[n.idPai] = porPai[n.idPai] || []).push(n); });

  // Quem cotou alguma coisa dentro de cada grupo?
  const grupos = eap.filter(function (n) { return n.tipo === 'grupo'; }).map(function (g) {
    const descendentes = [];
    (function coletar(id) {
      (porPai[id] || []).forEach(function (f) { descendentes.push(f); coletar(f.id); });
    })(g.id);

    const cotaram = {};
    descendentes.forEach(function (d) {
      (d.precos || []).forEach(function (p, i) {
        if (p.status === 'cotado') cotaram[i] = true;
      });
    });
    return { no: g, cotaram: Object.keys(cotaram).map(Number).sort(), descendentes: descendentes };
  }).filter(function (g) { return g.cotaram.length > 0 && g.cotaram.length < totalProponentes; });

  const blocos = [];
  for (let a = 0; a < grupos.length; a++) {
    for (let b = a + 1; b < grupos.length; b++) {
      const A = grupos[a].cotaram, B = grupos[b].cotaram;
      const intersecao = A.filter(function (x) { return B.indexOf(x) >= 0; });
      const uniao = A.concat(B.filter(function (x) { return A.indexOf(x) < 0; }));
      // disjuntos e, juntos, cobrindo todo mundo → são alternativas
      if (intersecao.length === 0 && uniao.length === totalProponentes) {
        const nos = grupos[a].descendentes.concat(grupos[b].descendentes)
          .map(function (n) { return n.id; });
        nos.push(grupos[a].no.id, grupos[b].no.id);
        blocos.push({
          grupos: [grupos[a].no.codigoOriginal + ' ' + grupos[a].no.descricao,
                   grupos[b].no.codigoOriginal + ' ' + grupos[b].no.descricao],
          nos: nos
        });
      }
    }
  }
  return blocos;
}

/**
 * O pai nem sempre é a soma dos filhos.
 *
 * "1. SERVIÇO DE MONITORAMENTO - ANUAL = R$ 828,00" com filho
 * "1.1 MENSAL = R$ 69,00" não está errado: 828 = 69 x 12. O pai é uma
 * DERIVAÇÃO do filho, não um somatório. Tratar como defeito seria um
 * falso positivo constrangedor na frente de quem montou a planilha.
 */
function cfDetectarPeriodicidade_(no, filhos, declarado, soma) {
  if (!soma || !declarado) return null;

  const fator = declarado / soma;
  const inteiro = Math.round(fator);
  if (inteiro < 2 || inteiro > 36) return null;
  if (Math.abs(fator - inteiro) > 0.005) return null;

  const textoPai = cfNormalizar_(no.descricao);
  const textoFilhos = filhos.map(function (f) { return cfNormalizar_(f.descricao); }).join(' ');

  const paiPeriodo   = /\b(anual|ano|semestral|trimestral)\b/.test(textoPai);
  const filhoPeriodo = /\b(mensal|mes|meses|mensalidade|diaria|dia)\b/.test(textoFilhos);

  if (!paiPeriodo && !filhoPeriodo) return null;

  return { fator: inteiro, declarado: declarado, base: soma };
}

/**
 * Junta as divergências em causas-raiz.
 *
 * "Grupo 1. declara menos que os filhos" e "VALOR TOTAL não bate com as
 * raízes" costumam ser o MESMO defeito visto de dois lados: um filho ficou
 * de fora da fórmula do pai. Relatar duas vezes por proponente vira ruído.
 */
function cfDiagnosticar_(validacao, eap) {
  const TOL = 0.01;
  const causas = [];
  const usadas = {};

  validacao.divergencias.forEach(function (g, gi) {
    if (g.tipo !== 'soma_do_grupo') return;
    const par = validacao.divergencias.filter(function (t, ti) {
      return t.tipo === 'valor_total' && t.proponente === g.proponente &&
             Math.abs(Math.abs(t.diferenca) - Math.abs(g.diferenca)) < TOL && !usadas[ti];
    })[0];

    if (par) {
      usadas[validacao.divergencias.indexOf(par)] = true;
      usadas[gi] = true;
      causas.push({
        tipo: 'filho_fora_da_soma_do_pai',
        proponente: g.proponente,
        no: g.no,
        valorEsquecido: Math.abs(g.diferenca),
        explicacao: 'O grupo "' + g.no + '" não inclui um filho na própria soma. ' +
                    'O VALOR TOTAL está correto; a hierarquia é que está errada.'
      });
    }
  });

  validacao.divergencias.forEach(function (d, i) {
    if (usadas[i] || d.tipo === 'cesta_incompleta') return;
    causas.push({ tipo: d.tipo, proponente: d.proponente, explicacao: null, bruto: d });
  });

  // Mesma causa em todos os proponentes = defeito estrutural da planilha,
  // não erro de um fornecedor.
  const porTipo = {};
  causas.forEach(function (c) { (porTipo[c.tipo + '|' + (c.no || '')] = porTipo[c.tipo + '|' + (c.no || '')] || []).push(c); });
  Object.keys(porTipo).forEach(function (k) {
    if (porTipo[k].length > 1) porTipo[k].forEach(function (c) { c.estrutural = porTipo[k].length; });
  });

  return causas;
}

// ─────────────────────────────────────────────────────────────
//  Relatório
// ─────────────────────────────────────────────────────────────

function cfImprimirAnalise_(r) {
  Logger.log('── ' + r.arquivo + ' ──');
  Logger.log(r.equalizacoes.length + ' equalização(ões) · ' + r.ignoradas.length + ' aba(s) ignorada(s)\n');

  r.equalizacoes.forEach(function (e) {
    const itens = e.eap.filter(function (n) { return n.tipo === 'item'; }).length;
    Logger.log('▸ ' + e.aba);
    Logger.log('   ' + (e.cabecalho.empresa || '?') + ' · ' + (e.cabecalho.empreendimento || '?'));
    Logger.log('   ' + e.proponentes.length + ' proponentes · ' + e.eap.length + ' nós (' + itens + ' itens)');

    e.proponentes.forEach(function (p) {
      const t = e.validacao.totaisDeclarados.filter(function (x) { return x.proponente === p.ordem; })[0];
      Logger.log('     ' + p.ordem + '. ' + (p.razaoSocial || '(sem razão)') +
                 '  ' + (t && t.valor !== null ? 'R$ ' + t.valor.toFixed(2) : '—'));
    });

    // Agrupa pelo NÓ, não pelo valor: cada proponente precifica o filho
    // esquecido de um jeito, então os valores diferem e a causa é a mesma.
    const causas = e.validacao.diagnostico || [];
    const porNo = {};
    causas.forEach(function (c) {
      if (c.tipo !== 'filho_fora_da_soma_do_pai') return;
      (porNo[c.no] = porNo[c.no] || []).push(c);
    });

    Object.keys(porNo).forEach(function (no) {
      const grupo = porNo[no];
      const total = e.proponentes.length;
      Logger.log('   ⚠ DEFEITO DE FÓRMULA' +
                 (grupo.length === total ? ' — afeta os ' + total + ' proponentes'
                                         : ' — afeta ' + grupo.length + ' de ' + total));
      Logger.log('      ' + grupo[0].explicacao);
      Logger.log('      Fora da conta: ' + grupo.map(function (c) {
        return 'prop.' + c.proponente + ' R$ ' + c.valorEsquecido.toFixed(2);
      }).join('  ·  '));
      if (grupo.length === total) {
        Logger.log('      Aparecer em todos indica defeito da planilha, não erro de fornecedor.');
      }
    });

    const cestas = e.validacao.divergencias.filter(function (d) { return d.tipo === 'cesta_incompleta'; });
    cestas.forEach(function (d) {
      Logger.log('   ⚠ CESTA INCOMPLETA (prop. ' + d.proponente + '): ' + d.naoCotados +
                 ' de ' + d.deUmTotalDe + ' itens sem cotação');
      d.itens.forEach(function (i) { Logger.log('      · ' + i); });
      Logger.log('      Comparar o total deste proponente com os outros engana.');
    });

    (e.validacao.blocosAlternativos || []).forEach(function (b) {
      Logger.log('   ℹ SOLUÇÕES ALTERNATIVAS: "' + b.grupos[0] + '" e "' + b.grupos[1] + '"');
      Logger.log('      Proponentes cotaram arquiteturas diferentes. Compare pelo total, não item a item.');
    });

    e.eap.filter(function (n) { return n.derivacaoPeriodica; }).forEach(function (n) {
      Logger.log('   ℹ PERIODICIDADE: "' + n.codigoOriginal + ' ' + n.descricao +
                 '" = filho x ' + n.derivacaoPeriodica.fator + '. Não é erro de soma.');
    });

    const outras = causas.filter(function (c) { return c.tipo !== 'filho_fora_da_soma_do_pai'; });
    outras.forEach(function (c) {
      const d = c.bruto || {};
      Logger.log('   ⚠ ' + String(c.tipo).replace(/_/g, ' ').toUpperCase() +
                 ' (prop. ' + c.proponente + ')' +
                 (d.no ? ' em "' + d.no + '"' : '') +
                 (d.declarado !== undefined ? ': declarado R$ ' + Number(d.declarado).toFixed(2) : '') +
                 (d.somaDosFilhos !== undefined ? ', filhos somam R$ ' + Number(d.somaDosFilhos).toFixed(2) : '') +
                 (d.somaDasRaizes !== undefined ? ', raízes somam R$ ' + Number(d.somaDasRaizes).toFixed(2) : ''));
    });
    if (e.pendencias.length) Logger.log('   ' + e.pendencias.length + ' pendência(s) de revisão');
    Logger.log('');
  });

  r.ignoradas.forEach(function (i) { Logger.log('· ignorada: ' + i.aba + ' — ' + i.motivo); });
}

// ─────────────────────────────────────────────────────────────
//  Atalhos para rodar pelo menu Executar
//
//  O menu do Apps Script não passa argumentos. Estas funções existem
//  só para dar um clique e ver o resultado no Log (Ctrl+Enter).
// ─────────────────────────────────────────────────────────────

/** Equalização de 12/08/2026 — a que tem o bug de soma no grupo "1.". */
function testarLeitura() {
  return analisarEqualizacao('1iOz9t7xjk19UxCkEP7t-v1yzCOk6HMTR4Qfp9mfCNF4');
}

/** Equalização de 19/05/2026 — três abas, uma por escopo. */
function testarLeituraMeta() {
  return analisarEqualizacao('1TaqCghQpf2xmNWhiSX0u7orW4Sw_9lum8Qiid9rv_I4');
}
