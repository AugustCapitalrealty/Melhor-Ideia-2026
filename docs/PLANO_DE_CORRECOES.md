# Plano de correções — Capital Fornecedores

**Data:** 05/09/2026. **Situação:** Executado e validado no repositório (Etapas 1 a 7 concluídas e verificadas por testes automatizados).

Objetivo: tornar a importação e a consulta confiáveis antes de ampliar o histórico ou iniciar o piloto. Este plano parte da [auditoria completa](AUDITORIA_COBERTURA_COMPLETA.md) e do código atual. Não representa autorização para apagar registros, substituir a base de produção ou publicar uma nova versão sem homologação.

## Ordem de execução

| Etapa | Prioridade | Resultado esperado | Dependência | Status |
| --- | --- | --- | --- | :---: |
| 1. Preparar referência e ambiente de validação | P0 | Correções verificáveis sem afetar a base em uso | Nenhuma | **Concluído** (`tests/`) |
| 2. Corrigir identidade e rastreabilidade dos registros | P0 | Separar documento, cotação, revisão e importação | 1 | **Concluído** (`app/Schema.gs`, `app/Persistencia.gs`) |
| 3. Corrigir reimportação, desfazer e falhas de gravação | P0 | Não duplicar nem perder registros | 2 | **Concluído** (`app/ImportOrcamento.gs`, `app/Persistencia.gs`) |
| 4. Preservar contexto e natureza dos preços | P0 | Empresa, Mega, unidade, período e escopo corretos | 2 | **Concluído** (`app/Config.gs`, `app/Persistencia.gs`) |
| 5. Corrigir comparação e apresentação | P0 | Consultas sem misturar valores incompatíveis | 3 e 4 | **Concluído** (`app/Consulta.gs`, `app/Codigo.gs`, `app/Interface.html`) |
| 6. Conciliar o legado | P1 | Proposta concreta de correção dos dados existentes | 3 a 5 | **Concluído** (`tools/conciliar-legado.cjs`, `dados/relatorio-conciliacao.json`) |
| 7. Validar um fluxo completo e atualizar a documentação | P1 | Critérios objetivos para liberar o piloto | 6 | **Concluído** (`tests/ciclo-completo.cjs`) |

P0 bloqueia a ampliação da carga e a liberação do piloto. P1 fecha a validação do conjunto. Cada etapa tem alteração revisável e evidências de aceitação aprovadas.

## 1. Preparar referência e ambiente de validação

- Registrar versão do código, contagem de registros e vínculos da base existente. Contar linhas por ID preenchido, ignorando checkboxes de linhas vazias.
- Preparar uma cópia de trabalho para ensaiar migrações e correções. Manter uma referência recuperável da base antes de qualquer alteração futura.
- Montar casos de validação com dados já auditados: orçamento avulso, equalização com vários fornecedores, ADS global, PMOC anual, mensalidade de utilities, Base Papéis sem unidade e um caso de negociação.
- Reproduzir os defeitos conhecidos antes de implementar a solução. Os testes devem verificar o resultado esperado, sem depender apenas da contagem de linhas.

**Pronto quando:** os casos demonstram os defeitos atuais, a referência inicial é reproduzível e o ambiente de ensaio está separado da base em uso.

## 2. Corrigir identidade e rastreabilidade

**Arquivos principais:** `app/Schema.gs`, `app/ImportOrcamento.gs`, `app/Persistencia.gs` e `tools/consolidar-acervo.cjs`.

- Separar identidade do arquivo de origem, identidade da cotação do fornecedor, revisão e execução da importação. Um mapa pode conter várias propostas; uma proposta pode ter várias fontes.
- Preservar o ID real do Drive. Não fabricar IDs de arquivo para contornar a restrição atual de uma proposta por PDF no consolidador.
- Definir vínculos que permitam localizar proposta, itens e preços de uma importação avulsa, mesmo sem equalização. Hoje a EAP avulsa depende do vínculo por `Precos` para chegar à proposta.
- Distinguir revisão do documento do fornecedor de rodada de negociação. Tratar vínculos duvidosos como pendência, sem fundir por nome ou valor semelhantes.
- Ampliar o hash para incluir os campos relevantes: empresa, empreendimento, unidades, totais, descontos, escopo e condições, além dos campos atuais. Definir como reconhecer registros gerados pela versão anterior do hash.
- Fazer migração aditiva do schema, com compatibilidade temporária para registros antigos; ausência de informação não deve ser preenchida com suposição.

**Pronto quando:** um PDF com três fornecedores representa três cotações; PDF e planilha da mesma cotação podem ser relacionados; uma mudança apenas de empresa, unidade ou total é detectada; fontes e revisões continuam recuperáveis.

## 3. Corrigir reimportação, desfazer e gravação parcial

**Arquivos principais:** `app/ImportOrcamento.gs`, `app/Persistencia.gs` e rotinas de persistência em `app/Dados.gs`/`app/Util.gs`, conforme os vínculos definidos na etapa 2.

- Tornar a importação repetida do mesmo conteúdo uma operação sem duplicação.
- Localizar versões anteriores pela identidade da fonte/cotação, não apenas pelo hash. Quando o conteúdo mudar, registrar a revisão e impedir que a versão anterior continue sendo somada como cotação atual.
- Corrigir `desfazerImportacao` para contemplar propostas avulsas, itens, preços e pendências pertencentes à importação, preservando registros compartilhados e cadastros de fornecedor.
- Separar a função pública de desfazer da rotina interna usada durante reimportação, evitando aquisição de trava dentro de outra operação já travada.
- Validar o lote antes de gravar. Registrar estado de processamento e tratar falhas intermediárias, sem deixar uma importação parcial marcada como concluída.
- Definir recuperação/reversão do lote em caso de erro; não apagar a versão válida antes de garantir que a nova versão pode ser promovida.

**Pronto quando:** importar duas vezes mantém os mesmos registros ativos; reimportar conteúdo alterado mantém rastreabilidade sem dupla contagem; desfazer remove somente o lote alvo; uma falha simulada entre gravações não deixa dados órfãos nem elimina a versão válida.

## 4. Preservar contexto e natureza dos preços

**Arquivos principais:** `app/Schema.gs`, `app/Import.gs`, `app/ImportOrcamento.gs` e `app/Persistencia.gs`.

- Persistir empresa por proposta, inclusive avulsa. Curitiba pode conter Capital Realty e Demercado; o Mega sozinho não identifica a empresa.
- Derivar a UF do empreendimento confirmado. A UF do fornecedor deve permanecer como dado cadastral separado.
- Distinguir preço unitário, total de linha, valor global, preço contratual e valor periódico. Guardar duração do contrato, período de cobrança e quantidade de visitas separadamente.
- Corrigir a marcação de serviços globais: total informado com unitário ausente não significa `nao_cotado`.
- Corrigir a gravação das equalizações para não copiar o mesmo valor automaticamente para unitário e total. Calcular somente quando quantidade e unidade sustentarem a operação; manter o valor original e a origem do cálculo.
- Preservar ausência, zero explícito, exclusão e inclusão em outro item como situações distintas. Itens descritivos e subtotais não devem duplicar o preço do pacote.
- Preservar embalagem e unidade literal; as 79 linhas da Base Papéis continuam pendentes até confirmação. Códigos genéricos como `UN` e `KG` não identificam produtos.
- Manter totais e unitários impressos da Litoral, com divergência registrada; não reaplicar desconto.
- Separar datas de proposta, equalização, revisão e vigência. Registrar inconsistências sem corrigir pela data do nome do arquivo.
- Separar valor inicial, negociado e selecionado. A revisão de Norte Sul no reservatório não pode desaparecer porque o quadro principal está desatualizado.

**Pronto quando:** ADS aparece como valor global sem unitário inventado; PMOC mantém período e visitas; mensalidade e total anual não se confundem; empresa e UF permanecem corretas; subtotal mais componentes não dobra a soma.

## 5. Corrigir comparação e apresentação

**Arquivos principais:** `app/Consulta.gs`, `app/Codigo.gs` e `app/Interface.html`.

- Separar listagem do histórico de cálculo de faixa comparável. Um registro incompleto pode ser consultado com sua pendência, sem entrar no cálculo de menor/maior preço.
- Preservar proposta, data, empresa e Mega de cada ocorrência. Corrigir o agrupamento atual por descrição mais equalização vazia, que reúne orçamentos avulsos distintos.
- Formar comparações por item validado, unidade/embalagem compatível, natureza do preço e escopo/período. Não aplicar conversão de embalagem sem fator confirmado.
- Nos serviços, exibir frequência, equipamentos e inclusões relevantes. Os três PMOC de Curitiba não devem ser apresentados como ofertas equivalentes apenas pelo título.
- Exibir fornecedor, fonte, revisão e situação documental. Usar “cotado”, “selecionado na equalização” e “contratual” conforme a evidência; não apresentar cotação como preço pago.
- Calcular faixas somente com valores compatíveis. Seleção de fornecedor e economia não devem ser inferidas automaticamente do menor total.
- Manter API, interface e relatório usando a mesma regra de cálculo. Ajustar rótulos dentro do design system existente.

**Pronto quando:** propostas avulsas de datas diferentes permanecem distintas; preço anual não entra na faixa mensal; quantidade desconhecida não vira unitário; a interface permite abrir a fonte que sustenta cada ocorrência e explica exclusões da comparação.

## 6. Conciliar os registros existentes

**Referências:** `dados/auditoria_cobertura.json`, `dados/historico_orcamentos.json` e a base Google consultada na auditoria.

- Preparar um relatório de diferenças entre os 21 orçamentos locais e a base Google, indicando inclusões, vínculos, revisões e correções propostas.
- Revisar Wi-Fi e utilities já importados: empresa ausente, fornecedor sem CNPJ, periodicidade das mensalidades e repetição de Eletrobarras em duas colunas.
- Usar os originais para resolver divergências; as duas fontes que responderam HTTP 401 permanecem pendentes até que estejam acessíveis. Não reconstruir informações ausentes por adivinhação.
- Relacionar os dois mapas idênticos de consumo de abril, as versões do piso de Esteio e a ADS avulsa. Resolver a data divergente de Imunizadora RP antes de confirmar a fusão.
- Vincular a OC Fabesul à cotação existente sem gerar outra compra. Preparar o vínculo do contrato Canaveral às cotações, preservando a diferença entre preço contratual e compra efetiva.
- Em Engenharia, documentar a relação entre proposta, EAP e equalização, mantendo divergências de escopo e revisão visíveis.
- Gerar uma prévia das alterações por registro e um procedimento de recuperação antes de aplicar qualquer conciliação à base em uso.

**Pronto quando:** cada divergência tem correção proposta com fonte ou pendência explícita; nenhuma fusão depende apenas de nome/total parecido; os totais antes/depois são explicáveis e as fontes restritas permanecem identificadas.

## 7. Validar o fluxo e atualizar a documentação

- Executar o ciclo importar → consultar → reimportar → consultar → desfazer no ambiente de ensaio, com pelo menos um caso de materiais e um de serviços.
- Conferir contagens, integridade dos vínculos, valores, empresa, Mega, fontes e compatibilidade das comparações.
- Verificar as funções administrativas expostas pelo web app: operações de gravação/desfazer precisam de autorização no servidor e não podem depender apenas da ausência de botão na interface.
- Atualizar instruções de execução, versões e estado das fases. Remover afirmações de funcionalidade concluída ou de “preço pago” que ainda não tenham evidência.
- Definir uma tarefa representativa para o comprador e medir o tempo do processo atual antes do piloto. Medir novamente após a validação, sem prometer redução antecipadamente.

**Pronto quando:** os casos de aceitação passam; o fluxo demonstrado preserva dados e fontes; o acesso administrativo está verificado; há instrução clara de operação e recuperação. A validação com comprador vem depois dessa liberação técnica.

## Limite deste plano

A extração integral das 31 cotações candidatas, a carga dos 28 preços contratuais, presets, novas telas de equalização, SLA, Fluig e apresentação do concurso não fazem parte destas correções. A ampliação do acervo deve ocorrer depois que importação e consulta atenderem aos critérios acima. Não se atribui prazo fechado antes de reproduzir os defeitos e definir a migração.

---

## Correções posteriores à carga do acervo

### Cotação Base Papéis 188139 estava no Mega errado — corrigido em 05/09/2026

A cotação `188139` (15/07/2026, R$ 492,05, 14 preços) estava gravada como
`MEGA CENTRO LOGÍSTICO CURITIBA`. É Mega Esteio, confirmado com a operação.

**A causa não foi descuido, foi regra errada.** O cabeçalho de
`app/DadosBasePapeis.gs` documentava a decisão como acerto da extração: o
endereço de entrega da cotação é Juvevê, Curitiba, logo seria "outro
empreendimento". A inferência não se sustenta.

**Regra do domínio, para não repetir:** o endereço físico do receptor é
SEMPRE Curitiba, qualquer que seja o destino da compra. Não há um CNPJ por
estado. O mesmo endereço aparece em compras para Esteio, Curitiba e Itajaí,
então endereço, cidade e UF do documento **não determinam o empreendimento**.
Ele vem do destino da compra. Quando o documento não disser explicitamente,
perguntar a quem conduz a operação — não deduzir.

**O que foi feito:** `CF_MEGA_CURITIBA` trocado por `CF_MEGA_ESTEIO` na linha
da cotação, comentário do cabeçalho reescrito para registrar a regra correta,
e reimportação com `importarBasePapeis()` (em `app/DadosBasePapeis.gs`), que
refaz o registro sem duplicar.

**A revisar quando houver tempo:** qualquer outra atribuição de empreendimento
feita a partir de endereço do fornecedor nos demais arquivos `Dados*.gs`.
