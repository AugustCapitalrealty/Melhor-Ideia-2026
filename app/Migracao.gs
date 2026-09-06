/**
 * Capital Fornecedores — Migração de Schema e Registros Legados (Etapa 2b)
 *
 * Realiza a migração aditiva para a versão 3 do schema:
 * 1. Executa setupBaseDeDados() para garantir que novas colunas existam nas 21 abas.
 * 2. Atualiza registros antigos da tabela Importacoes sem HASH_VERSAO, definindo HASH_VERSAO = 1.
 * 3. Registra a versão 3 em ScriptProperties.
 */

function migrarParaSchemaV3() {
  return cfComTrava_(function () {
    Logger.log('Iniciando migração para Schema v3...');

    // 1. Garantir colunas novas de forma aditiva
    const resultadoSetup = setupBaseDeDados();
    Logger.log('Setup do schema executado.');

    // 2. Marcar registros legados em Importacoes sem HASH_VERSAO como versão 1
    const importacoes = cfLerTudo_('Importacoes');
    let atualizadas = 0;
    importacoes.forEach(function (imp) {
      if (!imp.HASH_VERSAO) {
        cfAtualizarLinha_('Importacoes', imp._linha, { HASH_VERSAO: 1 });
        atualizadas++;
      }
    });

    // 3. Atualizar versão em ScriptProperties
    // Literais, e não CF_SCHEMA_VERSAO: esta função faz o trabalho da v3
    // e só dela. Derivando da constante, o próximo bump a faria carimbar
    // uma versão que ela não instalou — e o log de auditoria registraria
    // uma migração que não aconteceu.
    PropertiesService.getScriptProperties().setProperty(CF_PROP.schemaVersao, '3');

    cfLog_('migracao_schema', 'schema', 'v3', JSON.stringify({
      importacoesMarcadas: atualizadas,
      versaoAnterior: 2,
      versaoNova: 3
    }));

    Logger.log('Migração para Schema v3 concluída com sucesso.');
    return {
      ok: true,
      schemaVersao: 3,
      importacoesAtualizadas: atualizadas,
      avisosSetup: resultadoSetup.avisos || []
    };
  }, 180);
}


/**
 * Migração para o Schema v4 — taxonomia de categorias.
 *
 * O plano previa a coluna e não previa quem a preencheria. Sem esta
 * etapa, as equalizações que já existem nasceriam todas em "sem
 * categoria" e a tela de categorias abriria vazia no primeiro uso — que
 * é a forma mais rápida de uma funcionalidade nova ser abandonada.
 *
 * A categoria é deduzida das descrições dos itens, do projeto e da área.
 * Onde a dedução não tem confiança (nenhuma palavra bate, ou duas
 * categorias empatam), deixa vazio de propósito: classificar no chute
 * seria pior que não classificar, porque o chute fica indistinguível do
 * acerto depois de gravado.
 *
 * Roda quantas vezes quiser. Nunca sobrescreve categoria já gravada —
 * correção humana ganha de dedução automática, sempre.
 */
function migrarParaSchemaV4() {
  return cfComTrava_(function () {
    Logger.log('── Migração para Schema v4 (taxonomia) ──');

    const resultadoSetup = setupBaseDeDados();
    Logger.log('Colunas garantidas.');

    const descricoes = {};
    cfLerTudo_('EAP').forEach(function (n) {
      if (!n.ID_EQUALIZACAO || !n.DESCRICAO) return;
      (descricoes[n.ID_EQUALIZACAO] = descricoes[n.ID_EQUALIZACAO] || []).push(n.DESCRICAO);
    });

    let classificadas = 0, semConfianca = 0, jaTinham = 0;

    cfLerTudo_('Equalizacoes').forEach(function (eq) {
      if (eq.CATEGORIA) { jaTinham++; return; }

      const cat = cfCategoriaDerivada_(cfTextosDaEqualizacao_(eq, descricoes[eq.ID]));
      if (!cat) {
        semConfianca++;
        Logger.log('  sem confiança: ' + eq.ID + ' · ' + (eq.PROJETO || '(sem projeto)'));
        return;
      }

      cfAtualizarLinha_('Equalizacoes', eq._linha, { CATEGORIA: cat });
      classificadas++;
      Logger.log('  ' + eq.ID + ' → ' + cat);
    });

    PropertiesService.getScriptProperties().setProperty(CF_PROP.schemaVersao, '4');

    cfLog_('migracao_schema', 'schema', 'v4', JSON.stringify({
      classificadas: classificadas, semConfianca: semConfianca, jaTinham: jaTinham,
      versaoAnterior: 3, versaoNova: 4
    }));

    Logger.log('');
    Logger.log('Classificadas: ' + classificadas +
               ' · já tinham: ' + jaTinham +
               ' · sem confiança: ' + semConfianca);
    if (semConfianca) {
      Logger.log('As sem confiança ficam em branco e podem ser escolhidas à mão na tela.');
    }
    Logger.log('Schema v4 instalado.');

    return {
      ok: true, schemaVersao: 4,
      classificadas: classificadas, semConfianca: semConfianca, jaTinham: jaTinham,
      avisosSetup: resultadoSetup.avisos || []
    };
  }, 180);
}
