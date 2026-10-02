/**
 * Gestão de Contratações — Motor de Geração de Slides Executivos de Escopo
 * Padrão Corporativo Internacional (16:9 - 720 x 405 pt)
 * Paleta e Identidade Visual: DS_CN (Montserrat + Open Sans)
 */

/**
 * Escala tipográfica única: cada papel tem um tamanho só, em todos os slides.
 * Antes cada tipo de página escolhia o seu (o corpo ia de 10,5 a 12,5) e quem lia
 * via a letra mudar de um slide para o outro.
 */
const ES_FS = { titulo: 16, subtitulo: 10, corpo: 11.5, rotulo: 9, legenda: 9.5, tabela: 8.5, rodape: 8 };
/** Altura da linha no Slides: métrica da Open Sans (1,362 em) × espaçamento de 110%. */
const ES_ENTRELINHA = 1.5;
/** Margem interna da caixa de texto do Slides (7,2 pt de cada lado), com folga. */
const ES_RECUO = 16;
/** Área útil entre o cabeçalho e o rodapé. */
const ES_AREA = { x: 24, y: 66, w: 672, h: 305 };
/** Cartão com rótulo: o rótulo ocupa 30 pt no topo e o corpo termina 8 pt antes da borda. */
const ES_CARTAO = { topo: 30, base: 8, linhas: 14 };
/** Largura de quebra do corpo: cartão da largura toda, ou coluna de texto ao lado das fotos. */
const ES_LARG = { cheio: 628, lado: 256 };
/** Painel de fotos ao lado dos serviços e faixa de fotos na largura toda. */
const ES_FOTOS = { lado: { x: 340, w: 356, max: 2 }, cheio: { x: 24, w: 672, max: 4 }, minImagem: 110 };

/** Largura de fato disponível para o texto dentro de uma caixa de `largura` pontos. */
function esLarguraUtil_(largura) {
  return Math.max(12, largura - ES_RECUO);
}

/** Largura aproximada do texto, calibrada pelas métricas reais do Open Sans. */
function esLarguraTexto_(texto, fonte) {
  return Array.from(texto).reduce(function (n, c) {
    return n + (
      /\s/.test(c) ? .27 :
      /[ilIj.,:;!'|()[\]\/-]/.test(c) ? .29 :
      /[tfr]/.test(c) ? .39 :
      /[MWmw@%]/.test(c) ? .90 :
      /[A-ZÁÉÍÓÚÃÕÇÂÊÔÀÜ]/.test(c) ? .69 :
      .58
    ) * fonte;
  }, 0);
}

/** Marcador de lista no início da linha: "• ", "- ", "1. " ou "1) ". */
function esEhMarcador_(texto) {
  return /^\s*(?:[•●\-*]|\d+[.)]\s)/.test(texto);
}

/** Quebra em linhas; a continuação de um item de lista sai recuada, alinhada ao texto do item. */
function esQuebrar_(texto, largura, fonte) {
  const linhas = [];
  String(texto || '').split('\n').forEach(function (paragrafo) {
    const raw = paragrafo.trim();
    if (!raw) { linhas.push(''); return; }
    const indent = esEhMarcador_(raw) ? '  ' : '';
    let linha = '';
    raw.split(/\s+/).forEach(function (palavra) {
      if (linha && esLarguraTexto_(linha + ' ' + palavra, fonte) > largura) {
        linhas.push(linha);
        linha = indent;
      }
      Array.from(palavra).forEach(function (c, i) {
        if (i === 0 && linha && linha !== indent) linha += ' ';
        if (esLarguraTexto_(linha + c, fonte) > largura) {
          linhas.push(linha);
          linha = indent;
        }
        linha += c;
      });
    });
    if (linha) linhas.push(linha);
  });
  return linhas;
}

/** Remove linhas em branco nas pontas, que só empurrariam o texto dentro do card. */
function esAparar_(linhas) {
  const out = linhas.slice();
  while (out.length && out[0] === '') out.shift();
  while (out.length && out[out.length - 1] === '') out.pop();
  return out;
}

/** O rótulo só aparece quando acrescenta informação ao título da página. */
function esMostrarBadge_(titulo, badge) {
  return !!badge && String(badge).trim().toUpperCase() !== String(titulo || '').trim().toUpperCase();
}

/** Altura de uma caixa com n linhas, já contando a margem interna. */
function esAlturaTexto_(linhas, fonte) {
  return linhas ? linhas * fonte * ES_ENTRELINHA + ES_RECUO : 0;
}

/** Cartão de texto: 30 pt de topo quando há rótulo, 10 pt quando não há. */
function esAlturaCartao_(linhas, semRotulo) {
  return (semRotulo ? 10 : ES_CARTAO.topo) + esAlturaTexto_(linhas, ES_FS.corpo) + ES_CARTAO.base;
}

/** Corta com reticências o que não pode crescer (cabeçalho, capa); o texto completo está em outra página. */
function esLimitarLinhas_(linhas, max) {
  if (linhas.length <= max) return linhas;
  const r = linhas.slice(0, max);
  r[max - 1] = r[max - 1].slice(0, -2).replace(/\s+$/, '') + '…';
  return r;
}

/** Divide linhas balanceando o final e respeitando quebras de parágrafo, marcadores e sentenças. */
function esFatiarLinhas_(linhas, tamanhoMax) {
  if (linhas.length <= tamanhoMax) return [linhas];
  const resultado = [];
  let i = 0;
  while (i < linhas.length) {
    const restante = linhas.length - i;
    if (restante <= tamanhoMax) {
      resultado.push(linhas.slice(i));
      break;
    }
    let fatia = tamanhoMax;
    if (restante - fatia < 3) {
      // Sobraria muito pouco no final: divide o restante ao meio.
      fatia = Math.ceil(restante / 2);
    } else {
      // Melhor corte entre (fatia - 5) e fatia: linha vazia, depois novo marcador, depois fim de frase.
      const minBusca = Math.max(4, fatia - 5);
      const criterios = [
        function (j) { return linhas[i + j - 1] === '' || linhas[i + j] === ''; },
        function (j) { return esEhMarcador_(linhas[i + j] || ''); },
        function (j) { return /[.!?:]\s*$/.test(linhas[i + j - 1] || ''); }
      ];
      let melhorCorte = -1;
      for (let k = 0; k < criterios.length && melhorCorte === -1; k++) {
        for (let j = fatia; j >= minBusca; j--) if (criterios[k](j)) { melhorCorte = j; break; }
      }
      if (melhorCorte !== -1 && restante - melhorCorte >= 3) fatia = melhorCorte;
    }
    const fatiaLinhas = esAparar_(linhas.slice(i, i + fatia));
    if (fatiaLinhas.length) resultado.push(fatiaLinhas);
    i += fatia;
    while (i < linhas.length && linhas[i] === '') i++;
  }
  return resultado.length ? resultado : [linhas];
}

/** Quebra os blocos de limites em colunas lado a lado; devolve null quando algum não couber. */
function esBlocosCabem_(blocos) {
  const w = (ES_AREA.w - 14 * (blocos.length - 1)) / blocos.length;
  const comLinhas = blocos.map(function (b) {
    return Object.assign({}, b, { linhas: esAparar_(esQuebrar_(b.texto, esLarguraUtil_(w - 28), ES_FS.corpo)) });
  });
  return comLinhas.every(function (b) { return b.linhas.length <= 13; }) ? comLinhas : null;
}

/**
 * Maior arranjo que couber, nesta ordem: os blocos todos lado a lado; senão dois
 * juntos e o terceiro em card próprio; senão cada um em seu card de largura cheia.
 */
function esArranjarLimites_(blocos) {
  const sozinhos = function (bs) { return bs.map(function (b) { return [b]; }); };
  if (blocos.length < 2) return sozinhos(blocos);
  const todos = esBlocosCabem_(blocos);
  if (todos) return [todos];
  if (blocos.length === 3) {
    const particoes = [[[0, 1], [2]], [[0], [1, 2]]];
    for (let i = 0; i < particoes.length; i++) {
      const grupos = particoes[i].map(function (idx) { return idx.map(function (j) { return blocos[j]; }); });
      const par = esBlocosCabem_(grupos.filter(function (g) { return g.length > 1; })[0]);
      if (par) return grupos.map(function (g) { return g.length > 1 ? par : g; });
    }
  }
  return sozinhos(blocos);
}

/**
 * Tira do texto as linhas que cabem numa página e devolve o restante como texto,
 * para a página seguinte quebrá-lo na largura dela (com ou sem fotos ao lado).
 */
function esTomarLinhas_(texto, largura, max) {
  const paragrafos = String(texto).split('\n'), linhas = [];
  for (let i = 0; i < paragrafos.length; i++) {
    const partes = esQuebrar_(paragrafos[i], largura, ES_FS.corpo);
    if (linhas.length + partes.length <= max) { Array.prototype.push.apply(linhas, partes); continue; }
    const cabe = max - linhas.length;
    Array.prototype.push.apply(linhas, partes.slice(0, cabe));
    return { linhas: linhas, resto: [partes.slice(cabe).join(' ')].concat(paragrafos.slice(i + 1)).join('\n') };
  }
  return { linhas: linhas, resto: '' };
}

/** Largura de cada foto, legendas quebradas e altura da caixa de imagem que sobra acima delas. */
function esLayoutFotos_(fotos, largura) {
  const n = fotos.length, gap = 16, w = (largura - gap * (n - 1)) / n;
  const legendas = fotos.map(function (f) { return f.legenda ? esQuebrar_(f.legenda, w - 12 - ES_RECUO, ES_FS.legenda) : []; });
  const hLegenda = Math.max.apply(null, legendas.map(function (l) { return esAlturaTexto_(l.length, ES_FS.legenda); }));
  return { w: w, gap: gap, legendas: legendas, hLegenda: hLegenda, hImagem: ES_AREA.h - 12 - 18 - hLegenda };
}

/** Quantas fotos cabem na próxima página sem a legenda espremer a imagem. */
function esTomarFotos_(fotos, painel) {
  let n = Math.min(painel.max, fotos.length);
  while (n > 1 && esLayoutFotos_(fotos.slice(0, n), painel.w).hImagem < ES_FOTOS.minImagem) n--;
  return fotos.splice(0, n);
}

/**
 * Largura e altura lidas do cabeçalho PNG/JPEG, com a rotação EXIF da câmera aplicada.
 * O Slides encaixa a imagem mantendo a proporção; sabendo o tamanho real, a legenda
 * fica colada na foto e não na borda da moldura. Devolve null se não reconhecer.
 */
function esDimensoesImagem_(blob) {
  let b;
  try { b = blob && blob.getBytes(); } catch (e) { return null; }
  if (!b || b.length < 24) return null;
  const u = function (i) { return b[i] & 255; };
  if (u(0) === 137 && u(1) === 80 && u(2) === 78 && u(3) === 71) {
    const w = (u(16) << 24 | u(17) << 16 | u(18) << 8 | u(19)) >>> 0, h = (u(20) << 24 | u(21) << 16 | u(22) << 8 | u(23)) >>> 0;
    return w && h ? { w: w, h: h } : null;
  }
  if (u(0) !== 255 || u(1) !== 216) return null;
  let i = 2, girada = false;
  while (i + 9 < b.length) {
    if (u(i) !== 255) return null;
    const m = u(i + 1);
    if (m === 255) { i++; continue; }
    const tam = u(i + 2) << 8 | u(i + 3);
    if (m === 0xE1 && u(i + 4) === 0x45 && u(i + 5) === 0x78 && u(i + 6) === 0x69 && u(i + 7) === 0x66) girada = esOrientacaoExif_(b, i + 10) >= 5;
    if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) {
      const h = u(i + 5) << 8 | u(i + 6), w = u(i + 7) << 8 | u(i + 8);
      if (!w || !h) return null;
      return girada ? { w: h, h: w } : { w: w, h: h };
    }
    i += 2 + tam;
  }
  return null;
}

/** Orientação EXIF (1 a 8); de 5 a 8 a foto foi tirada de lado e largura e altura se invertem. */
function esOrientacaoExif_(b, t) {
  try {
    const u = function (i) { return b[i] & 255; }, le = u(t) === 0x49;
    const r16 = function (i) { return le ? u(i) | u(i + 1) << 8 : u(i) << 8 | u(i + 1); };
    const r32 = function (i) { return le ? (r16(i) | r16(i + 2) << 16) >>> 0 : (r16(i) << 16 | r16(i + 2)) >>> 0; };
    const ifd = t + r32(t + 4);
    if (ifd + 2 > b.length) return 1;
    const n = r16(ifd);
    for (let k = 0; k < n && ifd + 14 + k * 12 <= b.length; k++) {
      const e = ifd + 2 + k * 12;
      if (r16(e) === 0x0112) return r16(e + 8);
    }
  } catch (e) { /* EXIF ilegível: segue sem rotação */ }
  return 1;
}

/**
 * Planejador de slides com eliminação de linhas órfãs (widows/orphans),
 * combinação de blocos de contexto e ajuste tipográfico adaptativo.
 */
function esPlanejarSlides_(d) {
  const identificacao = [d.megaNome, d.armazem, d.modulos].filter(Boolean).join(' · ');
  // A capa tem uma linha para a identificação; mais do que isso ganha página própria.
  const identificacaoLonga = esQuebrar_(identificacao, 632, 12).length > 1;
  let numeroSecao = 0;
  function secao(titulo, subtitulo) {
    numeroSecao++;
    p.push({ tipo: 'capa-secao', numero: String(numeroSecao).padStart(2, '0'), titulo: titulo, subtitulo: subtitulo });
  }
  // Página única fica no centro da área; continuação começa no topo, como a página anterior.
  function cartoes(titulo, subtitulo, badge, linhas) {
    const paginas = esFatiarLinhas_(esAparar_(linhas), ES_CARTAO.linhas);
    paginas.forEach(function (q, idx) {
      p.push({ tipo: 'card-texto', titulo: titulo, subtitulo: idx ? '(continuação)' : subtitulo, badge: badge, linhas: q,
        fs: ES_FS.corpo, centralizar: paginas.length === 1 });
    });
  }

  // 1. Capa Executiva com Metadados
  const p = [{
    tipo: 'capa',
    titulo: d.titulo,
    subtitulo: identificacaoLonga ? '' : identificacao,
    meta: {
      mega: d.megaNome,
      local: [d.armazem, d.modulos].filter(Boolean).join(' · ') || 'Área Operacional',
      responsavel: d.responsavel || 'A definir pelo solicitante'
    }
  }];

  // 2. Localização do Empreendimento
  const enderecoLongo = esQuebrar_(d.megaNome + '\n' + d.endereco, 349, ES_FS.corpo).length > 4;
  p.push({
    tipo: 'local',
    titulo: 'Localização',
    subtitulo: d.megaNome,
    imagem: d.imagem,
    detalhe: d.detalhe,
    legenda: d.detalhe && d.detalheLegenda ? esQuebrar_(d.detalheLegenda, 264, ES_FS.legenda) : [],
    linhas: esQuebrar_(enderecoLongo ? d.megaNome : d.megaNome + '\n' + d.endereco, 349, ES_FS.corpo)
  });
  if (identificacaoLonga) cartoes('Identificação', d.megaNome, 'IDENTIFICAÇÃO', esQuebrar_(identificacao, ES_LARG.cheio, ES_FS.corpo));
  if (enderecoLongo) cartoes('Localização — endereço', d.megaNome, 'ENDEREÇO', esQuebrar_(d.endereco, ES_LARG.cheio, ES_FS.corpo));

  // 3. Contexto: Objetivo & Resumo da Vistoria
  const linhasObj = esQuebrar_(d.objetivo || '', ES_LARG.cheio, ES_FS.corpo);
  const linhasVist = esQuebrar_(d.vistoria || '', ES_LARG.cheio, ES_FS.corpo);
  if (d.objetivo && d.vistoria && esAlturaCartao_(linhasObj.length) + 14 + esAlturaCartao_(linhasVist.length) <= ES_AREA.h) {
    p.push({ tipo: 'contexto-duplo', titulo: 'Objetivo & Vistoria Técnica', subtitulo: d.megaNome, objetivo: linhasObj, vistoria: linhasVist });
  } else {
    if (d.objetivo) cartoes('Objetivo', d.megaNome, 'OBJETIVO', linhasObj);
    if (d.vistoria) cartoes('Resumo da vistoria', d.megaNome, 'VISTORIA TÉCNICA', linhasVist);
  }

  // 4. Serviços a executar, cada grupo com as suas fotos no mesmo slide.
  // A foto entra no primeiro grupo a que está vinculada, na ordem dos grupos.
  if (d.grupos.length) {
    secao('Serviços a Executar', 'Atividades e registro fotográfico de cada ambiente');
  }
  const fotosDoGrupo = {};
  d.fotos.forEach(function (f) {
    const g = d.grupos.filter(function (x) { return f.grupos.indexOf(x.id) >= 0; })[0];
    if (!g) return;
    (fotosDoGrupo[g.id] = fotosDoGrupo[g.id] || []).push(f);
  });
  d.grupos.forEach(function (g) {
    let resto = g.servicos.split('\n')
      .filter(function (s) { return s.trim(); })
      .map(function (s) { return '• ' + s.trim().replace(/^[•●\-*]\s*/, ''); })
      .join('\n');
    const fotos = (fotosDoGrupo[g.id] || []).map(function (f, i) { return Object.assign({}, f, { numero: i + 1 }); });
    let pagina = 0;
    while (resto || fotos.length) {
      const subtitulo = g.titulo + (pagina++ ? ' (continuação)' : '');
      if (!resto) {
        p.push({ tipo: 'fotos', titulo: 'Registro Fotográfico', subtitulo: subtitulo, fotos: esTomarFotos_(fotos, ES_FOTOS.cheio) });
        continue;
      }
      const lado = esTomarFotos_(fotos, ES_FOTOS.lado), largura = lado.length ? ES_LARG.lado : ES_LARG.cheio;
      // Anti-órfão: a próxima página não fica com 1 ou 2 linhas soltas. A conta usa a largura dela,
      // que é maior quando as fotos do grupo já acabaram.
      const larguraSeguinte = fotos.length ? ES_LARG.lado : ES_LARG.cheio;
      const sobra = function (x) { return x.resto ? esQuebrar_(x.resto, larguraSeguinte, ES_FS.corpo).length : 3; };
      let t = esTomarLinhas_(resto, largura, ES_CARTAO.linhas);
      for (let m = ES_CARTAO.linhas - 1; sobra(t) < 3 && m >= ES_CARTAO.linhas / 2; m--) t = esTomarLinhas_(resto, largura, m);
      p.push({ tipo: 'servicos', titulo: 'Serviços a Executar', subtitulo: subtitulo, linhas: t.linhas, fotos: lado,
        fs: ES_FS.corpo, centralizar: pagina === 1 && !t.resto && !fotos.length });
      resto = t.resto;
    }
  });

  // 5. EAP resumida no próprio deck: o destinatário entende quantidades e referências sem depender do Excel.
  if (d.itens.length) {
    secao('Escopo para Cotação', 'Itens, quantidades e referências que compõem esta revisão');
    const linhasEap = [];
    d.itens.forEach(function (it) {
      const grupo = it.tipo === 'grupo';
      const desc = esQuebrar_(it.descricao, 359, ES_FS.tabela);
      const un = grupo ? [] : esQuebrar_(it.unidade, 34, ES_FS.tabela);
      const ref = grupo ? [] : esQuebrar_(it.referencia, 115, ES_FS.tabela);
      const linhas = Math.ceil(Math.max(desc.length, un.length, ref.length) / 2);
      for (let i = 0; i < linhas; i++) {
        const fatia = function (a) { return a.slice(i * 2, i * 2 + 2).join('\n'); };
        linhasEap.push({ grupo: grupo, codigo: i ? '' : it.codigo, descricao: fatia(desc),
          quantidade: i || grupo ? '' : String(it.quantidade).replace('.', ','), unidade: fatia(un),
          referencia: fatia(ref), continuacao: i > 0 });
      }
    });
    for (let i = 0; i < linhasEap.length; i += 7) {
      p.push({ tipo: 'eap', titulo: 'Escopo para Cotação', subtitulo: i ? 'Itens e quantidades (continuação)' : 'Itens e quantidades da revisão', linhas: linhasEap.slice(i, i + 7) });
    }
  }

  // 6. Divisória de Diretrizes e Condições
  if (d.consideracoes || d.prazo || d.aviso || d.visita) {
    secao('Considerações', 'Requisitos técnicos, prazos, visitas e diretrizes para elaboração da proposta');
  }

  // 7. Considerações Técnicas com Anti-Órfão
  if (d.consideracoes) cartoes('Considerações', 'Requisitos técnicos e operacionais', 'DIRETRIZES', esQuebrar_(d.consideracoes, ES_LARG.cheio, ES_FS.corpo));

  // 8. Limites e aceite: reduz ambiguidades para quem prepara a proposta e para quem recebe o serviço.
  const blocosLimites = [
    { titulo: 'INCLUSÕES', texto: d.inclusoes, cor: 'azul' },
    { titulo: 'EXCLUSÕES', texto: d.exclusoes, cor: 'ambar' },
    { titulo: 'CRITÉRIOS DE ACEITE', texto: d.criteriosAceite, cor: 'verde' }
  ].filter(function (b) { return b.texto; });
  esArranjarLimites_(blocosLimites).forEach(function (grupo) {
    if (grupo.length > 1) {
      p.push({ tipo: 'limites-aceite', titulo: 'Limites e critérios de aceite', subtitulo: 'Referência objetiva para proposta, execução e recebimento', blocos: grupo });
      return;
    }
    // Bloco sozinho vai para a largura toda, quebrado de novo nela, e não na largura da coluna.
    const b = grupo[0];
    cartoes(b.titulo.charAt(0) + b.titulo.slice(1).toLowerCase(), 'Limites e critérios de aceite', b.titulo, esQuebrar_(b.texto, ES_LARG.cheio, ES_FS.corpo));
  });

  // 9. Prazos, Contato e Aviso Final (Consolidado em Cards Executivos)
  if (d.prazo || d.responsavel || d.aviso || d.visita) {
    const aviso = d.aviso || 'Este escopo tem caráter orientativo e serve como base técnica para cotação.';
    const linhasAviso = esQuebrar_(aviso, 284, ES_FS.corpo);
    const linhasPrazo = esQuebrar_(d.prazo || '', 282, ES_FS.corpo);
    if (linhasPrazo.length > 6) cartoes('Prazos', 'Proposta, visita e execução', 'CRONOGRAMA', esQuebrar_(d.prazo, ES_LARG.cheio, ES_FS.corpo));
    if (linhasAviso.length > 11) cartoes('Diretrizes para cotação', d.megaNome, 'AVISO AO PROPONENTE', esQuebrar_(aviso, ES_LARG.cheio, ES_FS.corpo));
    p.push({
      tipo: 'encerramento',
      titulo: 'Prazos e contato',
      subtitulo: d.megaNome,
      // Negrito é mais largo: quebra com folga para não estourar a coluna.
      responsavel: esLimitarLinhas_(esQuebrar_(d.responsavel || 'A definir pelo solicitante', 266, ES_FS.corpo), 5),
      prazo: !d.prazo ? ['A definir pelo solicitante'] : linhasPrazo.length > 6 ? esQuebrar_('Consulte a página de prazos desta revisão.', 282, ES_FS.corpo) : linhasPrazo,
      visita: !!d.visita,
      aviso: linhasAviso.length > 11 ? esQuebrar_('Consulte as diretrizes para cotação nas páginas anteriores.', 284, ES_FS.corpo) : linhasAviso
    });
  }

  return p;
}

/**
 * Renderizador de Slides Corporativos Padrão Internacional (DS_CN).
 */
function esDesenharSlides_(deck, paginas, blobs, meta) {
  deck.getSlides().forEach(function (s) { s.remove(); });
  const cores = DS_CN.colors, fontes = DS_CN.typography;
  const sx = deck.getPageWidth() / 720, sy = deck.getPageHeight() / 405;
  const dimensoes = {};

  function caixa(s, x, y, w, h, t, fs, cor, fundo, bold, fonte, bordaCor, centro) {
    const shape = s.insertShape(SlidesApp.ShapeType.RECTANGLE, x * sx, y * sy, w * sx, h * sy);
    if (bordaCor) {
      shape.getBorder().setWeight(1).getLineFill().setSolidFill(bordaCor);
    } else {
      shape.getBorder().setTransparent();
    }
    if (fundo) shape.getFill().setSolidFill(fundo); else shape.getFill().setTransparent();
    shape.setContentAlignment(SlidesApp.ContentAlignment.TOP);
    if (t === '' || t == null) return shape;
    const text = shape.getText(); text.setText(String(t));
    text.getTextStyle().setFontFamily(fonte || fontes.body).setFontSize((fs || ES_FS.corpo) * sy).setForegroundColor(cor || cores.textBody).setBold(!!bold);
    text.getParagraphStyle().setParagraphAlignment(centro ? SlidesApp.ParagraphAlignment.CENTER : SlidesApp.ParagraphAlignment.START).setLineSpacing(110).setSpaceAbove(0).setSpaceBelow(0);
    return shape;
  }

  // Os três papéis de texto do deck. Nenhum slide escolhe tamanho ou cor por conta própria.
  function cartao(s, x, y, w, h) { caixa(s, x, y, w, h, '', 0, null, cores.bgSlide, false, null, cores.line); }
  function rotulo(s, x, y, w, t, cor, fundo, centro) { caixa(s, x, y, w, 22, t, ES_FS.rotulo, cor || cores.brandLight, fundo, true, fontes.titles, null, centro); }
  function corpo(s, x, y, w, linhas, destaque) {
    caixa(s, x, y, w, esAlturaTexto_(linhas.length, ES_FS.corpo), linhas.join('\n'), ES_FS.corpo, destaque ? cores.textMain : cores.textBody, null, !!destaque);
    return esAlturaTexto_(linhas.length, ES_FS.corpo);
  }
  /**
   * Cartão do tamanho do texto. Página única fica no centro da área, e não presa no alto à esquerda;
   * continuação começa no topo. Sem rótulo, o corpo sobe para o lugar dele.
   */
  function cartaoTexto(s, x, w, titulo, linhas, centralizar, alturaFixa) {
    const h = alturaFixa || esAlturaCartao_(linhas.length, !titulo);
    const y = ES_AREA.y + (centralizar && !alturaFixa ? Math.max(0, (ES_AREA.h - h) / 2) : 0);
    cartao(s, x, y, w, h);
    if (titulo) rotulo(s, x + 14, y + 10, w - 28, titulo);
    corpo(s, x + 14, y + (titulo ? ES_CARTAO.topo : 10), w - 28, linhas);
  }

  function imagem(s, blob, x, y, w, h) {
    if (!blob) return;
    s.insertImage(blob, x * sx, y * sy, w * sx, h * sy);
  }

  function dimensao(ref) {
    if (!(ref in dimensoes)) dimensoes[ref] = esDimensoesImagem_(blobs[ref]);
    return dimensoes[ref];
  }

  /** Fotos lado a lado; cada uma com o número e a legenda logo abaixo da imagem, não da moldura. */
  function painelFotos(s, fotos, painel) {
    const l = esLayoutFotos_(fotos, painel.w);
    fotos.forEach(function (f, i) {
      const x = painel.x + i * (l.w + l.gap), wCaixa = l.w - 12, y = ES_AREA.y + 6;
      cartao(s, x, ES_AREA.y, l.w, ES_AREA.h);
      const dim = dimensao(f.imagem), escala = dim ? Math.min(wCaixa / dim.w, l.hImagem / dim.h) : 0;
      const fw = dim ? dim.w * escala : wCaixa, fh = dim ? dim.h * escala : l.hImagem;
      const fy = y + (l.hImagem - fh) / 2;
      imagem(s, blobs[f.imagem], x + 6 + (wCaixa - fw) / 2, fy, fw, fh);
      rotulo(s, x + 6, fy + fh + 2, wCaixa, 'FOTO ' + f.numero, cores.brandMed, null, true);
      if (l.legendas[i].length) {
        caixa(s, x + 6, fy + fh + 18, wCaixa, esAlturaTexto_(l.legendas[i].length, ES_FS.legenda), l.legendas[i].join('\n'), ES_FS.legenda, cores.textBody, null, false, null, null, true);
      }
    });
  }

  paginas.forEach(function (p, idx) {
    // Parar antes do corte de 6 minutos do Google, para a falha ser registrada e os arquivos limpos.
    if (meta.limite && Date.now() > meta.limite) throw new Error('A geração passou do tempo permitido pelo Google. Reduza a quantidade de fotos ou divida o escopo e tente novamente.');
    const s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
    s.getBackground().setSolidFill(cores.white);

    // ──────────────────────────────────────────
    // 1. CAPA EXECUTIVA
    // ──────────────────────────────────────────
    if (p.tipo === 'capa') {
      s.getBackground().setSolidFill(cores.brandDark);
      imagem(s, blobs.logo, 36, 32, 160, 35);

      // Badge Institucional
      rotulo(s, 36, 76, 340, 'GESTÃO DE CONTRATAÇÕES · ESCOPO DE CONTRATAÇÃO', cores.white, '#1E295B');

      // Título Principal
      let fsTit = 26, lTit = esQuebrar_(p.titulo, 632, fsTit);
      while (esAlturaTexto_(lTit.length, fsTit) > 124 && fsTit > 16) {
        fsTit -= 2; lTit = esQuebrar_(p.titulo, 632, fsTit);
      }
      caixa(s, 36, 104, 648, 124, lTit.join('\n'), fsTit, cores.white, null, true, fontes.titles);

      // Linha de acento azul elétrico
      caixa(s, 36, 234, 648, 3, '', 0, null, cores.brandLight);

      // Subtítulo
      if (p.subtitulo) {
        caixa(s, 36, 244, 648, 32, p.subtitulo, 12, cores.brandSoft);
      }

      // Card de Metadados Executivo no Rodapé
      caixa(s, 36, 280, 648, 84, '', 0, null, '#192455', false, null, '#283675');
      const colunas = [
        { x: 50, titulo: 'EMPREENDIMENTO', linhas: esLimitarLinhas_(esQuebrar_(p.meta.mega, 174, 10.5), 2) },
        { x: 262, titulo: 'LOCAL / ÁREA', linhas: esLimitarLinhas_(esQuebrar_(p.meta.local, 174, 10.5), 2) },
        { x: 474, titulo: 'EMISSÃO & RESPONSÁVEL', linhas: esLimitarLinhas_(esQuebrar_(p.meta.responsavel, 174, 10.5), 1).concat(['R' + meta.revisao + ' · ' + String(meta.data).slice(0, 10)]) }
      ];
      colunas.forEach(function (c) {
        rotulo(s, c.x, 288, 190, c.titulo);
        caixa(s, c.x, 308, 190, esAlturaTexto_(2, 10.5), c.linhas.join('\n'), 10.5, cores.white);
      });
      return;
    }

    // ──────────────────────────────────────────
    // 2. SLIDES DE DIVISÓRIA DE SEÇÃO
    // ──────────────────────────────────────────
    if (p.tipo === 'capa-secao') {
      s.getBackground().setSolidFill(cores.brandDark);
      imagem(s, blobs.logo, 545, 20, 140, 30);

      // Número da Seção Editorial
      caixa(s, 45, 130, 200, 20, 'SEÇÃO ' + p.numero, 11, cores.brandSoft, null, true, fontes.titles);
      caixa(s, 45, 154, 40, 3, '', 0, null, cores.brandLight);

      // Título da Seção
      caixa(s, 45, 168, 630, 50, p.titulo, 27, cores.white, null, true, fontes.titles);

      // Subtítulo
      if (p.subtitulo) {
        caixa(s, 45, 224, 630, 40, p.subtitulo, 13, cores.brandSoft);
      }
      return;
    }

    // ──────────────────────────────────────────
    // 3. CABEÇALHO PADRÃO INTERNACIONAL (LIMPO, COM LOGO PRETA)
    // ──────────────────────────────────────────
    caixa(s, 24, 13, 4, 34, '', 0, null, cores.brandLight);

    // Título e subtítulo sempre do mesmo tamanho; o que não couber em uma linha termina em reticências.
    caixa(s, 34, 6, 500, 26, esLimitarLinhas_(esQuebrar_(p.titulo, 484, ES_FS.titulo), 1).join(''), ES_FS.titulo, cores.textMain, null, true, fontes.titles);
    if (p.subtitulo) {
      caixa(s, 34, 31, 500, 20, esLimitarLinhas_(esQuebrar_(p.subtitulo, 484, ES_FS.subtitulo), 1).join(''), ES_FS.subtitulo, cores.brandMed, null, false);
    }

    // LOGO PRETA OFICIAL À DIREITA (Transparente e limpa)
    if (blobs.logoPreta) {
      imagem(s, blobs.logoPreta, 545, 14, 150, 28);
    } else {
      imagem(s, blobs.logo, 550, 16, 130, 26);
    }

    // Linha divisória fina
    caixa(s, 24, 52, 672, .75, '', 0, null, cores.line);

    // ──────────────────────────────────────────
    // 4. CONTEÚDO ESPECÍFICO POR TIPO
    // ──────────────────────────────────────────

    // A) Localização
    if (p.tipo === 'local') {
      const hTexto = Math.max(esAlturaTexto_(p.linhas.length, ES_FS.corpo), esAlturaTexto_(p.legenda.length, ES_FS.legenda), 60);
      const hImg = ES_AREA.h - 8 - hTexto, yTexto = ES_AREA.y + hImg + 8;
      if (p.detalhe) {
        cartao(s, 24, ES_AREA.y, 280, hImg);
        imagem(s, blobs[p.detalhe], 26, ES_AREA.y + 2, 276, hImg - 4);
        if (p.legenda.length) caixa(s, 24, yTexto, 280, hTexto, p.legenda.join('\n'), ES_FS.legenda, cores.textBody, cores.bgSlide, false, null, cores.line);
      }
      const xImg = p.detalhe ? 324 : 177;
      cartao(s, xImg, ES_AREA.y, 365, hImg);
      imagem(s, blobs[p.imagem], xImg + 2, ES_AREA.y + 2, 361, hImg - 4);
      caixa(s, xImg, yTexto, 365, hTexto, p.linhas.join('\n'), ES_FS.corpo, cores.textBody, cores.bgSlide, false, null, cores.line);
    }

    // B) Contexto Duplo (Objetivo + Vistoria em 2 Cards Executivos)
    else if (p.tipo === 'contexto-duplo') {
      const h1 = esAlturaCartao_(p.objetivo.length), h2 = esAlturaCartao_(p.vistoria.length);
      const y1 = ES_AREA.y + Math.max(0, (ES_AREA.h - h1 - 14 - h2) / 2), y2 = y1 + h1 + 14;
      cartao(s, 24, y1, 672, h1);
      rotulo(s, 38, y1 + 10, 644, 'OBJETIVO DA INTERVENÇÃO');
      corpo(s, 38, y1 + ES_CARTAO.topo, 644, p.objetivo);
      cartao(s, 24, y2, 672, h2);
      rotulo(s, 38, y2 + 10, 644, 'DIAGNÓSTICO DA VISTORIA TÉCNICA');
      corpo(s, 38, y2 + ES_CARTAO.topo, 644, p.vistoria);
    }

    // C) Card Destaque (Objetivo, Vistoria, Considerações e textos longos)
    else if (p.tipo === 'card-texto') {
      cartaoTexto(s, 24, 672, esMostrarBadge_(p.titulo, p.badge) ? p.badge : '', p.linhas, p.centralizar);
    }

    // D) Serviços a Executar, com as fotos do próprio grupo à direita
    else if (p.tipo === 'servicos') {
      if (p.fotos.length) {
        cartaoTexto(s, 24, 300, 'ATIVIDADES A EXECUTAR', p.linhas, false, ES_AREA.h);
        painelFotos(s, p.fotos, ES_FOTOS.lado);
      } else {
        cartaoTexto(s, 24, 672, 'ATIVIDADES A EXECUTAR', p.linhas, p.centralizar);
      }
    }

    // E) EAP resumida — dados técnicos no deck; preços permanecem na planilha de resposta.
    else if (p.tipo === 'eap') {
      const x = [24, 80, 455, 515, 565, 696], yCab = 70, hCab = 24, hLinha = 38;
      ['CÓD.', 'DESCRIÇÃO / SERVIÇO', 'QTD.', 'UN.', 'REFERÊNCIA'].forEach(function (t, c) {
        caixa(s, x[c], yCab, x[c + 1] - x[c], hCab, t, ES_FS.rotulo, cores.white, cores.brandMed, true, fontes.titles);
      });
      p.linhas.forEach(function (r, i) {
        const y = yCab + hCab + i * hLinha, fundo = r.grupo ? cores.brandSoft : (i % 2 ? cores.bgSlide : cores.white);
        const tinta = r.grupo ? cores.brandDark : cores.textBody;
        [r.codigo, r.descricao, r.quantidade, r.unidade, r.referencia].forEach(function (t, c) {
          caixa(s, x[c], y, x[c + 1] - x[c], hLinha, t, ES_FS.tabela, tinta, fundo, r.grupo);
        });
      });
      caixa(s, 24, yCab + hCab + 7 * hLinha + 2, 672, 18, 'Valores e condições comerciais são preenchidos na planilha da mesma revisão.', ES_FS.tabela, cores.textBody);
    }

    // F) Fotos que não couberam ao lado dos serviços do grupo
    else if (p.tipo === 'fotos') {
      painelFotos(s, p.fotos, ES_FOTOS.cheio);
    }

    // G) Limites e critérios de aceite em cards de leitura rápida
    else if (p.tipo === 'limites-aceite') {
      const gap = 14, w = (ES_AREA.w - gap * (p.blocos.length - 1)) / p.blocos.length;
      const hCard = Math.max.apply(null, p.blocos.map(function (b) { return 44 + esAlturaTexto_(b.linhas.length, ES_FS.corpo) + ES_CARTAO.base; }));
      const y = ES_AREA.y + Math.max(0, (ES_AREA.h - hCard) / 2);
      const estilos = {
        azul: { fundo: cores.brandSoft, tinta: cores.brandMed, acento: cores.brandLight },
        ambar: { fundo: cores.amberBg, tinta: cores.amberInk, acento: cores.amberSolid },
        verde: { fundo: cores.greenBg, tinta: cores.greenInk, acento: cores.greenSolid }
      };
      p.blocos.forEach(function (b, i) {
        const x = 24 + i * (w + gap), estilo = estilos[b.cor] || estilos.azul;
        caixa(s, x, y, w, hCard, '', 0, null, cores.white, false, null, cores.line);
        caixa(s, x, y, w, 5, '', 0, null, estilo.acento);
        caixa(s, x + 14, y + 16, w - 28, 22, b.titulo, ES_FS.rotulo, estilo.tinta, estilo.fundo, true, fontes.titles);
        corpo(s, x + 14, y + 44, w - 28, b.linhas);
      });
    }

    // H) Encerramento: Prazos, Contato & Instruções
    else if (p.tipo === 'encerramento') {
      const hAlerta = esAlturaTexto_(2, ES_FS.rotulo);
      const hEsq = 10 + 20 + esAlturaTexto_(p.responsavel.length, ES_FS.corpo) + 8 + 20 + esAlturaTexto_(p.prazo.length, ES_FS.corpo) + ES_CARTAO.base;
      const hDir = 10 + 20 + (p.visita ? hAlerta + 8 : 0) + esAlturaTexto_(p.aviso.length, ES_FS.corpo) + ES_CARTAO.base;
      const hCard = Math.max(hEsq, hDir), y = ES_AREA.y + Math.max(0, (ES_AREA.h - hCard) / 2);

      cartao(s, 24, y, 326, hCard);
      let yE = y + 10;
      rotulo(s, 38, yE, 298, 'RESPONSÁVEL TÉCNICO'); yE += 20;
      yE += corpo(s, 38, yE, 298, p.responsavel, true) + 8;
      rotulo(s, 38, yE, 298, 'PRAZOS PARA PROPOSTA E EXECUÇÃO'); yE += 20;
      corpo(s, 38, yE, 298, p.prazo);

      cartao(s, 368, y, 328, hCard);
      let yD = y + 10;
      rotulo(s, 382, yD, 300, 'DIRETRIZES PARA COTAÇÃO'); yD += 20;
      if (p.visita) {
        caixa(s, 382, yD, 300, hAlerta, 'OBRIGATÓRIA VISITA TÉCNICA PRÉVIA\nPara validação das condições locais antes da proposta.', ES_FS.rotulo, cores.amberInk, cores.amberBg, true, fontes.titles, cores.amberSolid);
        yD += hAlerta + 8;
      }
      corpo(s, 382, yD, 300, p.aviso);
    }

    // ──────────────────────────────────────────
    // 5. RODAPÉ EXECUTIVO
    // ──────────────────────────────────────────
    caixa(s, 24, 382, 672, .75, '', 0, null, cores.line);
    const metaTexto = 'CAPITAL REALTY · ' + (meta.id || '') + ' · R' + meta.revisao + ' · ' + String(meta.data).slice(0, 10);
    caixa(s, 24, 385, 450, 16, metaTexto, ES_FS.rodape, cores.textBody);
    caixa(s, 540, 385, 156, 16, 'PÁGINA ' + (idx + 1) + ' / ' + paginas.length, ES_FS.rodape, cores.brandMed, null, true, fontes.titles);
  });
}
