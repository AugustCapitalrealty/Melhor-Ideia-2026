# Avaliação operacional: comprador sênior e aprovador

Data: 06/09/2026. Código avaliado: commit `f944187`.

## Parecer

**Como comprador sênior, usaria a plataforma para preparar e consultar cotações, com conferência das fontes. Antes de confiar nela para encaminhar decisões reais, corrigiria o vínculo fornecedor/preço, a definição do valor negociado vigente e a comparação de escopos.** A experiência já facilita a digitação; o principal ganho seguinte é reduzir erros de equalização e devoluções do aprovador.

**Como destinatário da planilha/PDF, preciso entender o que estou autorizando sem refazer a compra.** O documento já oferece resumo, comparativo, condições e assinaturas. Ainda pode recomendar uma proposta parcial, destacar outra como menor e omitir ressalvas que mudam a decisão. A revisão independente do segundo agente está em [Avaliação do aprovador](AVALIACAO_APROVADOR_2026-09-06.md).

Esta entrega é uma avaliação e um plano de melhorias. Foram adicionados relatórios e reproduções locais; a aplicação não foi alterada nem publicada.

## Método e limites

- Leitura do formulário, persistência, homologação, histórico, exportação e testes existentes; revisão independente por um segundo agente no papel de aprovador.
- Suíte existente executada: **37/37 verificações de estrutura/ciclo e 37 cenários de correções**, ambos os processos com código de saída 0. A suíte mistura inspeções do fonte e execução de comportamento, e não equivale a 74 jornadas no navegador.
- **11 reproduções adicionais** em [avaliar-fluxo-compras.cjs](../tools/avaliar-fluxo-compras.cjs), com funções reais e armazenamento/DOM simulados. C10 confirma uma escolha intencional do produto; os demais demonstram falhas ou lacunas específicas.
- **7 reproduções da exportação/mapa** em [avaliar-exportacao-aprovador.cjs](../tools/avaliar-exportacao-aprovador.cjs), capturando a grade em memória. Ambos os scripts foram executados com saída 0, confirmando os comportamentos documentados.
- Nenhuma execução na implantação ou alteração da base do Google. Não houve navegação real nem inspeção visual de um PDF recém-gerado. A análise de paginação/legibilidade do segundo agente contém hipóteses a validar em arquivos reais.
- Valores, fornecedores e documentos de exemplo deste relatório são fictícios. As prioridades são recomendações de operação; não presumem regras de alçada ou número mínimo de propostas da empresa.
- O relatório anterior de PO/PM usava `1a626aa`. Correções posteriores já preservam IDs em edições usuais, fazem tentativa de restauração após falha e alinham o valor do resumo com a homologação. Os achados abaixo foram conferidos novamente no código atual.

Para reproduzir em ambiente com Node no PATH:

```powershell
node tools/avaliar-fluxo-compras.cjs
node tools/avaliar-exportacao-aprovador.cjs
```

O script descreve os comportamentos observados e encerra com sucesso quando consegue reproduzi-los. **Ele não certifica que esses comportamentos estão corretos e não integra a suíte de regressão.** Após as correções, os casos devem virar testes do comportamento esperado.

## 1. Pela perspectiva de quem realiza a cotação

### O que já ajuda

- **Menos redigitação:** busca de fornecedor por nome/CNPJ, cadastro interno e consulta externa como apoio.
- **Produtividade na grade:** colagem de blocos do Excel, navegação vertical por Enter, cabeçalhos fixos, grupos e códigos derivados. Essas funções devem ser preservadas.
- **Proteção do preenchimento:** rascunho por cotação em edição e contexto de nova compra.
- **Informação comercial disponível:** pagamento, validade, início, prazo, faturamento direto, link da proposta, premissas e detalhamento já têm campos. A melhoria é torná-los consistentes e visíveis no momento da decisão.
- **Memória de compras:** histórico e ficha do fornecedor são úteis para procurar fontes e preparar negociações, desde que unidade, período e escopo sejam conferidos.

Referências: `app/Interface.html:2042`, `:2500`, `:2766`, `:2875`; `app/Consulta.gs:20`; `app/Fornecedores.gs`.

### Correções prioritárias comprovadas

P0 = corrigir antes de usar o caminho afetado para uma decisão real. P1 = corrigir na preparação do piloto. P2 = evolução guiada pelo uso.

| Prioridade / caso | O que ocorre hoje e impacto para o comprador | Melhoria e critério de aceite |
| --- | --- | --- |
| **P0 · C01 — preço atribuído a outro fornecedor** | Ao salvar A / coluna sem nome / Gama, com preços 100 / 900 / 300, Gama recebe 900. O servidor elimina fornecedores vazios e usa o novo índice para ler os preços. `app/Equalizacao.gs:295`, `:390`. | Vincular preços à identidade estável da coluna; ao excluir uma coluna, preservar o vínculo das demais. Coluna sem identificação e com dados deve gerar aviso acionável. Reabrir deve mostrar Gama = 300. |
| **P0 · C02 — troca de fornecedor herda a decisão** | Depois de homologar Alfa, substituí-la por Gama na mesma posição reaproveita o ID. Gama fica como proposta vencedora, enquanto a decisão conserva o CNPJ de Alfa e o parecer “Escolha da Alfa”. `app/Equalizacao.gs:336`, `:429`, `:488`. | Novo fornecedor deve ter identidade própria. A decisão anterior precisa continuar vinculada à proposta e ao fornecedor originais; remover/substituir exige tratamento explícito. Nunca exibir nome, CNPJ e parecer de empresas diferentes na mesma decisão. |
| **P0 · C03 — total parcial concorre com total completo** | Parcial: material 100 e instalação sem preço. Completa: material 120 + instalação 80. O resumo recomenda a parcial e anuncia diferença de 100 como economia; a homologação aceita sem parecer. O editor já mostra quantidade de itens sem cotar, mas isso não determina elegibilidade. `app/Interface.html:2619`; `app/Equalizacao.gs:676`; `app/Exportar.gs:690`. | Mostrar cobertura de escopo e pendências em todas as etapas. Definir itens obrigatórios, inclusos, opcionais e excluídos. Só recomendar automaticamente propostas de escopo comparável; permitir adjudicação parcial quando ela for explicitamente definida e documentada. |
| **P0 · C08 — R02 não se torna o valor vigente** | Inicial/declarado 1.000, R01 900, R02 850: a edição mostra redução de 150, mas salva rodada R02 com total 1.000 e sem redução; esse valor é homologado. `app/Interface.html:2174`; `app/Equalizacao.gs:498`. | Exibir um único “valor vigente para decisão”, sua rodada e documento de origem. Se R02 divergir do total declarado, pedir resolução da divergência. Após selecionar R02 como vigente, edição, mapa, homologação e exportação devem concordar em 850 e redução de 150. |
| **P0 · C04/C06 — homologação sem valor ou com valor negativo** | Uma proposta única sem preço vira homologada com valor nulo; preço de -100 também é aceito. `app/Equalizacao.gs:661`. | Manter rascunhos incompletos, mas exigir valor utilizável ao homologar. Tratar desconto como ajuste identificado; preservar item gratuito/incluso com significado explícito, sem confundi-lo com falta de preço. |
| **P1 · C05 — quantidade zero vira uma unidade** | Quantidade 0 × unitário 100 resulta em total 100. `app/Equalizacao.gs:395`. | Validar quantidade e informar a regra de totalização. Zero explícito não pode ser substituído silenciosamente por 1; serviço por verba precisa de base identificada. |
| **P1 · C09 — notas digitadas desaparecem** | “Notas Capital Realty” entra no rascunho, mas não no payload de Salvar. O banco recebe vazio, e uma edição pode apagar notas anteriores. `app/Interface.html:2893`, `:3289`; `app/Equalizacao.gs:485`. | Enviar e preservar o campo. Digitar → salvar → reabrir → exportar deve manter o mesmo texto. Não confundir essas notas com notas internas destinadas a outra visibilidade. |
| **P1 · C07 — validade não orienta a ação** | Proposta com validade em 2000 é homologada sem tratamento. O campo existe; falta verificar a condição na decisão. `app/Equalizacao.gs:520`, `:661`. | Mostrar “válida”, “vencida” e “não informada”. Ao encaminhar uma vencida, registrar revalidação e fonte, ou exceção conforme regra definida pela operação. |
| **P1 · C11 — histórico mistura bases de comparação** | Mesma descrição com 5 por unidade e 50 por caixa entra na mesma série, sem fator de conversão. A carga também não expõe `PERIODO_COBRANCA`. `app/Consulta.gs:20`, `:98`, `:137`. | Condicionar variação a unidade, embalagem, periodicidade e escopo compatíveis. Sem conversão confirmada, exibir séries separadas ou “bases diferentes”. Cotação mensal não deve sugerir economia frente a valor anual sem conversão documentada. |

### Melhorias no trabalho diário

| Etapa | Melhoria sugerida | Resultado observável |
| --- | --- | --- |
| Abrir uma compra | Duplicar uma equalização como nova, escolhendo copiar escopo e fornecedores. Informar necessidade, data desejada e compra pontual/recorrente. **P1.** | Nova compra com novo ID e sem herdar decisão, validade ou preço vigente como se fossem atuais. |
| Preparar escopo | Modelos reutilizáveis por tipo de compra, com unidade/embalagem, período, especificação e exclusões. **P1.** | Os proponentes respondem à mesma lista e o comprador identifica exceções antes de somar. |
| Receber propostas | Exibir situação por fornecedor: aguardando, recebida, incompleta, revisada ou declinada. Destacar prazo, validade e itens pendentes no cabeçalho da coluna. **P1.** | Saber de quem cobrar retorno sem abrir todos os detalhes. Proposta única segue a política definida, sem mínimo inventado pelo sistema. |
| Equalizar condições | Estruturar frete, mobilização, instalação, descontos globais, encargos informados, faturamento direto, garantia e responsabilidades; indicar o que já está incluso. O schema já prevê `Ajustes` e `Clausulas`, mas o formulário não oferece esse tratamento completo. **P1.** | Ponte auditável entre soma dos itens, ajustes e valor comparável, sem cobrança duplicada. |
| Consultar histórico | Abrir histórico do item ao lado da grade, com fonte, data, unidade/período e distinção entre cotado, homologado e contratação comprovada. **P1.** | Usar uma referência sem perder a posição na cotação e sem tratar orçamento avulso como preço efetivamente pago. |
| Negociar | Guardar cada rodada com preço, validade, condições, responsável e proposta correspondente. Hoje ficam a inicial e a última rodada; R01 não tem armazenamento independente quando já existe R02. **P1.** | Reconstruir inicial → R01 → R02 e identificar alteração de escopo, além de alteração de preço. Referências: `app/Equalizacao.gs:498`; `app/Interface.html:3162`. |
| Encaminhar | Prévia do documento com pendências e recomendação fundamentada antes da exportação. **P1.** | O comprador vê o mesmo valor, cobertura e ressalvas que chegarão ao gestor. |
| Evoluir entrada de documentos | Importação assistida de Excel/PDF com conferência de colunas, unidades e totais antes de gravar. **P2.** | Redução mensurada de transcrição, mantendo a conferência humana do conteúdo extraído. |

## 2. Pela perspectiva de quem recebe a planilha/PDF

O segundo agente avaliou o código de exportação e reproduziu inconsistências em ambiente simulado. O [relatório independente](AVALIACAO_APROVADOR_2026-09-06.md) traz as referências e critérios de aceite completos.

| Prioridade | Melhoria na aprovação | Por que importa |
| --- | --- | --- |
| **P0** | Fazer resumo, total destacado e variação percentual usarem a mesma base de decisão, com itens e ajustes demonstrados separadamente. | Com A declarado 900/soma 1.000 e B 950/950, o resumo recomenda A, mas a variação marca B como base de menor preço. Isso obriga o gestor a refazer a conta. |
| **P0** | Levar cobertura e pendências materiais ao resumo e impedir recomendação automática de escopos incompatíveis. | “Menor total” pode significar apenas que parte do serviço ficou de fora. |
| **P1** | Preservar no documento os estados “incluso”, “excluído”, “não aplicável” e “não cotado”. | A exportação atualmente pode transformar todos em “não cotou”, alterando o entendimento do escopo. |
| **P1** | Exibir valor e composição do faturamento direto, validade e prazos de forma consistente com a proposta. | Hoje o faturamento direto exporta “sim”, sem o valor; há lacunas de datas e validade de documentos importados. |
| **P1** | Distinguir indicação do comprador, parecer técnico e aprovação da alçada; mostrar responsável, data e revisão da decisão. | O controle atual verifica domínio corporativo; os campos de assinatura não comprovam aprovação de cada papel. Nomes e regras finais precisam refletir o processo real da empresa. |
| **P1** | Mostrar alterações posteriores à decisão e manter acesso ao retrato aprovado. | C10 confirma que aumentar 100 para 500 mantém status e parecer anteriores. Isso é intencional no código atual; a melhoria proposta é evidenciar a revisão comercial e definir tratamento de alterações materiais, preservando a decisão anterior. |
| **P1** | Chamar a diferença para o maior preço de “diferença entre propostas comparáveis”; apresentar redução negociada com inicial e final da mesma base. | A distância entre preços recebidos não demonstra redução causada pela negociação ou pela plataforma. |
| **P2** | Separar síntese de decisão do anexo técnico e testar formatos com muitos itens/proponentes. | Evita reduzir todo o comparativo até ficar ilegível. Quebras e tamanho de fonte ainda precisam de validação em PDF real. |

### Conteúdo proposto para a primeira página

Modelo de informação, não uma exportação já implementada:

1. **Decisão solicitada:** contratação, objeto e Mega; fornecedor indicado e motivo.
2. **Valor a autorizar:** total equalizado, compra pontual ou período contratual; composição itens + ajustes e tratamento de faturamento direto. Orçamento disponível e diferença, quando houver referência aprovada.
3. **Comparação resumida:** fornecedor, cobertura, total comparável, prazo, pagamento, validade e situação técnica. Empate e ausência de comparação devem ser explícitos.
4. **Ressalvas para decidir:** exclusões, riscos, pendências e justificativa para escolher proposta mais cara ou parcial.
5. **Rastreabilidade:** identificação/revisão da equalização, fontes das propostas e data; quem elaborou, emitiu parecer e aprovou, conforme etapa efetivamente concluída.

Depois vêm comparativo completo, condições, premissas e anexos. Links precisam ser abertos com a conta do aprovador no piloto; funcionar para o comprador não comprova acesso do destinatário.

## Sequência recomendada e aceite operacional

1. **Corrigir integridade e valores:** C01, C02, C08, C04/C06 e divergência de bases do exportado. Incorporar regressões do comportamento correto.
2. **Fechar comparabilidade:** C03, C11, estados de escopo, ajustes, notas e validade. Mesma informação na edição, mapa e documento.
3. **Melhorar a preparação e a leitura:** situação das propostas, histórico contextual, rodadas preservadas e primeira página de decisão.
4. **Executar piloto acompanhado com comprador e aprovador**, após os bloqueios: material completo; proposta parcial; serviço mensal versus anual; escolha mais cara por prazo; R02 com desconto; edição/troca de fornecedor após decisão. Incluir PDF com 3 e 6 proponentes e escopo longo.

No piloto, registrar tempo para montar e conferir a cotação, tempo do gestor para identificar objeto/valor/motivo/ressalvas, devoluções por informação ausente e divergências com a fonte. Meta de aceite proposta: nenhuma divergência de identidade, valor ou escopo; o aprovador conseguir explicar o que está aprovando sem refazer a equalização. Ganhos de tempo só devem ser declarados depois da medição comparável com a planilha.
