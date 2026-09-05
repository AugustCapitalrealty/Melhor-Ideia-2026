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
    PropertiesService.getScriptProperties().setProperty(
      CF_PROP.schemaVersao,
      String(CF_SCHEMA_VERSAO)
    );

    cfLog_('migracao_schema', 'schema', 'v3', JSON.stringify({
      importacoesMarcadas: atualizadas,
      versaoAnterior: CF_SCHEMA_VERSAO - 1,
      versaoNova: CF_SCHEMA_VERSAO
    }));

    Logger.log('Migração para Schema v3 concluída com sucesso.');
    return {
      ok: true,
      schemaVersao: CF_SCHEMA_VERSAO,
      importacoesAtualizadas: atualizadas,
      avisosSetup: resultadoSetup.avisos || []
    };
  }, 180);
}

