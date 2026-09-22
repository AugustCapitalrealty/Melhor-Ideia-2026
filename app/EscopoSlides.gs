/**
 * Gestão de Contratações — Motor de Geração de Slides Executivos de Escopo
 * Padrão Corporativo Internacional (16:9 - 720 x 405 pt)
 * Paleta e Identidade Visual: DS_CN (Montserrat + Open Sans)
 */

function esLarguraTexto_(texto, fonte) {
  return Array.from(texto).reduce(function (n, c) {
    return n + (/\s/.test(c) ? .3 : /[ilIjtfr.,:;!'|]/.test(c) ? .38 : /[MW@%mw]/.test(c) ? 1 : /[A-ZÁÉÍÓÚÃÕÇ]/.test(c) ? .78 : .65) * fonte;
  }, 0);
}

function esQuebrar_(texto, largura, fonte) {
  const linhas = [];
  String(texto || '').split('\n').forEach(function (paragrafo) {
    const raw = paragrafo.trim();
    if (!raw) { linhas.push(''); return; }
    const ehBullet = /^[•●\-*]|\d+[\.\)]\s/.test(raw);
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
          if (/^\s*[•●\-*]|\d+[\.\)]\s/.test(linhas[i + j] || '')) {
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

const ES_FOTO_LEGENDA_FS = 9;
const ES_FOTO_LEGENDA_MAX = 120;

/** Largura de cada foto no slide e altura reservada para as descrições abaixo delas. */
function esLayoutFotos_(fotos) {
  const n = fotos.length, gap = 16, wFoto = (672 - gap * (n - 1)) / n;
  const legendas = fotos.map(function (f) { return f.legenda ? esQuebrar_(f.legenda, wFoto - 16, ES_FOTO_LEGENDA_FS) : []; });
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
    p.push({ tipo: 'card-texto', titulo: 'Identificação', subtitulo: d.megaNome, badge: 'IDENTIFICAÇÃO', linhas: esQuebrar_(identificacao, 640, 12) });
  }
  if (enderecoLongo) {
    p.push({ tipo: 'card-texto', titulo: 'Localização — endereço', subtitulo: d.megaNome, badge: 'ENDEREÇO', linhas: esQuebrar_(d.endereco, 640, 12) });
  }

  // 3. Contexto: Objetivo & Resumo da Vistoria
  const linhasObj = esQuebrar_(d.objetivo || '', 630, 12);
  const linhasVist = esQuebrar_(d.vistoria || '', 630, 12);
  const totalLinhasContexto = (d.objetivo ? linhasObj.length + 3 : 0) + (d.vistoria ? linhasVist.length + 3 : 0);

  if (d.objetivo && d.vistoria && totalLinhasContexto <= 18 && linhasObj.length <= 8 && linhasVist.length <= 9) {
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
      const quebras = esFatiarLinhas_(linhasObj, 16);
      quebras.forEach(function (q, idx) {
        p.push({ tipo: 'card-texto', titulo: 'Objetivo', subtitulo: idx ? '(continuação)' : d.megaNome, badge: 'OBJETIVO', linhas: q });
      });
    }
    if (d.vistoria) {
      const quebras = esFatiarLinhas_(linhasVist, 16);
      quebras.forEach(function (q, idx) {
        p.push({ tipo: 'card-texto', titulo: 'Resumo da vistoria', subtitulo: idx ? '(continuação)' : d.megaNome, badge: 'VISTORIA TÉCNICA', linhas: q });
      });
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
    const linhasServicos = esQuebrar_(textoCompleto, 640, 12);

    // Se tiver até 20 linhas, mantém no mesmo slide com layout compacto
    if (linhasServicos.length <= 20) {
      p.push({
        tipo: 'servicos',
        titulo: 'Serviços a Executar',
        subtitulo: g.titulo,
        linhas: linhasServicos,
        compacto: linhasServicos.length > 13
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
          compacto: q.length > 13
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
      const partes = esQuebrar_(it.descricao, grupo ? 570 : 365, grupo ? 9.5 : 8.5);
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
    const linhasCons = esQuebrar_(d.consideracoes, 640, 12);
    if (linhasCons.length <= 18) {
      p.push({ tipo: 'card-texto', titulo: 'Considerações', subtitulo: 'Requisitos técnicos e operacionais', badge: 'DIRETRIZES', linhas: linhasCons });
    } else {
      const quebras = esFatiarLinhas_(linhasCons, 15);
      quebras.forEach(function (q, idx) {
        p.push({ tipo: 'card-texto', titulo: 'Considerações', subtitulo: idx ? '(continuação)' : 'Requisitos técnicos e operacionais', badge: 'DIRETRIZES', linhas: q });
      });
    }
  }

  // 12. Limites e aceite: reduz ambiguidades para quem prepara a proposta e para quem recebe o serviço.
  const blocosEntrada = [
    { titulo: 'INCLUSÕES', texto: (d.inclusoes || '').trim(), cor: 'azul' },
    { titulo: 'EXCLUSÕES', texto: (d.exclusoes || '').trim(), cor: 'ambar' },
    { titulo: 'CRITÉRIOS DE ACEITE', texto: (d.criteriosAceite || '').trim(), cor: 'verde' }
  ].filter(function (b) { return b.texto; });

  if (blocosEntrada.length === 3) {
    // 3 blocos: layout em 3 colunas de ~186pt
    const blocos186 = blocosEntrada.map(function (b) {
      return Object.assign({}, b, { linhas: esQuebrar_(b.texto, 186, 10) });
    });
    const totalLinhas = blocos186.reduce(function (n, b) { return n + b.linhas.length; }, 0);
    const cabemJuntos = totalLinhas <= 24 && blocos186.every(function (b) { return b.linhas.length <= 11; });

    if (cabemJuntos) {
      p.push({
        tipo: 'limites-aceite',
        titulo: 'Limites e critérios de aceite',
        subtitulo: 'Referência objetiva para proposta, execução e recebimento',
        blocos: blocos186
      });
    } else {
      // Quando não couberem no slide triplo, cada bloco recebe slide(s) executivo(s) de largura total (640pt)
      blocosEntrada.forEach(function (b) {
        const linhasFull = esQuebrar_(b.texto, 640, 12);
        esFatiarLinhas_(linhasFull, 16).forEach(function (q, idx) {
          const titFormatado = b.titulo.charAt(0) + b.titulo.slice(1).toLowerCase();
          p.push({
            tipo: 'card-texto',
            titulo: titFormatado,
            subtitulo: idx ? '(continuação)' : 'Limites e critérios de aceite',
            badge: b.titulo,
            linhas: q
          });
        });
      });
    }
  } else if (blocosEntrada.length === 2) {
    // 2 blocos: layout em 2 colunas amplas de ~295pt
    const blocos295 = blocosEntrada.map(function (b) {
      return Object.assign({}, b, { linhas: esQuebrar_(b.texto, 295, 10.5) });
    });
    const cabemJuntos = blocos295.every(function (b) { return b.linhas.length <= 14; });

    if (cabemJuntos) {
      p.push({
        tipo: 'limites-aceite',
        titulo: 'Limites e critérios de aceite',
        subtitulo: 'Referência objetiva para proposta, execução e recebimento',
        blocos: blocos295
      });
    } else {
      blocosEntrada.forEach(function (b) {
        const linhasFull = esQuebrar_(b.texto, 640, 12);
        esFatiarLinhas_(linhasFull, 16).forEach(function (q, idx) {
          const titFormatado = b.titulo.charAt(0) + b.titulo.slice(1).toLowerCase();
          p.push({
            tipo: 'card-texto',
            titulo: titFormatado,
            subtitulo: idx ? '(continuação)' : 'Limites e critérios de aceite',
            badge: b.titulo,
            linhas: q
          });
        });
      });
    }
  } else if (blocosEntrada.length === 1) {
    // 1 único bloco: renderizado diretamente em slide de largura total (640pt)
    const b = blocosEntrada[0];
    const titFormatado = b.titulo.charAt(0) + b.titulo.slice(1).toLowerCase();
    const linhasFull = esQuebrar_(b.texto, 640, 12);

    esFatiarLinhas_(linhasFull, 16).forEach(function (q, idx) {
      p.push({
        tipo: 'card-texto',
        titulo: titFormatado,
        subtitulo: idx ? '(continuação)' : 'Limites e critérios de aceite',
        badge: b.titulo,
        linhas: q
      });
    });
  }

  // 13. Prazos, Contato e Aviso Final (Consolidado em Cards Executivos)
  if (d.prazo || d.responsavel || d.aviso || d.visita) {
    const linhasAviso = esQuebrar_(d.aviso || 'Este escopo tem caráter orientativo e serve como base técnica para cotação.', 300, 11);
    const linhasPrazo = esQuebrar_(d.prazo || '', 290, 11);
    if (linhasPrazo.length > 6) {
      const linhasPrazoFull = esQuebrar_(d.prazo, 640, 12);
      esFatiarLinhas_(linhasPrazoFull, 16).forEach(function (q, idx) {
        p.push({ tipo: 'card-texto', titulo: 'Prazos', subtitulo: idx ? '(continuação)' : 'Proposta, visita e execução', badge: 'CRONOGRAMA', linhas: q });
      });
    }
    if (linhasAviso.length > 12) {
      const linhasAvisoFull = esQuebrar_(d.aviso, 640, 12);
      esFatiarLinhas_(linhasAvisoFull, 16).forEach(function (q, idx) {
        p.push({ tipo: 'card-texto', titulo: 'Diretrizes para cotação', subtitulo: idx ? '(continuação)' : d.megaNome, badge: 'AVISO AO PROPONENTE', linhas: q });
      });
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
      let fsTit = 26, lTit = esQuebrar_(p.titulo, 640, fsTit);
      while (lTit.length * fsTit * 1.2 > 120 && fsTit > 16) {
        fsTit -= 2; lTit = esQuebrar_(p.titulo, 640, fsTit);
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

    const linhasTitulo = esQuebrar_(p.titulo, 490, 16), tituloDuplo = linhasTitulo.length > 1;
    const titFormatado = linhasTitulo.slice(0, 2).join('\n');
    caixa(s, 34, 11, 500, tituloDuplo ? 34 : 22, titFormatado, tituloDuplo ? 14 : 16, cores.textMain, null, true, fontes.titles);
    if (p.subtitulo) {
      caixa(s, 34, tituloDuplo ? 43 : 32, 500, 14, esQuebrar_(p.subtitulo, 490, 10).slice(0, 1).join('\n'), 10, cores.brandMed, null, false);
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
      const titNorm = (p.titulo || '').trim().toUpperCase();
      const badgeNorm = (p.badge || '').trim().toUpperCase();
      const mostrarBadge = p.badge && badgeNorm !== titNorm;
      if (mostrarBadge) {
        caixa(s, 38, 78, 280, 18, p.badge, 9, cores.brandLight, null, true, fontes.titles);
      }
      const yTexto = mostrarBadge ? 104 : 80;
      const hTexto = mostrarBadge ? 255 : 280;
      caixa(s, 38, yTexto, 644, hTexto, p.linhas.join('\n'), 12, cores.textBody);
    }

    // D) Serviços a Executar
    else if (p.tipo === 'servicos') {
      const fs = p.compacto ? 11 : 12.5;
      caixa(s, 24, 66, 672, 305, '', 10, null, cores.bgSlide, false, null, cores.line);
      caixa(s, 38, 76, 644, 18, 'LISTA DE ATIVIDADES A EXECUTAR', 8.5, cores.brandLight, null, true, fontes.titles);
      caixa(s, 38, 100, 644, 260, p.linhas.join('\n'), fs, cores.textMain, null, false);
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
      const gap = 14, w = (672 - gap * (p.blocos.length - 1)) / p.blocos.length;
      const estilos = {
        azul: { fundo: cores.brandSoft, tinta: cores.brandMed, acento: cores.brandLight },
        ambar: { fundo: cores.amberBg, tinta: cores.amberInk, acento: cores.amberSolid },
        verde: { fundo: cores.greenBg, tinta: cores.greenInk, acento: cores.greenSolid }
      };
      const fs = p.blocos.length <= 2 ? 11 : 10;
      p.blocos.forEach(function (b, i) {
        const x = 24 + i * (w + gap), estilo = estilos[b.cor] || estilos.azul;
        caixa(s, x, 66, w, 305, '', 10, null, cores.white, false, null, cores.line);
        caixa(s, x, 66, w, 5, '', 10, null, estilo.acento);
        caixa(s, x + 14, 84, w - 28, 20, b.titulo, 8.5, estilo.tinta, estilo.fundo, true, fontes.titles);
        caixa(s, x + 14, 118, w - 28, 235, b.linhas.join('\n'), fs, cores.textBody);
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
