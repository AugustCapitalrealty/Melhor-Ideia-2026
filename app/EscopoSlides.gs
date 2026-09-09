/** Planejamento puro, compartilhado por testes e renderização. Coordenadas 720 × 405. */
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
      // URLs/palavras maiores que a linha também continuam, sem truncamento.
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
function esPlanejarSlides_(d) {
  const identificacao = [d.megaNome, d.armazem, d.modulos].filter(Boolean).join(' · ');
  const identificacaoLonga = esQuebrar_(identificacao, 620, 13).length > 3;
  const p = [{ tipo: 'capa', titulo: d.titulo, subtitulo: identificacaoLonga ? '' : identificacao }];
  const enderecoLongo = esQuebrar_(d.megaNome + '\n' + d.endereco, 343, 11).length > 4;
  p.push({ tipo: 'local', titulo: 'Localização', imagem: d.imagem, detalhe: d.detalhe,
    legenda: d.detalheLegenda, texto: enderecoLongo ? d.megaNome : d.megaNome + '\n' + d.endereco });
  function texto(titulo, corpo, subtitulo) {
    if (!corpo) return;
    const linhas = esQuebrar_(corpo, 650, 13);
    for (let i = 0; i < linhas.length; i += 15) p.push({ tipo: 'texto', titulo: titulo,
      subtitulo: (subtitulo || '') + (i ? ' (continuação)' : ''), linhas: linhas.slice(i, i + 15) });
  }
  if (identificacaoLonga) texto('Identificação', identificacao);
  if (enderecoLongo) texto('Localização — endereço', d.endereco);
  texto('Objetivo', d.objetivo);
  texto('Resumo da vistoria', d.vistoria);
  if (d.grupos.length) p.push({ tipo: 'capa', titulo: 'Serviços a Executar' });
  d.grupos.forEach(function (g) {
    texto('Serviços a Executar', g.servicos.split('\n').filter(function (s) { return s.trim(); }).map(function (s) { return '• ' + s.replace(/^[•●]\s*/, ''); }).join('\n'), g.titulo);
  });
  // Respeitar ordem escolhida; separar conjuntos com título/vínculos distintos.
  const conjuntos = [];
  d.fotos.forEach(function (f) {
    const chave = JSON.stringify([f.titulo, f.grupos]);
    let ultimo = conjuntos[conjuntos.length - 1];
    if (!ultimo || ultimo.chave !== chave || ultimo.fotos.length === 4) {
      ultimo = { chave: chave, fotos: [], titulo: 'Registro Fotográfico — ' + f.titulo }; conjuntos.push(ultimo);
    }
    ultimo.fotos.push(f);
  });
  conjuntos.forEach(function (g) {
    p.push({ tipo: 'fotos', titulo: 'Registro Fotográfico', subtitulo: g.fotos[0].titulo, fotos: g.fotos });
    texto('Legendas do registro fotográfico', g.fotos.map(function (f, i) { return f.legenda ? 'Foto ' + (i + 1) + ': ' + f.legenda : ''; }).filter(Boolean).join('\n'), g.fotos[0].titulo);
  });
  if (d.itens.length) p.push({ tipo: 'capa', titulo: 'Proposta' });
  let tabela = null, altura = 0;
  d.itens.forEach(function (it, idx) {
    const grupos = d.grupos.filter(function (g) { return it.grupos.indexOf(g.id) >= 0; }).map(function (g) { return g.titulo; }).join(' / ');
    const linhas = esQuebrar_((idx + 1) + '. ' + it.descricao + (it.referencia ? '\nReferência: ' + it.referencia : '') + '\nLocal: ' + grupos, 316, 10.5);
    for (let i = 0; i < linhas.length; i += 14) {
      const trecho = linhas.slice(i, i + 14);
      if (i) trecho.unshift('(continuação do item ' + (idx + 1) + ')');
      const quantidade = i ? '' : esQuebrar_(String(it.quantidade == null ? '' : it.quantidade), 30, 10.5).join('\n');
      const unidade = i ? '' : esQuebrar_(it.unidade, 30, 10.5).join('\n');
      const h = Math.max(45, trecho.length * 13 + 18, quantidade.split('\n').length * 13 + 18, unidade.split('\n').length * 13 + 18);
      if (!tabela || altura + h > 260) {
        tabela = { tipo: 'tabela', titulo: 'Escopo — Orientativo', linhas: [] }; p.push(tabela); altura = 0;
      }
      tabela.linhas.push({ texto: trecho.join('\n'), altura: h, quantidade: quantidade, unidade: unidade });
      altura += h;
    }
  });
  if (d.consideracoes || d.prazo) p.push({ tipo: 'capa', titulo: 'Considerações' });
  texto('Considerações', d.consideracoes);
  texto('Prazos e contato', [d.prazo, d.responsavel ? 'Responsável: ' + d.responsavel : ''].filter(Boolean).join('\n'));
  texto('Aviso final', [d.aviso, d.visita ? 'É necessária visita técnica prévia para elaboração da proposta.' : ''].filter(Boolean).join('\n\n'));
  return p;
}

function esDesenharSlides_(deck, paginas, blobs, meta) {
  deck.getSlides().forEach(function (s) { s.remove(); });
  // Mesma fonte de identidade de ExportarSlides.gs e da apresentação ao Conselho.
  const cores = DS_CN.colors, fontes = DS_CN.typography;
  const sx = deck.getPageWidth() / 720, sy = deck.getPageHeight() / 405;
  function caixa(s, x, y, w, h, t, fs, cor, fundo, bold, fonte) {
    const shape = s.insertShape(SlidesApp.ShapeType.RECTANGLE, x * sx, y * sy, w * sx, h * sy);
    shape.getBorder().setTransparent();
    if (fundo) shape.getFill().setSolidFill(fundo); else shape.getFill().setTransparent();
    shape.setContentAlignment(SlidesApp.ContentAlignment.TOP);
    // Retângulos decorativos e células de preço vazias não têm texto para estilizar.
    if (t === '' || t == null) return shape;
    const text = shape.getText(); text.setText(String(t));
    text.getTextStyle().setFontFamily(fonte || fontes.body).setFontSize((fs || 13) * sy).setForegroundColor(cor || cores.textBody).setBold(!!bold);
    text.getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.START).setLineSpacing(100).setSpaceAbove(0).setSpaceBelow(0);
    return shape;
  }
  function imagem(s, blob, x, y, w, h) {
    // A sobrecarga com bounding box mantém proporção e centraliza (SlidesApp).
    s.insertImage(blob, x * sx, y * sy, w * sx, h * sy);
  }
  paginas.forEach(function (p, idx) {
    const s = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
    s.getBackground().setSolidFill(cores.white);
    if (p.tipo === 'capa') {
      s.getBackground().setSolidFill(cores.brandDark);
      imagem(s, blobs.logo, 42, 42, 165, 36);
      caixa(s, 36, 88, 650, 25, 'CAPITAL FORNECEDORES · ESCOPO DE CONTRATAÇÃO', 10, cores.brandSoft, null, true);
      let fonteTitulo = 28, linhasTitulo = esQuebrar_(p.titulo, 630, fonteTitulo);
      while (linhasTitulo.length * fonteTitulo * 1.2 > 130 && fonteTitulo > 16) {
        fonteTitulo -= 2; linhasTitulo = esQuebrar_(p.titulo, 630, fonteTitulo);
      }
      caixa(s, 36, 116, 650, 140, linhasTitulo.join('\n'), fonteTitulo, cores.white, null, true, fontes.titles);
      caixa(s, 0, 263, 720, 4, '', 10, null, cores.brandLight);
      if (p.subtitulo) caixa(s, 38, 281, 640, 64, esQuebrar_(p.subtitulo, 620, 13).join('\n'), 13, cores.brandSoft);
    } else {
      caixa(s, 0, 0, 720, 3, '', 10, null, cores.brandMed);
      caixa(s, 24, 15, 4, 30, '', 10, null, cores.brandLight);
      const titulo = esQuebrar_(p.titulo, 488, 17).join('\n');
      caixa(s, 33, 12, 505, 43, titulo, 17, cores.textMain, null, true, fontes.titles);
      caixa(s, 551, 13, 145, 35, '', 10, null, cores.brandDark);
      imagem(s, blobs.logo, 560, 19, 127, 24);
      caixa(s, 24, 59, 672, .75, '', 10, null, cores.line);
      if (p.tipo === 'local') {
        if (p.detalhe) {
          imagem(s, blobs[p.detalhe], 24, 80, 275, 210);
          caixa(s, 24, 296, 280, 85, esQuebrar_(p.legenda, 262, 9).join('\n'), 9);
        }
        imagem(s, blobs[p.imagem], p.detalhe ? 324 : 170, 74, 365, 235);
        caixa(s, p.detalhe ? 324 : 170, 314, 365, 65, esQuebrar_(p.texto, 343, 11).join('\n'), 11);
      } else if (p.tipo === 'texto') {
        if (p.subtitulo) caixa(s, 26, 68, 670, 50, esQuebrar_(p.subtitulo, 648, 12).join('\n'), 12, cores.brandMed, null, true);
        caixa(s, 26, p.subtitulo ? 119 : 79, 670, 263, p.linhas.join('\n'), 13);
      } else if (p.tipo === 'fotos') {
        caixa(s, 26, 66, 670, 48, esQuebrar_(p.subtitulo, 648, 12).join('\n'), 12, cores.brandMed, null, true);
        const n = p.fotos.length, gap = 16, largura = (664 - gap * (n - 1)) / n;
        p.fotos.forEach(function (f, i) {
          const x = 28 + i * (largura + gap);
          imagem(s, blobs[f.imagem], x, 117, largura, 242);
          if (p.fotos.some(function (foto) { return foto.legenda; })) caixa(s, x, 363, largura, 20, 'Foto ' + (i + 1), 9);
        });
      } else if (p.tipo === 'tabela') {
        const xs = [20, 354, 402, 450, 555], ws = [334, 48, 48, 105, 145];
        ['Item', 'Qtde', 'Unidade', 'Valor unitário', 'Valor total'].forEach(function (t, i) {
          caixa(s, xs[i], 70, ws[i] - 1, 30, t, 10, cores.white, cores.brandDark, true);
        });
        let y = 101;
        p.linhas.forEach(function (l, linha) {
          caixa(s, 20, y, 680, l.altura, '', 10, null, cores.line);
          [l.texto, l.quantidade, l.unidade, '', ''].forEach(function (t, i) {
            caixa(s, xs[i] + 1, y + 1, ws[i] - 2, l.altura - 2, t, 10.5, cores.textMain, linha % 2 ? cores.bgSlide : cores.white);
          });
          y += l.altura;
        });
        caixa(s, 20, y, 680, 21, 'Valores a preencher pelo fornecedor', 9, cores.brandMed, cores.brandSoft);
      }
    }
    if (p.tipo !== 'capa') caixa(s, 24, 383, 672, .75, '', 10, null, cores.line);
    caixa(s, 24, 386, 670, 18, (meta.id || '') + ' · R' + meta.revisao + ' · ' + String(meta.data).slice(0, 10) + ' · ' + (idx + 1) + '/' + paginas.length,
      7, p.tipo === 'capa' ? cores.brandSoft : cores.textMuted);
  });
}
