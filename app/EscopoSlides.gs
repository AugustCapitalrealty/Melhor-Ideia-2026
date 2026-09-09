/**
 * Capital Fornecedores — Motor de Geração de Slides Executivos de Escopo
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
    if (!paragrafo.trim()) { linhas.push(''); return; }
    let linha = '';
    paragrafo.trim().split(/\s+/).forEach(function (palavra) {
      if (linha && esLarguraTexto_(linha + ' ' + palavra, fonte) > largura) { linhas.push(linha); linha = ''; }
      Array.from(palavra).forEach(function (c, i) {
        if (i === 0 && linha) linha += ' ';
        if (esLarguraTexto_(linha + c, fonte) > largura) { linhas.push(linha); linha = ''; }
        linha += c;
      });
    });
    linhas.push(linha);
  });
  return linhas;
}

/** Divide linhas balanceando o final para nunca deixar órfãos (menos de 4 linhas no fim). */
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
    if (restante - fatia < 4) fatia = restante - 4;
    resultado.push(linhas.slice(i, i + fatia));
    i += fatia;
  }
  return resultado;
}

/**
 * Planejador de slides com eliminação de linhas órfãs (widows/orphans),
 * combinação de blocos de contexto e ajuste tipográfico adaptativo.
 */
function esPlanejarSlides_(d) {
  const identificacao = [d.megaNome, d.armazem, d.modulos].filter(Boolean).join(' · ');
  const identificacaoLonga = esQuebrar_(identificacao, 620, 13).length > 3;
  
  // 1. Capa Executiva com Metadados
  const p = [{
    tipo: 'capa',
    titulo: d.titulo,
    subtitulo: identificacaoLonga ? '' : identificacao,
    meta: {
      mega: d.megaNome,
      local: [d.armazem, d.modulos].filter(Boolean).join(' · ') || 'Área Operacional',
      responsavel: d.responsavel || 'Equipe de Facilities'
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

  if (d.objetivo && d.vistoria && totalLinhasContexto <= 18) {
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
    p.push({ tipo: 'capa-secao', numero: '01', titulo: 'Serviços a Executar', subtitulo: 'Detalhamento das atividades e escopo técnico por ambiente' });
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

  // 6. Divisória de Registro Fotográfico
  if (d.fotos.length) {
    p.push({ tipo: 'capa-secao', numero: '02', titulo: 'Registro Fotográfico', subtitulo: 'Evidências visuais levantadas na vistoria técnica de campo' });
  }

  // 7. Fotografias Agrupadas (Até 4 fotos por slide)
  const conjuntos = [];
  d.fotos.forEach(function (f) {
    const chave = JSON.stringify([f.titulo, f.grupos]);
    let ultimo = conjuntos[conjuntos.length - 1];
    if (!ultimo || ultimo.chave !== chave || ultimo.fotos.length === 4) {
      ultimo = { chave: chave, fotos: [], titulo: f.titulo };
      conjuntos.push(ultimo);
    }
    ultimo.fotos.push(f);
  });

  conjuntos.forEach(function (g) {
    const sub = g.titulo ? g.titulo.replace(/^Registro\s+Fotogr[aá]fico\s*[-–—:]*\s*/i, '') : 'Instalações Inspecionadas';
    p.push({ tipo: 'fotos', titulo: 'Registro Fotográfico', subtitulo: sub, fotos: g.fotos });
    
    // Legendas individuais, se existirem
    const legendas = g.fotos.map(function (f, i) { return f.legenda ? 'Foto ' + (i + 1) + ': ' + f.legenda : ''; }).filter(Boolean);
    if (legendas.length) {
      p.push({ tipo: 'card-texto', titulo: 'Legendas do registro fotográfico', subtitulo: sub, badge: 'NOTAS TÉCNICAS', linhas: esQuebrar_(legendas.join('\n\n'), 640, 12) });
    }
  });

  // 8. Divisória de Proposta Comercial
  if (d.itens.length) {
    p.push({ tipo: 'capa-secao', numero: '03', titulo: 'Proposta', subtitulo: 'Planilha orientativa de quantitativos e serviços para cotação' });
  }

  // 9. Tabelas Comerciais (Colunas Calibradas)
  let tabela = null, altura = 0;
  d.itens.forEach(function (it, idx) {
    const grupos = d.grupos.filter(function (g) { return it.grupos.indexOf(g.id) >= 0; }).map(function (g) { return g.titulo; }).join(' / ');
    const linhas = esQuebrar_((idx + 1) + '. ' + it.descricao + (it.referencia ? '\nRef. Técnica: ' + it.referencia : '') + (grupos ? '\nLocal: ' + grupos : ''), 315, 10.5);
    
    for (let i = 0; i < linhas.length; i += 12) {
      const trecho = linhas.slice(i, i + 12);
      if (i) trecho.unshift('(continuação do item ' + (idx + 1) + ')');
      const quantidade = i ? '' : String(it.quantidade == null ? '' : it.quantidade);
      const unidade = i ? '' : it.unidade;
      const h = Math.max(46, trecho.length * 13 + 18);

      if (!tabela || altura + h > 260) {
        tabela = { tipo: 'tabela', titulo: 'Escopo — Orientativo', linhas: [] };
        p.push(tabela);
        altura = 0;
      }
      tabela.linhas.push({ texto: trecho.join('\n'), altura: h, quantidade: quantidade, unidade: unidade });
      altura += h;
    }
  });

  // 10. Divisória de Diretrizes e Condições
  if (d.consideracoes || d.prazo || d.aviso || d.visita) {
    p.push({ tipo: 'capa-secao', numero: '04', titulo: 'Considerações', subtitulo: 'Requisitos técnicos, prazos, visitas e diretrizes para elaboração da proposta' });
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

  // 12. Prazos, Contato e Aviso Final (Consolidado em Cards Executivos)
  if (d.prazo || d.responsavel || d.aviso || d.visita) {
    const linhasAviso = esQuebrar_(d.aviso || 'Este escopo tem caráter orientativo e serve como base técnica para cotação.', 300, 11);
    p.push({
      tipo: 'encerramento',
      titulo: 'Prazos e contato',
      subtitulo: d.megaNome,
      responsavel: d.responsavel || 'Equipe de Facilities',
      prazo: d.prazo || 'Conforme alinhamento comercial com a equipe de compras',
      visita: !!d.visita,
      aviso: linhasAviso
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
    const s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
    s.getBackground().setSolidFill(cores.white);

    // ──────────────────────────────────────────
    // 1. CAPA EXECUTIVA
    // ──────────────────────────────────────────
    if (p.tipo === 'capa') {
      s.getBackground().setSolidFill(cores.brandDark);
      imagem(s, blobs.logo, 36, 32, 160, 35);
      
      // Badge Institucional
      caixa(s, 36, 78, 290, 18, 'CAPITAL FORNECEDORES · ESCOPO DE CONTRATAÇÃO', 8.5, cores.brandSoft, '#1E295B', true);

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
      caixa(s, 45, 130, 200, 20, 'SEÇÃO ' + p.numero, 11, cores.brandLight, null, true, fontes.titles);
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

    const titFormatado = esQuebrar_(p.titulo, 490, 16).join('\n');
    caixa(s, 34, 11, 500, 22, titFormatado, 16, cores.textMain, null, true, fontes.titles);
    if (p.subtitulo) {
      caixa(s, 34, 32, 500, 16, esQuebrar_(p.subtitulo, 490, 10).join('\n'), 10, cores.brandMed, null, false);
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
      caixa(s, 38, 76, 200, 16, '🎯 OBJETIVO DA INTERVENÇÃO', 9, cores.brandLight, null, true, fontes.titles);
      caixa(s, 38, 96, 644, 98, p.objetivo.join('\n'), 11.5, cores.textBody);

      // Card 2: Vistoria Técnica
      caixa(s, 24, 218, 672, 154, '', 10, null, cores.bgSlide, false, null, cores.line);
      caixa(s, 38, 228, 240, 16, '🔍 DIAGNÓSTICO DA VISTORIA TÉCNICA', 9, cores.brandMed, null, true, fontes.titles);
      caixa(s, 38, 248, 644, 114, p.vistoria.join('\n'), 11.5, cores.textBody);
    }

    // C) Card Destaque (Objetivo ou Vistoria isolados)
    else if (p.tipo === 'card-texto') {
      caixa(s, 24, 66, 672, 305, '', 10, null, cores.bgSlide, false, null, cores.line);
      if (p.badge) {
        caixa(s, 38, 78, 240, 18, p.badge, 9, cores.brandLight, null, true, fontes.titles);
      }
      caixa(s, 38, p.badge ? 104 : 82, 644, 255, p.linhas.join('\n'), 12, cores.textBody);
    }

    // D) Serviços a Executar
    else if (p.tipo === 'servicos') {
      const fs = p.compacto ? 11 : 12.5;
      caixa(s, 24, 66, 672, 305, '', 10, null, cores.bgSlide, false, null, cores.line);
      caixa(s, 38, 76, 644, 18, 'LISTA DE ATIVIDADES A EXECUTAR', 8.5, cores.brandLight, null, true, fontes.titles);
      caixa(s, 38, 100, 644, 260, p.linhas.join('\n'), fs, cores.textMain, null, false);
    }

    // E) Registro Fotográfico (Cards e Molduras)
    else if (p.tipo === 'fotos') {
      const n = p.fotos.length, gap = 16, wFoto = (672 - gap * (n - 1)) / n;
      p.fotos.forEach(function (f, i) {
        const x = 24 + i * (wFoto + gap);
        caixa(s, x, 66, wFoto, 275, '', 10, null, cores.bgSlide, false, null, cores.line);
        imagem(s, blobs[f.imagem], x + 2, 68, wFoto - 4, 245);
        caixa(s, x, 316, wFoto, 24, 'REGISTRO FOTOGRÁFICO ' + (i + 1), 8.5, cores.brandMed, cores.brandSoft, true, fontes.titles);
      });
    }

    // F) Tabela Comercial ("Escopo — Orientativo")
    else if (p.tipo === 'tabela') {
      const xs = [24, 360, 408, 470, 580];
      const ws = [335, 47, 61, 109, 116];
      const headers = ['Item / Descrição do Serviço', 'Qtde', 'Unidade', 'Valor unitário', 'Valor total'];

      // Cabeçalho da Tabela
      headers.forEach(function (t, i) {
        caixa(s, xs[i], 66, ws[i] - 1, 28, t, 9.5, cores.white, cores.brandDark, true, fontes.titles);
      });

      let y = 95;
      p.linhas.forEach(function (l, linha) {
        caixa(s, 24, y, 672, l.altura, '', 10, null, cores.line);
        const bg = linha % 2 ? cores.bgSlide : cores.white;
        [l.texto, l.quantidade, l.unidade, '', ''].forEach(function (t, i) {
          const isNum = i === 1 || i === 2;
          caixa(s, xs[i] + 1, y + 1, ws[i] - 2, l.altura - 2, t, isNum ? 10 : 10, cores.textMain, bg);
        });
        y += l.altura;
      });

      // Rodapé da Tabela
      caixa(s, 24, y, 672, 22, 'Valores a preencher pelo fornecedor', 9, cores.brandMed, cores.brandSoft, true);
    }

    // G) Encerramento: Prazos, Contato & Instruções
    else if (p.tipo === 'encerramento') {
      caixa(s, 24, 66, 326, 305, '', 10, null, cores.bgSlide, false, null, cores.line);
      caixa(s, 38, 80, 290, 16, '📅 CRONOGRAMA & CONTATO', 9, cores.brandLight, null, true, fontes.titles);
      
      caixa(s, 38, 106, 290, 14, 'RESPONSÁVEL TÉCNICO', 8, cores.textMuted, null, true);
      caixa(s, 38, 122, 290, 26, p.responsavel, 12, cores.textMain, null, true);

      caixa(s, 38, 160, 290, 14, 'PRAZOS PARA PROPOSTA E EXECUÇÃO', 8, cores.textMuted, null, true);
      caixa(s, 38, 178, 290, 80, p.prazo, 11, cores.textBody);

      caixa(s, 368, 66, 328, 305, '', 10, null, cores.bgSlide, false, null, cores.line);
      caixa(s, 382, 80, 290, 16, '⚠️ DIRETRIZES PARA COTAÇÃO', 9, cores.brandMed, null, true, fontes.titles);

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
    caixa(s, 24, 385, 450, 16, metaTexto, 7.5, cores.textMuted);
    caixa(s, 540, 385, 156, 16, 'PÁGINA ' + (idx + 1) + ' / ' + paginas.length, 8, cores.brandMed, null, true, fontes.titles);
  });
}