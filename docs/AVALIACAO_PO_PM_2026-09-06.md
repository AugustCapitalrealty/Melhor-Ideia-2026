# Avaliação de Product Owner e Product Manager

Data: 06/09/2026. Base analisada: checkout local no commit `1a626aa`.

## Parecer conjunto

O Capital Fornecedores tem um MVP implementado de equalização com histórico de preços e fornecedores. Recomendamos preparar um piloto controlado, condicionado à correção dos riscos de integridade da decisão e à conciliação dos dados utilizados. A coleta de baseline no Excel pode começar imediatamente.

O próximo marco de produto é um comprador concluir cotações reais e um gestor usar os documentos resultantes para decidir, com tempo, retrabalho e dificuldades registrados. As quatro fases entregues não equivalem à entrega do ciclo de avaliação pós-serviço e IQF.

## Método e limites

- Duas avaliações independentes, nos papéis de PO e PM, consolidadas com leitura de código e documentos e execução local dos testes.
- `tests/ciclo-completo.cjs`: 37 de 37 verificações aprovadas.
- `tests/validar-correcoes.cjs`: 34 cenários de regressão aprovados. Ambos os processos terminaram com código 0.
- Achados de integridade abaixo resultam de inspeção do código; não foram reproduzidos na implantação real. Os testes existentes não demonstram cobertura desses caminhos completos.
- Não foram inspecionados o navegador em uso, a base remota ou a versão publicada. Números operacionais e pendências de acervo são os declarados nos documentos locais, não uma auditoria atual do Google Sheets.
- Esta entrega registra uma avaliação; não modifica a aplicação nem publica código.

## Visão de PO: entrega e experiência

O fluxo principal implementado inclui criação e edição, múltiplos proponentes, cadastro interno e consulta de CNPJ, comparação, homologação, exportação e consulta histórica. Colagem do Excel, navegação por teclado e rascunhos atendem diretamente ao trabalho do comprador. Catálogo por categoria e ficha do fornecedor tornam o acervo mais acessível.

O fluxo de publicação com testes antes de `clasp push` é uma melhoria de manutenção (`package.json`). A aprovação da suíte é evidência útil, mas não substitui o teste do ciclo real criar → homologar → editar → exportar.

### Backlog prioritário

P0: condição para operar decisões reais pelo fluxo afetado. P1: executar durante a preparação e o piloto. P2: evolução após evidência de uso.

| Prioridade | Achado / impacto | Critério de aceite proposto |
| --- | --- | --- |
| P0 | **Editar uma homologação deixa referência órfã.** Novos IDs de propostas são gerados em `app/Equalizacao.gs:308`; os registros anteriores são apagados em `:385-388`, mas status e referência à vencedora são preservados em `:404` e `:410`. A decisão pode continuar homologada sem apontar para uma proposta existente. | Definir regra de revisão; recomendação: preservar o retrato anterior e reabrir para nova homologação ao alterar condições comerciais. Criar → homologar → editar → consultar/exportar deve manter referências válidas e apresentar o estado correto. |
| P0 | **Edição pode perder dados em falha parcial.** O caminho apaga os registros antes de inserir a substituição (`app/Equalizacao.gs:385`). A trava em `app/Util.gs:18` evita concorrência, mas não restaura dados após erro. | Simular falhas nas etapas de gravação e comprovar recuperação da versão anterior ou manutenção de uma versão íntegra recuperável; nenhum sucesso deve ser informado com gravação incompleta. |
| P0 | **Valor homologado e valor exportado podem divergir.** Homologação prioriza total declarado (`app/Equalizacao.gs:582`, `:606`); resumo exportado prioriza soma calculada (`app/Exportar.gs:670`, `:740`). | Usar uma política explícita de valor vigente na decisão, tela e exportação, preservando a divergência para conferência. Caso A: soma 1.000/declarado 900; B: soma 950/declarado 950. Decisão e resumo devem concordar sobre valor e base comparada. |
| P0 | **Acervo com divergências de valores/períodos.** O balanço registra três casos, incluindo diferença de 12 vezes (`docs/BALANCO_EXECUCAO.md:102`). | Conferir a fonte e registrar período, unidade, total original e cálculo derivado; resolver os casos utilizados no piloto ou excluí-los explicitamente da recomendação até conciliação. Não aplicar uma correção automática de fator 12 sem conferir a origem. |
| P1 | **Elegibilidade para homologação insuficientemente validada.** `cfHomologar_` valida vínculo da proposta e justificativa para escolha mais cara, mas não exige valor válido da escolhida nem comparabilidade de cobertura (`app/Equalizacao.gs:565`). | Recusar proposta sem valor utilizável; sinalizar escopo incompleto e exigir tratamento explícito antes da decisão. Definir com a operação a política de proposta única, sem inventar um mínimo obrigatório de concorrentes. |
| P1 | **Narrativa diverge da entrega.** O plano usa “Meta Atingida no Piloto” e “-70%” sem baseline; a minuta descreve avaliações ainda não implementadas. | Toda afirmação deve indicar se é entregue, meta ou medição, com fonte/data/amostra quando aplicável; retirar alegações de ganho atingido sem evidência. |
| P1 | **Aceitação operacional ainda sem evidência.** Não há piloto real declarado. | Comprador executar criação, edição, consulta e exportação; gestor conferir decisão e documento; registrar tempo, erros, ajuda necessária e parecer de aceite. Incluir edição após homologação e fornecedor sem retorno na avaliação. |
| P2 | **Expansão de funcionalidades.** Categorias, indicadores adicionais e automações podem crescer antes de se conhecer a demanda real. | Priorizar evoluções a partir de obstáculos observados no piloto, com hipótese de benefício e responsável por validar. |

## Visão de PM: valor, escopo e resultado

**Público principal:** compradores e Facilities dos Megas. **Público secundário:** gestores e Diretoria que analisam comparativos e decisões.

**Posicionamento recomendado:** “Equalização de compras com memória de preços e fornecedores para Facilities dos Megas.” O diferencial está em reutilizar o que foi aprendido em outras cotações e empreendimentos.

Existe uma decisão de escopo relevante: `README.md:32` declara pós-OC/IQF sem código, enquanto `docs/RESPOSTA_AO_COMITE.md:54-82` descreve avaliação no fechamento, avaliação pós-serviço e indicadores. A existência da minuta não comprova que esse escopo foi aprovado ou enviado. Confirmar o compromisso assumido antes de 30/09, conforme cronograma local. Se avaliação for indispensável, dimensionar um ciclo mínimo ligado a fornecedor e OC, com responsável, avaliação e consulta na próxima compra; integração com Fluig pode permanecer posterior. Não assumir que essa entrega adicional cabe sem replanejamento.

`docs/PLANO_ESTRATEGICO_PROJETO.md:133-135` apresenta redução de 70% como meta atingida, incompatível com a ausência de medições em `docs/BALANCO_EXECUCAO.md:44`, `:56` e `:93`. Esse percentual deve ser tratado como hipótese/meta até haver resultado observado.

A “Economia na disputa” da exportação é a diferença para a proposta mais cara (`app/Exportar.gs:746`). Essa amplitude não comprova economia causada pelo sistema. Medir negociação exige mesma base de escopo, quantidade, período e condições; ganho contratado e diferença entre propostas devem ser apresentados separadamente.

### Piloto e métricas

Começar em um Mega, com comprador e gestor responsáveis. Ampliar após validar o primeiro ciclo. A meta operacional de 8–12 equalizações reais já aparece no balanço; depende da demanda e não deve ser preenchida com testes para atingir quantidade.

| Métrica | Como medir |
| --- | --- |
| Tempo de preenchimento | Mediana de casos comparáveis no Excel e no app; registrar itens, proponentes, criação/edição e interrupções. Começar com três casos de baseline e ampliar quando possível. |
| Adoção | Equalizações elegíveis concluídas no app / total de equalizações elegíveis no período. |
| Autonomia e retrabalho | Casos concluídos sem ajuda; casos corrigidos após conferência/exportação; motivo de cada correção. |
| Utilidade do histórico | Casos em que a consulta encontrou fornecedor, apoiou questionamento de preço ou orientou negociação, com exemplo e fonte. |
| Resultado financeiro | Proposta inicial e valor aprovado/contratado comparáveis; evidenciar a fonte e separar redução negociada de amplitude entre propostas. |
| Avaliação pós-serviço, se incluída | Avaliações concluídas / serviços encerrados elegíveis; verificar se o resultado aparece na próxima cotação. |

O cronômetro atual mede preenchimento até gravação, não necessariamente o ciclo inteiro até aprovação. A comparação deve usar o mesmo início e fim nos dois métodos. Publicar tamanho da amostra e limitações; poucas observações não sustentam uma redução universal.

### Sequência recomendada

Datas de referência conforme o cronograma registrado no repositório; não houve nova validação externa do regulamento.

| Janela | Resultado esperado |
| --- | --- |
| 07–11/09 | Iniciar baseline, definir responsáveis e critérios; corrigir integridade da decisão e conciliar dados do piloto. |
| 14–25/09 | Executar cotações reais após atender os bloqueios; observar uso e corrigir obstáculos à conclusão. |
| Até 30/09 | Confirmar escopo de avaliação/IQF com o comitê e consolidar primeiras evidências. |
| 01–09/10 | Concluir piloto e correções materiais; fechar números e demonstração reproduzível. |
| 10–15/10 | Finalizar relatório com resultados observados, limites, evidências e evolução proposta. |

Responsabilidades sugeridas: Guilherme/operação para baseline e casos reais; desenvolvimento para integridade e suporte; gestor para aceite; responsável pelo projeto e comitê para alinhamento de escopo. São atribuições propostas, ainda não compromissos assumidos pelos envolvidos.

**Decisão recomendada:** concentrar o próximo ciclo em integridade da decisão, uso acompanhado e evidência de resultado. A aplicação já oferece funções suficientes para testar o valor central, assim que os bloqueios dos fluxos afetados forem tratados.
