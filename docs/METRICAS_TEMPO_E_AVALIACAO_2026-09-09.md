# Tempo de desenvolvimento e estimativa de avaliação

Apuração em 09/09/2026, com histórico Git até `14377b3`. Parecer do assistente, não avaliação oficial do Comitê.

## Tempo que pode ser sustentado pelo registro

| Métrica | Resultado |
|---|---:|
| Primeiro commit | 04/09/2026, 19:53:27, Brasília |
| Último commit no corte | 09/09/2026, 19:45:52, Brasília |
| Janela entre esses commits | 119 h 52 min, aproximadamente 5 dias |
| Dias do calendário com registros | 6 |
| Commits totais | 162 |
| Commits sem merges usados no cálculo | 155 |
| Sessões inferidas com limite de 90 minutos | 14 |
| Soma dos intervalos dentro dessas sessões | 31 h 02 min |
| Acréscimo hipotético de 20 minutos por início de sessão | 4 h 40 min |
| Estimativa central de atividade | **35 h 42 min, aproximadamente 36 h** |

O cálculo ordena os timestamps de autoria dos commits sem merges. Uma lacuna superior a 90 minutos inicia uma nova sessão. A soma dos intervalos menores é acrescida de 20 minutos por sessão, para representar trabalho anterior ao primeiro commit de cada bloco. Esse acréscimo é uma hipótese explícita, retomada do método descrito em `BALANCO_EXECUCAO.md`; não é tempo cronometrado.

Sensibilidade ao limite de pausa, mantendo o acréscimo de 20 minutos:

| Limite | Estimativa |
|---|---:|
| 30 minutos | 29,4 h |
| 60 minutos | 33,0 h |
| 90 minutos | 35,7 h |
| 120 minutos | 38,5 h |

**Leitura prática:** aproximadamente 30–40 horas de atividade inferida no histórico de desenvolvimento, dentro de cinco dias corridos. Essa faixa é sensibilidade do método, não intervalo estatístico de confiança e não apontamento das horas humanas totais.

Não é possível separar horas do autor, processamento de IA, colaboração paralela ou pausas dentro das sessões. O método pode omitir blocos longos de trabalho sem commits e incluir pausas curtas. Não abrange concepção, inscrição, reuniões e levantamento anteriores a 04/09, nem trabalho posterior ao último commit. O tempo total real do projeto, desde a ideia, continua não apurado.

Reprodução: `node tools/metricas-tempo-projeto.cjs`. O script somente lê o Git e apresenta o corte e as hipóteses. Valores mudam com novos commits.

## Nota que eu estimaria hoje

Os pesos foram conferidos nos itens 6 e 12 do PDF local `Regulamento Concurso de Melhor Ideia 2026.pdf`, versão 01, atualizado em 12/12/2025. Não foi verificada a existência de revisão posterior junto ao RH.

| Critério | Peso | Minha nota | Justificativa |
|---|---:|---:|---|
| Viabilidade e sustentabilidade | 20% | 8,5 | Utiliza o ambiente corporativo existente e possui operação demonstrável. Ainda precisa consolidar manutenção, responsáveis e continuidade sem depender do autor. Não equivale a custo total zero. |
| Inovação | 20% | 8,0 | A ligação entre histórico de compras, comparação, avaliação e preparação de escopo é relevante para o processo interno. Não há evidência de originalidade no setor que sustente nota máxima. |
| Qualidade da implementação | 30% | 8,5 | Fluxos funcionais, proteção dos dados, testes e documentação. As novas telas de escopo foram testadas localmente com serviços simulados; não há validação real dessa entrega registrada nesta análise. |
| Impacto para a empresa | 30% | 7,5 | Há potencial e sinais iniciais de adoção por outras pessoas. Falta comparação equivalente com Excel, economia atribuível ao sistema e acompanhamento do uso por mais tempo. |
| **Resultado ponderado** | **100%** | **8,10** | `8,5×0,20 + 8,0×0,20 + 8,5×0,30 + 7,5×0,30` |

Minha expectativa seria uma avaliação na região de **8/10**, com faixa opinativa de **7,5–8,5**, conforme o rigor da banca e a demonstração apresentada. Não é previsão calibrada, nota oficial ou estimativa de classificação. Não foram avaliados os concorrentes.

## Evidência que pesa a favor e seus limites

O roteiro de 09/09 registra 26 equalizações, 7 homologações, 3 avaliações, 4 usuários e 13 medições de tempo. Registra também três equalizações realizadas por duas pessoas além do autor, com tempos de 9min10s, 11min32s e 13min35s, e uma jornada completa realizada por uma analista. A mediana desses três tempos é 11min32s.

Esses dados foram lidos em `ROTEIRO_CONSELHO_2026-09-09.md`, não consultados novamente na base em produção nesta análise. Não demonstram, sozinhos, que todas as equalizações eram compras reais, que o tempo caiu em relação ao Excel ou que houve redução de custo.

O arquivo aberto na IDE, `tests/e2e-jornada-comprador.cjs`, está em outra cópia do projeto. O conteúdo inspecionado usa Node VM, base em memória e mocks. É evidência de teste por simulação, não comprovação adicional de uma jornada real em produção.

A auditoria de 08/09 atribuiu 8,95 ao próprio projeto. O roteiro posterior já alerta que essa nota não veio da banca. Eu não adotaria aquela nota como previsão: volume histórico importado não é economia gerada, e quantidade de testes não prova sozinha a efetividade operacional.

## Como fortalecer a avaliação

1. Comparar tarefas equivalentes no Excel e no sistema, com os mesmos itens, proponentes e informação disponível, registrando várias execuções e os operadores envolvidos.
2. Apurar negociações reais com propostas inicial/final, quantidade, escopo e condições comparáveis. Separar economia de negociação da simples diferença entre fornecedores.
3. Registrar uso recorrente por outras pessoas, dificuldades, retrabalho e avaliações após a entrega do serviço.
4. Publicar e validar a geração de escopos em Slides/PDF no ambiente real, com fotos e tabelas longas.
5. Definir responsável pela manutenção, recuperação da base e orientação de novos usuários.

Com essas evidências, uma nota próxima de 9 fica mais defensável; não é garantida. Nesta fase, medir o resultado operacional tem mais valor para a defesa do que acrescentar novas funções.
