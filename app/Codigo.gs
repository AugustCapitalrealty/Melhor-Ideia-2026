/**
 * Capital Fornecedores — web app
 *
 * Uma URL, uma tela. O cálculo é o mesmo que a consulta do Logger usa —
 * se a tela e o relatório recalculassem por conta própria, um dia
 * divergiriam e ninguém saberia qual está certo.
 */

const CF_VERSAO_APP = '2026-09-05.3';

function doGet(e) {
  const pagina = (e && e.parameter && e.parameter.page) || 'consulta';
  const t = HtmlService.createTemplateFromFile('Interface');
  t.pagina = pagina;
  return t.evaluate()
    .setTitle('Capital Fornecedores')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ─────────────────────────────────────────────────────────────
//  API para o navegador
//
//  Tudo que sai daqui precisa ser serializável: Date não atravessa
//  google.script.run de forma confiável, então vira texto no servidor.
// ─────────────────────────────────────────────────────────────

function apiConsultar(termo) {
  try {
    const r = consultarPreco(termo);
    return {
      ok: true,
      termo: r.termo,
      pontos: r.pontos,
      grupos: r.grupos.map(function (g) {
        return {
          codigo: g.codigo,
          descricao: g.descricao,
          empreendimento: g.empreendimento,
          area: g.area,
          data: cfDataTexto_(g.data),
          minimo: g.minimo,
          maximo: g.maximo,
          variacao: g.variacao,
          fonte: g.precos[0] && g.precos[0].fonte || '',
          precos: g.precos.sort(function (a, b) { return a.valor - b.valor; })
            .map(function (p) {
              return {
                fornecedor: p.fornecedor,
                valor: p.valor,
                unidade: p.unidade || '',
                quantidade: (p.quantidade !== null && p.quantidade !== undefined && p.quantidade !== '') ? p.quantidade : null,
                vencedora: !!p.vencedora,
                semCadastro: !!p.semCadastro,
                fonte: p.fonte || '',
                revisao: p.revisao || '',
                cnpjEmpresa: p.cnpjEmpresa || '',
                empresa: (p.cnpjEmpresa && p.cnpjEmpresa.indexOf('08.601.964') >= 0) ? 'Demercado'
                       : ((p.cnpjEmpresa && p.cnpjEmpresa.indexOf('03.015.145') >= 0) ? 'Capital Realty' : ''),
                situacao: p.vencedora ? 'selecionado na equalização' : (p.origem === 'import_pdf' ? 'cotado (avulso)' : 'cotado')
              };
            })
        };
      }),
      series: r.series.map(function (s) {
        // Em ordem de data: sem isso "anterior" e "primeira" não significam
        // nada. A ordem que chega vem do agrupamento, não do tempo.
        const ocs = s.ocorrencias.slice().sort(function (a, b) {
          return (a.data ? a.data.getTime() : 0) - (b.data ? b.data.getTime() : 0);
        });
        const primeira = ocs.filter(function (o) { return o.minimo !== null; })[0];
        let anterior = null;

        return {
          descricao: s.descricao,
          variantes: s.variantes && s.variantes.length > 1 ? s.variantes : null,
          ocorrencias: ocs.map(function (o) {
            const linha = {
              data: cfDataTexto_(o.data),
              empreendimento: o.empreendimento,
              minimo: o.minimo,
              vsAnterior: cfDelta_(o.minimo, anterior ? anterior.minimo : null),
              vsPrimeira: cfDelta_(o.minimo, primeira && primeira !== o ? primeira.minimo : null)
            };
            if (o.minimo !== null) anterior = o;
            return linha;
          })
        };
      })
    };
  } catch (erro) {
    return { ok: false, erro: String(erro && erro.message ? erro.message : erro) };
  }
}

function apiPanorama() {
  try {
    const precos = cfCarregarPrecos_();
    const eq = cfLerTudo_('Equalizacoes');
    const forn = cfLerTudo_('Fornecedores');
    const pend = cfLerTudo_('Pendencias').filter(function (p) { return p.RESOLVIDA !== true; });

    const empreendimentos = {};
    let menorData = null, maiorData = null;
    precos.forEach(function (r) {
      if (r.empreendimento) empreendimentos[r.empreendimento] = true;
      if (r.data) {
        if (!menorData || r.data < menorData) menorData = r.data;
        if (!maiorData || r.data > maiorData) maiorData = r.data;
      }
    });

    // Sugestões: os itens com mais cotações, que é onde a busca rende.
    const porChave = {};
    precos.forEach(function (r) {
      if (!r.chave) return;
      (porChave[r.chave] = porChave[r.chave] || { descricao: r.descricao, n: 0 }).n++;
    });
    const sugestoes = Object.keys(porChave)
      .map(function (k) { return porChave[k]; })
      .sort(function (a, b) { return b.n - a.n; })
      .slice(0, 6)
      .map(function (i) { return i.descricao; });

    return {
      ok: true,
      equalizacoes: eq.length,
      fornecedores: forn.length,
      precos: precos.length,
      pendencias: pend.length,
      empreendimentos: Object.keys(empreendimentos).length,
      periodo: menorData && maiorData
        ? cfDataTexto_(menorData) + ' a ' + cfDataTexto_(maiorData) : null,
      sugestoes: sugestoes,
      versao: CF_VERSAO_APP
    };
  } catch (erro) {
    return { ok: false, erro: String(erro && erro.message ? erro.message : erro) };
  }
}

function cfDataTexto_(d) {
  if (!d) return null;
  return Utilities.formatDate(d, 'America/Sao_Paulo', 'dd/MM/yyyy');
}

/**
 * Variação entre dois preços, para a série.
 * Devolve o sinal junto do valor: quem lê a tela precisa ver "subiu" antes
 * de precisar interpretar o número.
 */
function cfDelta_(atual, base) {
  if (atual === null || atual === undefined || base === null || base === undefined) return null;
  const dif = atual - base;
  return {
    sinal: dif > 0 ? '+' : (dif < 0 ? '−' : '='),
    absoluto: dif,
    percentual: base > 0 ? (dif / base) * 100 : null
  };
}

// ─────────────────────────────────────────────────────────────
//  Mapa de equalização — leitura
// ─────────────────────────────────────────────────────────────

/** As equalizações disponíveis, para o seletor da tela. */
function apiEqualizacoes() {
  try {
    return { ok: true, equalizacoes: cfListarEqualizacoes_() };
  } catch (erro) {
    return { ok: false, erro: String(erro && erro.message ? erro.message : erro) };
  }
}

/**
 * O comparativo de uma equalização.
 * cfMapaEqualizacao_ já devolve tudo serializável — datas viram texto lá,
 * porque Date não atravessa google.script.run de forma confiável.
 */
function apiMapa(idEqualizacao) {
  try {
    const m = cfMapaEqualizacao_(idEqualizacao);
    m.ok = true;
    return m;
  } catch (erro) {
    return { ok: false, erro: String(erro && erro.message ? erro.message : erro) };
  }
}

/**
 * Verificação de autorização no servidor (Etapa 7).
 * Operações de gravação, migração e rollback (desfazer) não estão
 * expostas diretamente no web app (que é somente-leitura). Caso venham
 * a ser acionadas remotamente, exigem e-mail corporativo válido.
 */
function cfExigeAutorizacao_() {
  const usuario = cfUsuario_();
  if (!usuario || usuario === 'desconhecido') {
    throw new Error('Acesso não autorizado: usuário não autenticado.');
  }
  // Domínios autorizados para operações de escrita
  const autorizado = /@(capitalrealty|demercado)\.com\.br$/i.test(usuario);
  if (!autorizado) {
    Logger.log('Tentativa de acesso administrativo negada para: ' + usuario);
    throw new Error('Acesso restrito a usuários autorizados (' + usuario + ').');
  }
  return usuario;
}

/** Imprime a URL publicada. O menu não mostra, e sempre se procura. */
function urlDoWebApp() {
  const url = ScriptApp.getService().getUrl();
  Logger.log(url || 'Ainda não implantado. Vá em Implantar → Nova implantação → Aplicativo da Web.');
  return url;
}
