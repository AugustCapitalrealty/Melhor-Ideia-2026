/**
 * Gestão de Contratações — Motor de Geração de Slides Executivos de Escopo
 * Padrão Corporativo Internacional (16:9 - 720 x 405 pt)
 * Paleta e Identidade Visual: DS_CN (Montserrat + Open Sans)
 */

/** Recuo interno que o Google Slides reserva dentro de qualquer caixa de texto. */
const ES_RECUO_TEXTBOX = 14;

/** Largura de fato disponível para o texto dentro de uma caixa de `largura` pontos. */
function esLarguraUtil_(largura) {
  return Math.max(12, largura - ES_RECUO_TEXTBOX);
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

function esQuebrar_(texto, largura, fonte) {
  const linhas = [];
  String(texto || '').split('\n').forEach(function (paragrafo) {
    const raw = paragrafo.trim();
    if (!raw) { linhas.push(''); return; }
    const ehBullet = esEhMarcador_(raw);
    const indent = ehBullet ? '  ' : '';
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

/** Divide linhas balanceando o final e respeitando quebras de parágrafo, marcadores e sentenças. */
function esFatiarLinhas_(linhas, tamanhoMax) {
  if (linhas.length <= tamanhoMax) return [linhas];
  const resultado = [];
  let i = 0;
  while (i < linhas.length) {
    let restante = linhas.length - i;
    if (restante <= tamanhoMax) {
      resultado.push(linhas.slice(i));
      break;
    }
    let fatia = tamanhoMax;
    // Se sobrar muito pouco no final (< 3), tenta equilibrar
    if (restante - fatia < 3) {
      fatia = Math.ceil(restante / 2);
    } else {
      // Procura o melhor ponto de quebra semântica entre (fatia - 5) e fatia
      const minBusca = Math.max(4, fatia - 5);
      let melhorCorte = -1;
      
      // Prioridade 1: Quebra em linha vazia (espaço entre parágrafos)
      for (let j = fatia; j >= minBusca; j--) {
        if (linhas[i + j - 1] === '' || linhas[i + j] === '') {
          melhorCorte = j;
          break;
        }
      }
      
      // Prioridade 2: Quebra antes de um novo marcador de lista (bullet)
      if (melhorCorte === -1) {
        for (let j = fatia; j >= minBusca; j--) {
          if (esEhMarcador_(linhas[i + j] || '')) {
            melhorCorte = j;
            break;
          }
        }
      }
      
      // Prioridade 3: Quebra em final de sentença (. ! ? :)
      if (melhorCorte === -1) {
        for (let j = fatia; j >= minBusca; j--) {
          if (/[.!?:]\s*$/.test(linhas[i + j - 1] || '')) {
            melhorCorte = j;
            break;
          }
        }
      }
      
      if (melhorCorte !== -1 && restante - melhorCorte >= 3) {
        fatia = melhorCorte;
      }
    }
    
    // Limpeza de linhas vazias no início e fim da fatia
    let fatiaLinhas = linhas.slice(i, i + fatia);
    while (fatiaLinhas.length && fatiaLinhas[0] === '') fatiaLinhas.shift();
    while (fatiaLinhas.length && fatiaLinhas[fatiaLinhas.length - 1] === '') fatiaLinhas.pop();
    
    if (fatiaLinhas.length) resultado.push(fatiaLinhas);
    i += fatia;
    while (i < linhas.length && linhas[i] === '') i++;
  }
  return resultado.length ? resultado : [linhas];
}

const ES_CARD_W = 644;          // largura da caixa de texto dos cards de largura cheia
const ES_CARD_H = 280;          // altura útil do card sem badge
const ES_CARD_H_BADGE = 255;    // altura útil quando o badge ocupa o topo
// Corpos candidatos: o texto cresce quando sobra espaço, mas para em 14 para não
// destoar dos slides vizinhos (serviços a 12,5pt e contexto duplo a 11,5pt).
const ES_CARD_FS = [14, 13, 12];
const ES_CARD_MAX = 16;         // linhas por página quando é preciso paginar a 12pt
const ES_ENTRELINHA = 1.15;     // altura de linha efetiva (espaçamento de 110% + folga)

/** O badge só aparece quando acrescenta informação ao título da página. */
function esMostrarBadge_(titulo, badge) {
  return !!badge && String(badge).trim().toUpperCase() !== String(titulo || '').trim().toUpperCase();
}

/** Remove linhas em branco nas pontas, que só empurrariam o texto dentro do card. */
function esAparar_(linhas) {
  const out = linhas.slice();
  while (out.length && out[0] === '') out.shift();
  while (out.length && out[out.length - 1] === '') out.pop();
  return out;
}

/**
 * Card de texto de largura cheia: usa o maior corpo em que o conteúdo inteiro cabe
 * em uma página só — e, quando não couber de jeito nenhum, pagina a 12pt.
 * Página única sai centralizada na vertical para não deixar o card oco embaixo.
 */
function esPaginarCard_(texto, base) {
  const largura = esLarguraUtil_(ES_CARD_W);
  const altura = esMostrarBadge_(base.titulo, base.badge) ? ES_CARD_H_BADGE : ES_CARD_H;
  function pagina(linhas, fs, idx, unica) {
    return {
      tipo: 'card-texto', titulo: base.titulo, badge: base.badge,
      subtitulo: idx ? '(continuação)' : base.subtitulo,
      linhas: linhas, fs: fs, centralizar: !!unica
    };
  }
  for (let i = 0; i < ES_CARD_FS.length; i++) {
    const fs = ES_CARD_FS[i], linhas = esAparar_(esQuebrar_(texto, largura, fs));
    if (linhas.length <= ES_CARD_MAX && linhas.length * fs * ES_ENTRELINHA <= altura) {
      return [pagina(linhas, fs, 0, true)];
    }
  }
  return esFatiarLinhas_(esQuebrar_(texto, largura, 12), ES_CARD_MAX).map(function (q, idx) {
    return pagina(q, 12, idx, false);
  });
}

const ES_LIMITES_H = 235;   // altura da área de texto dentro de cada card colorido
const ES_LIMITES_GAP = 14;  // respiro entre as colunas

/** Geometria de uma coluna de limites: corpo, largura útil e linhas que cabem. */
function esColunaLimites_(n) {
  const w = (672 - ES_LIMITES_GAP * (n - 1)) / n, fs = n <= 2 ? 11 : 10;
  return { fs: fs, largura: esLarguraUtil_(w - 28), max: Math.floor((ES_LIMITES_H - 24) / (fs * ES_ENTRELINHA)) };
}

/** Quebra os blocos na largura da coluna; devolve null quando algum não couber. */
function esBlocosCabem_(blocos) {
  const col = esColunaLimites_(blocos.length);
  const comLinhas = blocos.map(function (b) {
    return Object.assign({}, b, { linhas: esAparar_(esQuebrar_(b.texto, col.largura, col.fs)) });
  });
  const cabem = comLinhas.every(function (b) { return b.linhas.length <= col.max; });
  return cabem ? { blocos: comLinhas, fs: col.fs } : null;
}

/**
 * Maior arranjo que couber, nesta ordem: os blocos todos lado a lado; senão dois
 * juntos e o terceiro em card próprio; senão cada um em seu card de largura cheia.
 */
function esArranjarLimites_(blocos) {
  if (blocos.length < 2) return blocos.map(function (b) { return { blocos: [b] }; });
  const todos = esBlocosCabem_(blocos);
  if (todos) return [todos];
  if (blocos.length === 3) {
    const particoes = [[[0, 1], [2]], [[0], [1, 2]]];
    for (let i = 0; i < particoes.length; i++) {
      const grupos = particoes[i].map(function (idx) {
        return idx.map(function (j) { return blocos[j]; });
      });
      const par = grupos.filter(function (g) { return g.length > 1; })[0];
      const ajustado = esBlocosCabem_(par);
      if (ajustado) {
        return grupos.map(function (g) { return g.length > 1 ? ajustado : { blocos: g }; });
      }
    }
  }
  return blocos.map(function (b) { return { blocos: [b] }; });
}

const ES_FOTO_LEGENDA_FS = 9;
const ES_FOTO_LEGENDA_MAX = 120;

/** Largura de cada foto no slide e altura reservada para as descrições abaixo delas. */
function esLayoutFotos_(fotos) {
  const n = fotos.length, gap = 16, wFoto = (672 - gap * (n - 1)) / n;
  const legendas = fotos.map(function (f) { return f.legenda ? esQuebrar_(f.legenda, esLarguraUtil_(wFoto - 16), ES_FOTO_LEGENDA_FS) : []; });
  const maxLinhas = Math.max.apply(null, legendas.map(function (l) { return l.length; }));
  return { wFoto: wFoto, gap: gap, legendas: legendas, hLegenda: maxLinhas ? Math.ceil(maxLinhas * ES_FOTO_LEGENDA_FS * 1.3 + 12) : 0 };
}

/**
 * Planejador de slides com eliminação de linhas órfãs (widows/orphans),
 * combinação de blocos de contexto e ajuste tipográfico adaptativo.
 */
function esPlanejarSlides_(d) {
  const identificacao = [d.megaNome, d.armazem, d.modulos].filter(Boolean).join(' · ');
  const identificacaoLonga = esQuebrar_(identificacao, 620, 13).length > 3;
  let numeroSecao = 0;
  function secao(titulo, subtitulo) {
    numeroSecao++;
    p.push({ tipo: 'capa-secao', numero: String(numeroSecao).padStart(2, '0'), titulo: titulo, subtitulo: subtitulo });
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
  const enderecoLongo = esQuebrar_(d.megaNome + '\n' + d.endereco, 343, 11).length > 4;
  p.push({
    tipo: 'local',
    titulo: 'Localização',
    subtitulo: d.megaNome,
    imagem: d.imagem,
    detalhe: d.detalhe,
    legenda: d.detalheLegenda,
    texto: enderecoLongo ? d.megaNome : d.megaNome + '\n' + d.endereco
  });
  if (identificacaoLonga) {
    esPaginarCard_(identificacao, { titulo: 'Identificação', subtitulo: d.megaNome, badge: 'IDENTIFICAÇÃO' })
      .forEach(function (pag) { p.push(pag); });
  }
  if (enderecoLongo) {
    esPaginarCard_(d.endereco, { titulo: 'Localização — endereço', subtitulo: d.megaNome, badge: 'ENDEREÇO' })
      .forEach(function (pag) { p.push(pag); });
  }

  // 3. Contexto: Objetivo & Resumo da Vistoria
  // Os dois cards do slide duplo têm 644pt de caixa e corpo 11,5 — quebrar com outra medida estouraria a moldura.
  const linhasObj = esQuebrar_(d.objetivo || '', esLarguraUtil_(ES_CARD_W), 11.5);
  const linhasVist = esQuebrar_(d.vistoria || '', esLarguraUtil_(ES_CARD_W), 11.5);
  const totalLinhasContexto = (d.objetivo ? linhasObj.length + 3 : 0) + (d.vistoria ? linhasVist.length + 3 : 0);

  if (d.objetivo && d.vistoria && totalLinhasContexto <= 18 && linhasObj.length <= 7 && linhasVist.length <= 8) {
    // Ambos cabem perfeitamente em um slide executivo duplo!
    p.push({
      tipo: 'contexto-duplo',
      titulo: 'Objetivo & Vistoria Técnica',
      subtitulo: d.megaNome,
      objetivo: linhasObj,
      vistoria: linhasVist
    });
  } else {
    // Se muito longos, divide em cards dedicados com paginação anti-órfão
    if (d.objetivo) {
      esPaginarCard_(d.objetivo, { titulo: 'Objetivo', subtitulo: d.megaNome, badge: 'OBJETIVO' })
        .forEach(function (pag) { p.push(pag); });
    }
    if (d.vistoria) {
      esPaginarCard_(d.vistoria, { titulo: 'Resumo da vistoria', subtitulo: d.megaNome, badge: 'VISTORIA TÉCNICA' })
        .forEach(function (pag) { p.push(pag); });
    }
  }

  // 4. Divisória de Serviços a Executar
  if (d.grupos.length) {
    secao('Serviços a Executar', 'Detalhamento das atividades e escopo técnico por ambiente');
  }

  // 5. Grupos de Serviços com Prevenção de Órfãos
  d.grupos.forEach(function (g) {
    const topicos = g.servicos.split('\n')
      .filter(function (s) { return s.trim(); })
      .map(function (s) { return '• ' + s.replace(/^[•●\-*]\s*/, ''); });

    const textoCompleto = topicos.join('\n');
    // A quebra usa o mesmo corpo em que o texto será desenhado, senão a linha estoura a caixa.
    const larguraServ = esLarguraUtil_(ES_CARD_W);
    let fsServ = 12.5, linhasServicos = esQuebrar_(textoCompleto, larguraServ, fsServ);
    if (linhasServicos.length > 13) {
      fsServ = 11;
      linhasServicos = esQuebrar_(textoCompleto, larguraServ, fsServ);
    }

    // Se tiver até 20 linhas, mantém no mesmo slide com layout compacto
    if (linhasServicos.length <= 20) {
      p.push({
        tipo: 'servicos',
        titulo: 'Serviços a Executar',
        subtitulo: g.titulo,
        linhas: linhasServicos,
        fs: fsServ,
        compacto: fsServ === 11
      });
    } else {
      // Divide de forma balanceada sem deixar 1 ou 2 linhas órfãs
      const quebras = esFatiarLinhas_(linhasServicos, 16);
      quebras.forEach(function (q, idx) {
        p.push({
          tipo: 'servicos',
          titulo: 'Serviços a Executar',
          subtitulo: g.titulo + (idx ? ' (continuação)' : ''),
          linhas: q,
          fs: fsServ,
          compacto: fsServ === 11
        });
      });
    }
  });

  // 6. EAP resumida no próprio deck: o destinatário entende quantidades e referências sem depender do Excel.
  if (d.itens.length) {
    secao('Escopo para Cotação', 'Itens, quantidades e referências que compõem esta revisão');
    const linhasEap = [];
    d.itens.forEach(function (it) {
      const grupo = it.tipo === 'grupo';
      // Grupo e item dividem a mesma coluna de descrição (375pt) na tabela renderizada.
      const partes = esQuebrar_(it.descricao, esLarguraUtil_(375), grupo ? 9 : 8.5);
      for (let i = 0; i < partes.length; i += 2) {
        linhasEap.push({ grupo: grupo, codigo: i ? '' : it.codigo, descricao: partes.slice(i, i + 2).join('\n'),
          quantidade: i || grupo ? '' : String(it.quantidade).replace('.', ','), unidade: i || grupo ? '' : it.unidade,
          referencia: i || grupo ? '' : it.referencia, continuacao: i > 0 });
      }
    });
    for (let i = 0; i < linhasEap.length; i += 7) {
      p.push({ tipo: 'eap', titulo: 'Escopo para Cotação', subtitulo: i ? 'Itens e quantidades (continuação)' : 'Itens e quantidades da revisão', linhas: linhasEap.slice(i, i + 7) });
    }
  }

  // 7. Divisória de Registro Fotográfico
  if (d.fotos.length) {
    secao('Registro Fotográfico', 'Evidências visuais levantadas na vistoria técnica de campo');
  }

  // 7. Fotografias Agrupadas (até 4 por slide, cada uma com sua descrição logo abaixo)
  const conjuntos = [];
  d.fotos.forEach(function (f) {
    const chave = JSON.stringify([f.titulo, f.grupos]);
    let ultimo = conjuntos[conjuntos.length - 1];
    if (!ultimo || ultimo.chave !== chave || ultimo.fotos.length === 4 ||
        esLayoutFotos_(ultimo.fotos.concat([f])).hLegenda > ES_FOTO_LEGENDA_MAX) {
      ultimo = { chave: chave, fotos: [], titulo: f.titulo };
      conjuntos.push(ultimo);
    }
    ultimo.fotos.push(f);
  });

  conjuntos.forEach(function (g) {
    const sub = g.titulo ? g.titulo.replace(/^Registro\s+Fotogr[aá]fico\s*[-–—:]*\s*/i, '') : 'Instalações Inspecionadas';
    p.push({ tipo: 'fotos', titulo: 'Registro Fotográfico', subtitulo: sub, fotos: g.fotos });
  });

  // 10. Divisória de Diretrizes e Condições
  if (d.consideracoes || d.prazo || d.aviso || d.visita) {
    secao('Considerações', 'Requisitos técnicos, prazos, visitas e diretrizes para elaboração da proposta');
  }

  // 11. Considerações Técnicas com Anti-Órfão
  if (d.consideracoes) {
    esPaginarCard_(d.consideracoes, { titulo: 'Considerações', subtitulo: 'Requisitos técnicos e operacionais', badge: 'DIRETRIZES' })
      .forEach(function (pag) { p.push(pag); });
  }

  // 12. Limites e aceite: reduz ambiguidades para quem prepara a proposta e para quem recebe o serviço.
  const blocosEntrada = [
    { titulo: 'INCLUSÕES', texto: (d.inclusoes || '').trim(), cor: 'azul' },
    { titulo: 'EXCLUSÕES', texto: (d.exclusoes || '').trim(), cor: 'ambar' },
    { titulo: 'CRITÉRIOS DE ACEITE', texto: (d.criteriosAceite || '').trim(), cor: 'verde' }
  ].filter(function (b) { return b.texto; });

  esArranjarLimites_(blocosEntrada).forEach(function (grupo) {
    if (grupo.blocos.length > 1) {
      p.push({
        tipo: 'limites-aceite',
        titulo: 'Limites e critérios de aceite',
        subtitulo: 'Referência objetiva para proposta, execução e recebimento',
        blocos: grupo.blocos,
        fs: grupo.fs
      });
    } else {
      const b = grupo.blocos[0];
      esPaginarCard_(b.texto, {
        titulo: b.titulo.charAt(0) + b.titulo.slice(1).toLowerCase(),
        subtitulo: 'Limites e critérios de aceite',
        badge: b.titulo
      }).forEach(function (pag) { p.push(pag); });
    }
  });

  // 13. Prazos, Contato e Aviso Final (Consolidado em Cards Executivos)
  if (d.prazo || d.responsavel || d.aviso || d.visita) {
    // Quebra nas larguras úteis das duas colunas do slide de encerramento.
    const linhasAviso = esQuebrar_(d.aviso || 'Este escopo tem caráter orientativo e serve como base técnica para cotação.', esLarguraUtil_(300), 10.5);
    const linhasPrazo = esQuebrar_(d.prazo || '', esLarguraUtil_(290), 11);
    if (linhasPrazo.length > 6) {
      esPaginarCard_(d.prazo, { titulo: 'Prazos', subtitulo: 'Proposta, visita e execução', badge: 'CRONOGRAMA' })
        .forEach(function (pag) { p.push(pag); });
    }
    if (linhasAviso.length > 12) {
      esPaginarCard_(d.aviso, { titulo: 'Diretrizes para cotação', subtitulo: d.megaNome, badge: 'AVISO AO PROPONENTE' })
        .forEach(function (pag) { p.push(pag); });
    }
    p.push({
      tipo: 'encerramento',
      titulo: 'Prazos e contato',
      subtitulo: d.megaNome,
      responsavel: d.responsavel || 'A definir pelo solicitante',
      prazo: !d.prazo ? 'A definir pelo solicitante' : linhasPrazo.length > 6 ? 'Consulte a página de prazos desta revisão.' : d.prazo,
      visita: !!d.visita,
      aviso: linhasAviso.length > 12 ? ['Consulte as diretrizes para cotação nas páginas anteriores.'] : linhasAviso
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

  function caixa(s, x, y, w, h, t, fs, cor, fundo, bold, fonte, bordaCor) {
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
    text.getTextStyle().setFontFamily(fonte || fontes.body).setFontSize((fs || 12) * sy).setForegroundColor(cor || cores.textBody).setBold(!!bold);
    text.getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.START).setLineSpacing(110).setSpaceAbove(0).setSpaceBelow(0);
    return shape;
  }

  function imagem(s, blob, x, y, w, h) {
    if (!blob) return;
    s.insertImage(blob, x * sx, y * sy, w * sx, h * sy);
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
      caixa(s, 36, 78, 290, 18, 'GESTÃO DE CONTRATAÇÕES · ESCOPO DE CONTRATAÇÃO', 8.5, cores.white, '#1E295B', true);

      // Título Principal
      let fsTit = 26, lTit = esQuebrar_(p.titulo, esLarguraUtil_(648), fsTit);
      while (lTit.length * fsTit * 1.2 > 120 && fsTit > 16) {
        fsTit -= 2; lTit = esQuebrar_(p.titulo, esLarguraUtil_(648), fsTit);
      }
      caixa(s, 36, 106, 648, 120, lTit.join('\n'), fsTit, cores.white, null, true, fontes.titles);
      
      // Linha de acento azul elétrico
      caixa(s, 36, 236, 648, 3, '', 10, null, cores.brandLight);

      // Subtítulo
      if (p.subtitulo) {
        caixa(s, 36, 246, 648, 26, p.subtitulo, 12, cores.brandSoft);
      }

      // Card de Metadados Executivo no Rodapé
      caixa(s, 36, 285, 648, 70, '', 10, null, '#192455', false, null, '#283675');
      
      // Coluna 1: Empreendimento
      caixa(s, 50, 295, 190, 14, 'EMPREENDIMENTO', 7.5, cores.brandLight, null, true, fontes.titles);
      caixa(s, 50, 312, 190, 32, p.meta.mega, 10.5, cores.white, null, true);

      // Coluna 2: Local / Armazém
      caixa(s, 255, 295, 200, 14, 'LOCAL / ÁREA', 7.5, cores.brandLight, null, true, fontes.titles);
      caixa(s, 255, 312, 200, 32, p.meta.local, 10.5, cores.white);

      // Coluna 3: Responsável & Revisão
      caixa(s, 470, 295, 200, 14, 'EMISSÃO & RESPONSÁVEL', 7.5, cores.brandLight, null, true, fontes.titles);
      caixa(s, 470, 312, 200, 32, p.meta.responsavel + '\nR' + meta.revisao + ' · ' + String(meta.data).slice(0, 10), 9.5, cores.brandSoft);
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
      caixa(s, 45, 154, 40, 3, '', 10, null, cores.brandLight);

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
    caixa(s, 24, 13, 4, 34, '', 10, null, cores.brandLight);

    const linhasTitulo = esQuebrar_(p.titulo, esLarguraUtil_(500), 16), tituloDuplo = linhasTitulo.length > 1;
    const titFormatado = linhasTitulo.slice(0, 2).join('\n');
    caixa(s, 34, 11, 500, tituloDuplo ? 34 : 22, titFormatado, tituloDuplo ? 14 : 16, cores.textMain, null, true, fontes.titles);
    if (p.subtitulo) {
      caixa(s, 34, tituloDuplo ? 43 : 32, 500, 14, esQuebrar_(p.subtitulo, esLarguraUtil_(500), 10).slice(0, 1).join('\n'), 10, cores.brandMed, null, false);
    }

    // LOGO PRETA OFICIAL À DIREITA (Transparente e limpa)
    if (blobs.logoPreta) {
      imagem(s, blobs.logoPreta, 545, 14, 150, 28);
    } else {
      imagem(s, blobs.logo, 550, 16, 130, 26);
    }

    // Linha divisória fina
    caixa(s, 24, 52, 672, .75, '', 10, null, cores.line);

    // ──────────────────────────────────────────
    // 4. CONTEÚDO ESPECÍFICO POR TIPO
    // ──────────────────────────────────────────

    // A) Localização
    if (p.tipo === 'local') {
      if (p.detalhe) {
        caixa(s, 24, 64, 280, 230, '', 10, null, cores.bgSlide, false, null, cores.line);
        imagem(s, blobs[p.detalhe], 26, 66, 276, 226);
        if (p.legenda) caixa(s, 24, 298, 280, 75, esQuebrar_(p.legenda, 260, 9).join('\n'), 9, cores.textBody, cores.bgSlide, false, null, cores.line);
      }
      const xImg = p.detalhe ? 324 : 170;
      caixa(s, xImg, 64, 365, 230, '', 10, null, cores.bgSlide, false, null, cores.line);
      imagem(s, blobs[p.imagem], xImg + 2, 66, 361, 226);
      caixa(s, xImg, 298, 365, 75, esQuebrar_(p.texto, 340, 10.5).join('\n'), 10.5, cores.textMain, cores.bgSlide, false, null, cores.line);
    }

    // B) Contexto Duplo (Objetivo + Vistoria em 2 Cards Executivos)
    else if (p.tipo === 'contexto-duplo') {
      // Card 1: Objetivo
      caixa(s, 24, 66, 672, 138, '', 10, null, cores.bgSlide, false, null, cores.line);
      caixa(s, 38, 76, 200, 16, 'OBJETIVO DA INTERVENÇÃO', 9, cores.brandLight, null, true, fontes.titles);
      caixa(s, 38, 96, 644, 98, p.objetivo.join('\n'), 11.5, cores.textBody);

      // Card 2: Vistoria Técnica
      caixa(s, 24, 218, 672, 154, '', 10, null, cores.bgSlide, false, null, cores.line);
      caixa(s, 38, 228, 240, 16, 'DIAGNÓSTICO DA VISTORIA TÉCNICA', 9, cores.brandMed, null, true, fontes.titles);
      caixa(s, 38, 248, 644, 114, p.vistoria.join('\n'), 11.5, cores.textBody);
    }

    // C) Card Destaque (Texto amplo e executivo)
    else if (p.tipo === 'card-texto') {
      caixa(s, 24, 66, 672, 305, '', 10, null, cores.bgSlide, false, null, cores.line);
      const mostrarBadge = esMostrarBadge_(p.titulo, p.badge);
      if (mostrarBadge) {
        caixa(s, 38, 78, 280, 18, p.badge, 9, cores.brandLight, null, true, fontes.titles);
      }
      const yTexto = mostrarBadge ? 104 : 80;
      const hTexto = mostrarBadge ? ES_CARD_H_BADGE : ES_CARD_H;
      const corpo = caixa(s, 38, yTexto, ES_CARD_W, hTexto, p.linhas.join('\n'), p.fs || 12, cores.textBody);
      // Página única fica centralizada: sem isso o texto curto deixa o card oco embaixo.
      if (p.centralizar) corpo.setContentAlignment(SlidesApp.ContentAlignment.MIDDLE);
    }

    // D) Serviços a Executar
    else if (p.tipo === 'servicos') {
      const fs = p.fs || (p.compacto ? 11 : 12.5);
      caixa(s, 24, 66, 672, 305, '', 10, null, cores.bgSlide, false, null, cores.line);
      caixa(s, 38, 76, 644, 18, 'LISTA DE ATIVIDADES A EXECUTAR', 8.5, cores.brandLight, null, true, fontes.titles);
      caixa(s, 38, 100, ES_CARD_W, 260, p.linhas.join('\n'), fs, cores.textMain, null, false);
    }

    // E) EAP resumida — dados técnicos no deck; preços permanecem na planilha de resposta.
    else if (p.tipo === 'eap') {
      const x = [24, 80, 455, 515, 565, 696], yCab = 72, hCab = 24;
      caixa(s, 24, 66, 672, 305, '', 10, null, cores.white, false, null, cores.line);
      caixa(s, x[0], yCab, x[1]-x[0], hCab, 'CÓD.', 8, cores.white, cores.brandMed, true, fontes.titles);
      caixa(s, x[1], yCab, x[2]-x[1], hCab, 'DESCRIÇÃO / SERVIÇO', 8, cores.white, cores.brandMed, true, fontes.titles);
      caixa(s, x[2], yCab, x[3]-x[2], hCab, 'QTD.', 8, cores.white, cores.brandMed, true, fontes.titles);
      caixa(s, x[3], yCab, x[4]-x[3], hCab, 'UN.', 8, cores.white, cores.brandMed, true, fontes.titles);
      caixa(s, x[4], yCab, x[5]-x[4], hCab, 'REFERÊNCIA', 8, cores.white, cores.brandMed, true, fontes.titles);
      p.linhas.forEach(function (r, i) {
        const y = yCab + hCab + i * 35, fundo = r.grupo ? cores.brandSoft : (i % 2 ? cores.bgSlide : cores.white);
        const tinta = r.grupo ? cores.brandDark : cores.textBody;
        caixa(s, x[0], y, x[1]-x[0], 35, r.codigo, 8.5, tinta, fundo, r.grupo);
        caixa(s, x[1], y, x[2]-x[1], 35, r.descricao, r.grupo ? 9 : 8.5, tinta, fundo, r.grupo);
        caixa(s, x[2], y, x[3]-x[2], 35, r.quantidade, 8.5, tinta, fundo, false);
        caixa(s, x[3], y, x[4]-x[3], 35, r.unidade, 8.5, tinta, fundo, false);
        caixa(s, x[4], y, x[5]-x[4], 35, r.referencia, 8.5, tinta, fundo, false);
      });
      caixa(s, 34, 349, 650, 16, 'Valores e condições comerciais são preenchidos na planilha da mesma revisão.', 8, cores.textBody, null, false);
    }

    // F) Registro Fotográfico (Cards e Molduras)
    else if (p.tipo === 'fotos') {
      const layout = esLayoutFotos_(p.fotos), wFoto = layout.wFoto, hLeg = layout.hLegenda;
      const hCard = hLeg ? 305 : 275, hImg = hCard - 30 - hLeg, yRotulo = 68 + hImg + 3;
      p.fotos.forEach(function (f, i) {
        const x = 24 + i * (wFoto + layout.gap);
        caixa(s, x, 66, wFoto, hCard, '', 10, null, cores.bgSlide, false, null, cores.line);
        imagem(s, blobs[f.imagem], x + 2, 68, wFoto - 4, hImg);
        caixa(s, x, yRotulo, wFoto, 24, 'REGISTRO FOTOGRÁFICO ' + (i + 1), 8.5, cores.brandMed, cores.brandSoft, true, fontes.titles);
        if (layout.legendas[i].length) {
          caixa(s, x + 8, yRotulo + 30, wFoto - 16, hLeg - 8, layout.legendas[i].join('\n'), ES_FOTO_LEGENDA_FS, cores.textBody);
        }
      });
    }

    // G) Limites e critérios de aceite em cards de leitura rápida
    else if (p.tipo === 'limites-aceite') {
      const gap = ES_LIMITES_GAP, w = (672 - gap * (p.blocos.length - 1)) / p.blocos.length;
      const estilos = {
        azul: { fundo: cores.brandSoft, tinta: cores.brandMed, acento: cores.brandLight },
        ambar: { fundo: cores.amberBg, tinta: cores.amberInk, acento: cores.amberSolid },
        verde: { fundo: cores.greenBg, tinta: cores.greenInk, acento: cores.greenSolid }
      };
      const fs = p.fs || (p.blocos.length <= 2 ? 11 : 10);
      p.blocos.forEach(function (b, i) {
        const x = 24 + i * (w + gap), estilo = estilos[b.cor] || estilos.azul;
        caixa(s, x, 66, w, 305, '', 10, null, cores.white, false, null, cores.line);
        caixa(s, x, 66, w, 5, '', 10, null, estilo.acento);
        caixa(s, x + 14, 84, w - 28, 20, b.titulo, 8.5, estilo.tinta, estilo.fundo, true, fontes.titles);
        caixa(s, x + 14, 118, w - 28, ES_LIMITES_H, b.linhas.join('\n'), fs, cores.textBody);
      });
    }

    // H) Encerramento: Prazos, Contato & Instruções
    else if (p.tipo === 'encerramento') {
      caixa(s, 24, 66, 326, 305, '', 10, null, cores.bgSlide, false, null, cores.line);
      caixa(s, 38, 80, 290, 16, 'CRONOGRAMA & CONTATO', 9, cores.brandLight, null, true, fontes.titles);
      
      caixa(s, 38, 106, 290, 14, 'RESPONSÁVEL TÉCNICO', 8, cores.textMuted, null, true);
      caixa(s, 38, 122, 290, 26, p.responsavel, 12, cores.textMain, null, true);

      caixa(s, 38, 160, 290, 14, 'PRAZOS PARA PROPOSTA E EXECUÇÃO', 8, cores.textMuted, null, true);
      caixa(s, 38, 178, 290, 80, p.prazo, 11, cores.textBody);

      caixa(s, 368, 66, 328, 305, '', 10, null, cores.bgSlide, false, null, cores.line);
      caixa(s, 382, 80, 290, 16, 'DIRETRIZES PARA COTAÇÃO', 9, cores.brandMed, null, true, fontes.titles);

      if (p.visita) {
        caixa(s, 382, 106, 300, 36, 'OBRIGATÓRIA VISITA TÉCNICA PRÉVIA\nPara validação das condições locais antes da proposta.', 9, '#7A5B00', '#FDF1D2', true, null, '#E5A417');
      }

      caixa(s, 382, p.visita ? 154 : 106, 300, 14, 'CARÁTER DO ESCOPO', 8, cores.textMuted, null, true);
      caixa(s, 382, p.visita ? 172 : 124, 300, 160, p.aviso.join('\n'), 10.5, cores.textBody);
    }

    // ──────────────────────────────────────────
    // 5. RODAPÉ EXECUTIVO
    // ──────────────────────────────────────────
    caixa(s, 24, 382, 672, .75, '', 10, null, cores.line);
    const metaTexto = 'CAPITAL REALTY · ' + (meta.id || '') + ' · R' + meta.revisao + ' · ' + String(meta.data).slice(0, 10);
    caixa(s, 24, 385, 450, 16, metaTexto, 7.5, cores.textBody);
    caixa(s, 540, 385, 156, 16, 'PÁGINA ' + (idx + 1) + ' / ' + paginas.length, 8, cores.brandMed, null, true, fontes.titles);
  });
}
