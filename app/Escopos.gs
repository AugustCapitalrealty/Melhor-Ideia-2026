/** Escopos antes da cotação. Revisões append-only; imagens registradas no Drive. */
function esApi_(fn) {
  try { return Object.assign({ ok: true }, fn()); }
  catch (e) { return { ok: false, erro: String(e.message || e) }; }
}

/** Migração aditiva restrita às quatro abas desta funcionalidade, sob trava. */
function esPreparar_() {
  cfComTrava_(function () {
    const ss = cfPlanilha_();
    CF_SCHEMA.filter(function (d) { return /^Escopo/.test(d.nome); }).forEach(function (d) {
      if (!ss.getSheetByName(d.nome)) cfGarantirAba_(ss, d, []);
    });
  });
}

function esTexto_(v, max, nome) {
  const s = String(v == null ? '' : v).trim();
  if (s.length > max) throw new Error((nome || 'Texto') + ': máximo de ' + max + ' caracteres.');
  return s;
}
function esLista_(v, max, nome) {
  if (!Array.isArray(v) || v.length > max) throw new Error(nome + ': limite de ' + max + ' registros.');
  return v;
}
function esImagemId_(v) {
  const s = esTexto_(v, 80, 'Imagem');
  if (s && s !== 'padrao:curitiba' && !/^IMG-[a-f0-9-]{36}$/.test(s)) throw new Error('Imagem inválida. Envie a imagem pelo formulário.');
  return s;
}
function esNormalizar_(d) {
  if (!d || typeof d !== 'object') throw new Error('Escopo inválido.');
  const n = {};
  const limites = { titulo: 180, megaId: 100, megaNome: 160, armazem: 100, modulos: 160,
    responsavel: 180, endereco: 400, objetivo: 6000, vistoria: 9000, consideracoes: 9000,
    aviso: 3000, prazo: 400, detalheLegenda: 200 };
  Object.keys(limites).forEach(function (k) {
    n[k] = esTexto_(d[k], limites[k], k);
    if (['objetivo','vistoria','consideracoes','aviso','prazo'].indexOf(k) < 0) n[k] = n[k].replace(/\s+/g, ' ');
  });
  if (!n.titulo || !n.megaId) throw new Error('Informe o título e selecione o empreendimento.');
  n.imagem = esImagemId_(d.imagem); n.detalhe = esImagemId_(d.detalhe);
  n.visita = d.visita === true;
  n.grupos = esLista_(d.grupos || [], 30, 'Grupos').map(function (g) {
    return { id: esTexto_(g.id, 80), titulo: esTexto_(g.titulo, 160).replace(/\s+/g, ' '), servicos: esTexto_(g.servicos, 9000) };
  });
  const ids = n.grupos.map(function (g) { return g.id; });
  if (ids.some(function (id, i) { return !/^[A-Za-z0-9_-]{1,80}$/.test(id) || ids.indexOf(id) !== i; })) throw new Error('Identificação dos grupos inválida.');
  function vinculos(v) {
    return esLista_(v || [], 30, 'Vínculos').map(function (id) {
      if (ids.indexOf(id) < 0) throw new Error('Um item ou foto aponta para um grupo removido.');
      return id;
    }).filter(function (id, i, a) { return a.indexOf(id) === i; });
  }
  n.itens = esLista_(d.itens || [], 100, 'Itens').map(function (it) {
    const q = it.quantidade === '' || it.quantidade == null ? null : cfNumero_(it.quantidade);
    if (q !== null && (!isFinite(q) || q <= 0)) throw new Error('Quantidade deve ser maior que zero.');
    if (q === null && it.quantidade !== '' && it.quantidade != null) throw new Error('Quantidade inválida.');
    return { descricao: esTexto_(it.descricao, 3500), quantidade: q,
      unidade: esTexto_(it.unidade, 20), referencia: esTexto_(it.referencia, 200), grupos: vinculos(it.grupos) };
  });
  n.fotos = esLista_(d.fotos || [], 40, 'Fotos').map(function (f) {
    const imagem = esImagemId_(f.imagem);
    if (!imagem) throw new Error('Foto sem arquivo.');
    return { imagem: imagem, titulo: esTexto_(f.titulo, 140).replace(/\s+/g, ' '), legenda: esTexto_(f.legenda, 180), grupos: vinculos(f.grupos) };
  });
  // Uma célula do Sheets suporta 50 mil caracteres. Nunca cortar o documento.
  if (JSON.stringify(n).length > 45000) throw new Error('O escopo excede 45 mil caracteres. Divida-o em solicitações menores.');
  return n;
}

function esMegas_() {
  const personalizados = {};
  cfLerTudo_('EscopoMegas').forEach(function (r) { personalizados[r.ID] = JSON.parse(r.CONTEUDO); });
  return cfLerTudo_('Empreendimentos').filter(function (e) { return e.ATIVO !== false; }).map(function (e) {
    const ctba = /curitiba/i.test(e.NOME);
    return Object.assign({ id: String(e.ID), nome: String(e.NOME),
      endereco: ctba ? 'BR-116, 1500, Campina Grande do Sul - PR, 83430-000' : '',
      imagem: ctba ? 'padrao:curitiba' : '' }, personalizados[e.ID] || {}, { id: String(e.ID), nome: String(e.NOME) });
  });
}
function apiEscoposListar() {
  return esApi_(function () {
    esPreparar_();
    const ultimos = {};
    cfLerTudo_('Escopos').forEach(function (r) {
      if (!ultimos[r.ID] || Number(r.REVISAO) > Number(ultimos[r.ID].REVISAO)) ultimos[r.ID] = r;
    });
    return { megas: esMegas_(), escopos: Object.keys(ultimos).map(function (id) {
      const r = ultimos[id], d = JSON.parse(r.CONTEUDO);
      return { id: id, revisao: Number(r.REVISAO), titulo: d.titulo, mega: d.megaNome, data: r.CRIADO_EM };
    }).sort(function (a, b) { return String(b.data).localeCompare(String(a.data)); }) };
  });
}
function esRevisao_(id, rev) {
  const linhas = cfLerTudo_('Escopos').filter(function (r) { return r.ID === id && (rev == null || Number(r.REVISAO) === Number(rev)); });
  linhas.sort(function (a, b) { return Number(b.REVISAO) - Number(a.REVISAO); });
  if (!linhas.length) throw new Error('Escopo ou revisão não encontrado.');
  return linhas[0];
}
function esArquivoLinks_(r) {
  return { revisao: Number(r.REVISAO), data: r.CRIADO_EM,
    slides: 'https://docs.google.com/presentation/d/' + r.SLIDES_ID + '/edit',
    pdf: 'https://drive.google.com/file/d/' + r.PDF_ID + '/view' };
}
function apiEscopoAbrir(id) {
  return esApi_(function () {
    esPreparar_(); const r = esRevisao_(id);
    return { id: r.ID, revisao: Number(r.REVISAO), dados: JSON.parse(r.CONTEUDO),
      arquivos: cfLerTudo_('EscopoArquivos').filter(function (f) { return f.ID_ESCOPO === id && f.STATUS === 'concluido'; }).map(esArquivoLinks_) };
  });
}
function esReferencias_(n) {
  return [n.imagem, n.detalhe].concat(n.fotos.map(function (f) { return f.imagem; })).filter(Boolean);
}
function esConferirImagens_(refs) {
  const cadastradas = cfLerTudo_('EscopoImagens');
  refs.forEach(function (id) {
    if (id !== 'padrao:curitiba' && !cadastradas.some(function (r) { return r.ID === id; })) throw new Error('Imagem não cadastrada: ' + id);
  });
}
function apiEscopoSalvar(id, revisao, dados) {
  return esApi_(function () {
    esPreparar_(); const d = esNormalizar_(dados);
    const mega = esMegas_().filter(function (m) { return m.id === d.megaId; })[0];
    if (!mega) throw new Error('Empreendimento não encontrado.');
    d.megaNome = mega.nome;
    if (d.imagem === 'padrao:curitiba' && !/curitiba/i.test(mega.nome)) throw new Error('A imagem de Curitiba não pertence a este empreendimento.');
    esConferirImagens_(esReferencias_(d));
    return cfComTrava_(function () {
      let atual = null;
      if (id) atual = esRevisao_(id);
      if (atual && Number(atual.REVISAO) !== Number(revisao)) throw new Error('Este escopo foi alterado em outra janela. Guarde suas alterações e reabra a versão atual antes de salvar.');
      const json = JSON.stringify(d);
      if (atual && atual.CONTEUDO === json) return { id: id, revisao: Number(atual.REVISAO) };
      const novoId = id || 'ESC-' + Utilities.getUuid();
      const rev = atual ? Number(atual.REVISAO) + 1 : 1;
      cfInserir_('Escopos', [{ ID: novoId, REVISAO: rev, CONTEUDO: json, CRIADO_EM: new Date().toISOString() }]);
      return { id: novoId, revisao: rev };
    });
  });
}
function apiEscopoSalvarMega(id, endereco, imagem) {
  return esApi_(function () {
    esPreparar_();
    const mega = esMegas_().filter(function (m) { return m.id === id; })[0];
    if (!mega) throw new Error('Empreendimento inválido.');
    const d = { endereco: esTexto_(endereco, 400), imagem: esImagemId_(imagem) };
    if (d.imagem === 'padrao:curitiba' && !/curitiba/i.test(mega.nome)) throw new Error('Imagem de empreendimento incorreta.');
    esConferirImagens_([d.imagem].filter(Boolean));
    cfComTrava_(function () { cfInserir_('EscopoMegas', [{ ID: id, CONTEUDO: JSON.stringify(d), CRIADO_EM: new Date().toISOString() }]); });
    return { megas: esMegas_() };
  });
}
function apiEscopoEnviarImagem(nome, mime, base64) {
  return esApi_(function () {
    esPreparar_();
    if (['image/png', 'image/jpeg'].indexOf(mime) < 0 || typeof base64 !== 'string' || base64.length > 7000000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) throw new Error('Envie PNG ou JPEG de até 5 MB.');
    const bytes = Utilities.base64Decode(base64);
    const b = bytes.map(function (x) { return x & 255; });
    const png = b[0] === 137 && b[1] === 80 && b[2] === 78 && b[3] === 71;
    const jpeg = b[0] === 255 && b[1] === 216 && b[2] === 255;
    if (bytes.length > 5 * 1024 * 1024 || (mime === 'image/png' ? !png : !jpeg)) throw new Error('O arquivo não é uma imagem PNG/JPEG válida de até 5 MB.');
    const id = 'IMG-' + Utilities.getUuid();
    const arquivo = DriveApp.getFolderById(CF_PASTA_ID).createFile(Utilities.newBlob(bytes, mime, id + (png ? '.png' : '.jpg')));
    try {
      cfComTrava_(function () { cfInserir_('EscopoImagens', [{ ID: id, ARQUIVO_ID: arquivo.getId(), NOME: esTexto_(nome, 200).replace(/^([=+@-])/, "'$1"), MIME: mime }]); });
    } catch (e) { arquivo.setTrashed(true); throw e; }
    return { imagem: id };
  });
}
let ES_ASSETS_CACHE_;
function esAssets_() {
  if (!ES_ASSETS_CACHE_) ES_ASSETS_CACHE_ = JSON.parse(HtmlService.createHtmlOutputFromFile('EscopoAssets').getContent());
  return ES_ASSETS_CACHE_;
}
function esAssetBlob_(nome) {
  const a = esAssets_()[nome];
  return Utilities.newBlob(Utilities.base64Decode(a.base64), a.mime, nome + '.png');
}
function esImagemBlob_(id) {
  if (id === 'padrao:curitiba') return esAssetBlob_('curitiba');
  const r = cfLerTudo_('EscopoImagens').filter(function (x) { return x.ID === id; })[0];
  if (!r) throw new Error('Imagem não cadastrada.');
  const file = DriveApp.getFileById(r.ARQUIVO_ID);
  if (file.isTrashed()) throw new Error('Imagem removida: ' + r.NOME);
  return file.getBlob();
}
function apiEscopoImagem(id) {
  return esApi_(function () {
    const blob = esImagemBlob_(esImagemId_(id));
    return { url: 'data:' + blob.getContentType() + ';base64,' + Utilities.base64Encode(blob.getBytes()) };
  });
}

function esValidarGeracao_(d) {
  if (!d.objetivo || !d.endereco || !d.imagem) throw new Error('Preencha objetivo, endereço e imagem do empreendimento antes de gerar.');
  if (!d.grupos.length || d.grupos.some(function (g) { return !g.titulo || !g.servicos; })) throw new Error('Cadastre grupos com título e serviços a executar.');
  if (!d.itens.length || d.itens.some(function (i) { return !i.descricao || !i.unidade || i.quantidade == null || !i.grupos.length; })) throw new Error('Cada item precisa de descrição, quantidade, unidade e vínculo com os serviços.');
  const sem = d.grupos.filter(function (g) { return !d.itens.some(function (i) { return i.grupos.indexOf(g.id) >= 0; }); });
  if (sem.length) throw new Error('Vincule itens de cotação aos grupos: ' + sem.map(function (g) { return g.titulo; }).join(', '));
  if (d.fotos.some(function (f) { return !f.titulo || !f.grupos.length; })) throw new Error('Informe título e grupo de serviços de cada foto.');
}

function apiEscopoGerar(id, revisao) {
  return esApi_(function () {
    esPreparar_();
    const r = esRevisao_(id, revisao), d = esNormalizar_(JSON.parse(r.CONTEUDO));
    esValidarGeracao_(d);
    const paginas = esPlanejarSlides_(d);
    if (paginas.length > 45) throw new Error('O escopo ultrapassa 45 páginas. Divida-o em solicitações menores.');
    const reserva = cfComTrava_(function () {
      const anteriores = cfLerTudo_('EscopoArquivos').filter(function (f) { return f.ID_ESCOPO === id && Number(f.REVISAO) === Number(revisao); });
      const pronto = anteriores.filter(function (f) { return f.STATUS === 'concluido'; })[0];
      if (pronto) return { pronto: pronto };
      if (anteriores.some(function (f) { return f.STATUS === 'gerando' && Date.now() - new Date(f.CRIADO_EM).getTime() < 10 * 60 * 1000; })) throw new Error('Esta revisão já está sendo gerada. Aguarde e tente novamente.');
      const token = Utilities.getUuid();
      cfInserir_('EscopoArquivos', [{ ID: token, ID_ESCOPO: id, REVISAO: revisao, STATUS: 'gerando', CRIADO_EM: new Date().toISOString() }]);
      return { token: token };
    });
    if (reserva.pronto) return esArquivoLinks_(reserva.pronto);
    let deck, pdf;
    function registrar(campos) {
      cfComTrava_(function () {
        const f = cfLerTudo_('EscopoArquivos').filter(function (x) { return x.ID === reserva.token; })[0];
        cfAtualizarLinha_('EscopoArquivos', f._linha, campos);
      });
    }
    try {
      const blobs = {
        logo: esAssetBlob_('logo'),
        logoPreta: esAssetBlob_('logoPreta'),
        logoAbreviada: esAssetBlob_('logoAbreviada')
      };
      esReferencias_(d).forEach(function (ref) { if (!blobs[ref]) blobs[ref] = esImagemBlob_(ref); });
      const nome = 'Escopo - ' + d.titulo + ' - R' + revisao;
      const pasta = DriveApp.getFolderById(CF_PASTA_ID);
      deck = SlidesApp.create(nome);
      DriveApp.getFileById(deck.getId()).moveTo(pasta);
      registrar({ SLIDES_ID: deck.getId() });
      esDesenharSlides_(deck, paginas, blobs, { id: id, revisao: revisao, data: r.CRIADO_EM });
      deck.saveAndClose();
      const blob = DriveApp.getFileById(deck.getId()).getAs('application/pdf').setName(nome + '.pdf');
      if (blob.getBytes().length < 3000) throw new Error('O PDF ainda não está completo. Tente gerar novamente.');
      pdf = pasta.createFile(blob);
      registrar({ PDF_ID: pdf.getId(), STATUS: 'concluido' });
      return esArquivoLinks_({ REVISAO: revisao, CRIADO_EM: r.CRIADO_EM, SLIDES_ID: deck.getId(), PDF_ID: pdf.getId() });
    } catch (e) {
      // Só arquivos criados nesta tentativa; revisões anteriores nunca são alteradas.
      try { if (deck) DriveApp.getFileById(deck.getId()).setTrashed(true); if (pdf) pdf.setTrashed(true); } catch (_) { /* registrar falha mesmo se a limpeza falhar */ }
      registrar({ STATUS: 'falhou' });
      throw e;
    }
  });
}
