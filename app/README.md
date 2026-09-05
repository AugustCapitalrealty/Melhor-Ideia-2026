# app/ — Google Apps Script

## Instalar

1. Abra a planilha da base:
   https://docs.google.com/spreadsheets/d/1PLuAqtKz2dscfSfAekfEGTAZTAzT8m0R0FfaJ9PmSnc
2. **Extensões → Apps Script**
3. Cole cada arquivo `.gs` num arquivo de mesmo nome no editor
4. Cole o conteúdo de `appsscript.json` no manifesto
   *(Configurações do projeto → "Mostrar appsscript.json no editor")*
5. Ative o **serviço avançado do Drive** (Serviços → Drive API → v2)
6. Execute **`setupBaseDeDados`** e autorize
7. Veja o resultado no Log — **Ctrl+Enter**

Depois, `verificarConfiguracao()` mostra o que está valendo.

## Ordem dos arquivos

`Config.gs` declara o schema; os outros leem dele. No Apps Script a ordem
de carga é alfabética e todo `.gs` compartilha o mesmo escopo global,
então não há import — só não renomeie `Config.gs` para algo depois de `S`.

| Arquivo | Papel |
| :--- | :--- |
| `Config.gs` | **Única fonte da verdade do schema.** 21 abas, 213 colunas |
| `Util.gs` | Trava, normalização de texto, número BR, data, ID, hash, log |
| `Schema.gs` | `setupBaseDeDados()` e `verificarConfiguracao()` |

## Regra ao mexer no schema

Coluna nova vai **sempre no fim** da lista em `Config.gs`, e sobe
`CF_SCHEMA_VERSAO`. Inserir no meio desloca dado já gravado.

`setupBaseDeDados()` é seguro rodar de novo: cria o que falta, acrescenta
coluna nova no fim, e **nunca apaga** coluna que saiu do schema — só avisa.
