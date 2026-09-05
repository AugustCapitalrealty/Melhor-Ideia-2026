/**
 * Capital Fornecedores — web app
 *
 * Uma URL, uma tela. O cálculo é o mesmo que a consulta do Logger usa —
 * se a tela e o relatório recalculassem por conta própria, um dia
 * divergiriam e ninguém saberia qual está certo.
 */

const CF_VERSAO_APP = '2026-09-05.1';

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
          precos: g.precos.sort(function (a, b) { return a.valor - b.valor; })
            .map(function (p) {
              return {
                fornecedor: p.fornecedor,
                valor: p.valor,
                vencedora: !!p.vencedora,
                semCadastro: !!p.semCadastro
              };
            })
        };
      }),
      series: r.series.map(function (s) {
        return {
          descricao: s.descricao,
          ocorrencias: s.ocorrencias.map(function (o) {
            return { data: cfDataTexto_(o.data), empreendimento: o.empreendimento, minimo: o.minimo };
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

/** Imprime a URL publicada. O menu não mostra, e sempre se procura. */
function urlDoWebApp() {
  const url = ScriptApp.getService().getUrl();
  Logger.log(url || 'Ainda não implantado. Vá em Implantar → Nova implantação → Aplicativo da Web.');
  return url;
}
