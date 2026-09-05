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

Depois, execute nesta sequência:

1. `verificarConfiguracao()` — confira a URL da planilha, schema instalado `v1`
   e as 21 abas marcadas como `ok`. Isso confirma a instalação, não os dados.
2. `setupBaseDeDados()` novamente — todas as abas devem indicar `sem mudança`.
3. Repita `setupBaseDeDados()` mais uma vez para conferir o mesmo resultado.

O setup cria a estrutura vazia; ainda não importa equalizações nem preenche
cadastros. O código usa primeiro a planilha à qual o script está vinculado,
por isso abra o Apps Script a partir da planilha da base indicada acima.

O push para o GitHub não atualiza este projeto no Apps Script: copie os arquivos
atualizados para o editor antes de executar. Não há sincronização configurada.

## Ordem dos arquivos

`Config.gs` declara o schema; os outros leem dele. Os três arquivos precisam
estar no mesmo projeto. Não é necessário executar `Config.gs` ou as funções
auxiliares de `Util.gs` separadamente: selecione as funções de entrada acima.

| Arquivo | Papel |
| :--- | :--- |
| `Config.gs` | **Única fonte da verdade do schema.** 21 abas, 213 colunas |
| `Util.gs` | Trava, normalização de texto, número BR, data, ID, hash, log |
| `Schema.gs` | `setupBaseDeDados()` e `verificarConfiguracao()` |
| `Import.gs` | `analisarEqualizacao(fileId)` — lê uma equalização e relata **sem gravar** |
| `Dados.gs` | Acesso genérico às abas: leitura em lote, inserção, remoção |
| `Persistencia.gs` | `importarEqualizacao()` e `desfazerImportacao()` |
| `Consulta.gs` | `consultarPreco(termo)` e `panoramaDaBase()` — o histórico respondendo |
| `Codigo.gs` | `doGet()` e a API do navegador |
| `Interface.html` | A tela |

## Publicar o web app

1. No editor, **＋ → HTML**, nomeie `Interface`, cole o `Interface.html`
2. **Implantar → Nova implantação → Aplicativo da Web**
3. Executar como: **Eu** · Quem tem acesso: **Qualquer pessoa da organização**
4. Copie a URL. `urlDoWebApp()` também imprime ela no Log

⚠️ **Salvar ≠ implantar.** Salvar atualiza o que *você* executa pelo menu; para o
que os outros veem, é preciso **Implantar → Gerenciar implantações → editar → Nova versão**.
"Nova implantação" cria uma URL diferente — é o erro mais comum.

## Regra ao mexer no schema

Coluna nova vai **sempre no fim** da lista em `Config.gs`, e sobe
`CF_SCHEMA_VERSAO`. Inserir no meio desloca dado já gravado.

`setupBaseDeDados()` é seguro rodar de novo: cria o que falta, acrescenta
coluna nova no fim, e **nunca apaga** coluna que saiu do schema — só avisa.
