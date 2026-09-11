/** Conteúdo atual da apresentação: produtividade desde a definição do escopo. */
const CN_ROTEIRO = [
  {
    tipo: 'capa', titulo: 'Gestão de Contratações',
    chamada: 'Produtividade no processo de contratação',
    tese: 'Definir melhor o escopo para reduzir revisões e facilitar a contratação.',
    rodape: 'Concurso da Melhor Ideia 2026 · Capital Realty & Demercado',
    fala: 'O problema que queremos resolver é a produtividade no processo de contratação. Parte do tempo gasto na equalização é usada para descobrir o que cada fornecedor considerou. A proposta é organizar esse trabalho desde o escopo: definir o que precisamos, pedir a mesma estrutura de resposta e levar esses itens para a comparação. Gestão de Contratações é o novo nome porque o projeto acompanha esse ciclo completo.'
  },
  {
    titulo: 'O retrabalho começa antes da equalização', selo: 'A DOR DO PROCESSO',
    chamada: 'Quando o escopo é ambíguo, cada fornecedor responde a uma pergunta diferente.',
    cards: [
      ['Propostas diferentes', 'Um fornecedor detalha os serviços. Outro apresenta um preço global. Um terceiro deixa itens de fora.'],
      ['Comparação difícil', 'Uma proposta de R$ 20 mil pode parecer atrativa, mas o valor sozinho não revela o que está incluído.'],
      ['Mais idas e vindas', 'A equipe precisa esclarecer inclusões, pedir revisões e reorganizar os dados antes de comparar os preços.']
    ],
    rodape: 'Exemplo ilustrativo: preço comparável exige escopo, quantidade e condições equivalentes.',
    fala: 'Imagine uma proposta de vinte mil reais sem detalhamento. Ela inclui materiais? Instalação? Testes? Limpeza? Outro fornecedor pode ter considerado tudo isso. Comparar apenas o total mistura propostas diferentes. Antes de negociar, a equipe precisa abrir as composições e pedir revisões. É nesse trabalho de esclarecimento e conferência que o processo perde tempo. O valor é um exemplo, não uma compra ou economia apurada.'
  },
  {
    titulo: 'Uma mesma base para os três Megas', selo: 'FACILITIES E PROPRIEDADES',
    chamada: 'As características locais mudam. As informações necessárias para cotar precisam seguir um padrão.',
    cards: [
      ['Realidades diferentes', 'Curitiba, Esteio e Itajaí têm necessidades próprias. Hoje, os escopos variam na quantidade de texto, fotos e detalhamento.'],
      ['Método comum', 'Uma estrutura compartilhada orienta a preparação do escopo, preservando as necessidades de cada empreendimento.'],
      ['Apoio às equipes', 'Facilities e Propriedades ganham uma sequência de preparação e conferência para estruturar a contratação.']
    ],
    rodape: 'Padrão comum de informação, com espaço para a necessidade específica de cada empreendimento.',
    fala: 'Nos três Megas, algumas pessoas usam mais fotos e menos texto; outras fazem o contrário. O objetivo não é impor a mesma quantidade de fotos ou apagar as diferenças locais. É garantir que todos respondam às mesmas perguntas: onde, o quê, quanto, com qual referência e em quais condições. Facilities e Propriedades passam a contar com uma estrutura comum para preparar e conferir as solicitações.'
  },
  {
    titulo: 'O escopo nasce com uma estrutura comum', selo: 'FUNCIONA HOJE',
    chamada: 'Preparar melhor a solicitação de cotação torna explícito o que o fornecedor deve considerar.',
    cards: [
      ['Contexto e evidência', 'Local, objetivo, vistoria e fotos junto aos grupos de serviços. O fornecedor entende o problema e onde vai atuar.'],
      ['Itens bem definidos', 'EAP com grupos, descrição, quantidade, unidade e marca de referência. A numeração é automática.'],
      ['Condições claras', 'Prazos, visita técnica, materiais, documentação, responsabilidades e demais requisitos registrados no escopo.']
    ],
    rodape: 'A ferramenta organiza o preenchimento; a qualidade técnica depende da revisão do responsável.',
    fala: 'A melhora começa antes de recebermos qualquer preço. Montamos o escopo por local e serviço, anexamos as fotos ao grupo e estruturamos os itens na EAP. As condições completam a solicitação ou edital de cotação. A ferramenta ajuda a lembrar e organizar os campos, mas não substitui a revisão técnica. Um formulário preenchido não garante, sozinho, que o escopo esteja correto.'
  },
  {
    tipo: 'fluxo', titulo: 'O ciclo começa no escopo', selo: 'FLUXO ATUAL',
    chamada: 'A estrutura preparada no início acompanha a cotação e a decisão.',
    cards: [
      ['1. Escopo', 'Definir serviços, fotos, itens e condições.'],
      ['2. Cotação', 'Baixar o Excel e enviar aos fornecedores.'],
      ['3. Resposta', 'Receber o Excel preenchido na estrutura solicitada.'],
      ['4. Equalização', 'Carregar o escopo e informar os preços de cada proponente.'],
      ['5. Decisão', 'Analisar propostas, negociar e registrar a homologação.'],
      ['6. Memória', 'Avaliar a entrega e consultar o histórico na próxima compra.']
    ],
    rodape: 'Envio e retorno do Excel são externos ao sistema. Os preços são inseridos ou colados pela equipe.',
    fala: 'O ciclo não começa na equalização. Começa no escopo. Da EAP sai uma planilha Excel com os itens preenchidos e os campos de preço em branco. Enviamos esse arquivo aos fornecedores, que o devolvem preenchido. Na nova cotação, escolhemos a mesma revisão do escopo e carregamos os itens. A equipe informa ou cola os preços. Depois vêm a análise, a negociação e a decisão. Após a entrega, a avaliação alimenta as próximas contratações. O envio e a leitura automática das respostas ainda não fazem parte desse fluxo.'
  },
  {
    titulo: 'A equalização aproveita o trabalho já feito', selo: 'FUNCIONA HOJE',
    chamada: 'Os itens solicitados ao fornecedor são a base que o comprador carrega para comparar.',
    cards: [
      ['Antes da resposta', 'Todos recebem os mesmos itens, quantidades, unidades e referências, com os preços a preencher.'],
      ['Na montagem', 'O comprador escolhe o escopo e a revisão enviada. A EAP entra pronta, com os campos de preço vazios.'],
      ['Na conferência', 'A equipe verifica omissões, marcas e condições antes de comparar os valores e solicitar a aprovação.']
    ],
    rodape: 'Menos redigitação e uma base comum de comparação. A resposta do fornecedor ainda precisa ser conferida.',
    fala: 'A equalização nasce estruturada junto com o escopo. Assim, não precisamos reconstruir a lista inteira depois de receber propostas em formatos diferentes. A mesma revisão enviada ao fornecedor alimenta a EAP da compra. Ainda é necessário conferir a resposta: um fornecedor pode omitir um item ou propor outra marca. A vantagem é termos uma referência clara para identificar e resolver essas diferenças.'
  },
  {
    titulo: 'Um apoio adicional para quem avalia', selo: 'EQUALIZAÇÃO MAIS INTELIGENTE',
    chamada: 'A padronização organiza a entrada. Os recursos de análise ajudam na decisão.',
    cards: [
      ['EAP e marcas', 'Numeração automática, quantidades visíveis e marca de referência junto aos itens.'],
      ['Preços anteriores', 'Consulta e alertas históricos ajudam a identificar variações que merecem explicação.'],
      ['Qualidade da entrega', 'O IQF traz avaliações do fornecedor para a próxima compra e sinaliza quando a amostra é preliminar.'],
      ['Registro da decisão', 'Comparativo exportável, parecer, homologação e registro dos valores negociados.']
    ],
    rodape: 'A negociação ocorre entre as pessoas. O sistema registra e organiza o resultado para análise.',
    fala: 'Esses recursos são um ganho adicional à melhora do processo. A numeração automática evita manutenção manual da EAP. O histórico ajuda o comprador a questionar um preço. O IQF acrescenta informação sobre a entrega, com indicação de amostra preliminar. O avaliador recebe um comparativo mais organizado, com condições e justificativa. O sistema não negocia pelo comprador e o menor preço não substitui a avaliação do escopo.'
  },
  {
    titulo: 'Um repositório para a próxima contratação', selo: 'MEMÓRIA COMPARTILHADA',
    chamada: 'Escopos, equalizações e preços deixam de depender de arquivos isolados.',
    cards: [
      ['Escopos e revisões', 'Consultar o que foi definido e recuperar a versão usada em cada solicitação.'],
      ['Equalizações e preços', 'Reaproveitar o histórico de comparação e pesquisar referências por item e empreendimento.'],
      ['Base de fornecedores', 'Identificação por CNPJ, consulta cadastral, contatos e histórico de participação e avaliação.']
    ],
    rodape: 'Consulta pública de CNPJ via BrasilAPI, com prioridade ao cadastro interno e preenchimento manual se necessário.',
    fala: 'O repositório guarda a memória do trabalho. O próximo responsável pode consultar um escopo anterior, uma equalização e os preços registrados. A base de fornecedores usa o CNPJ como referência e consulta dados cadastrais públicos. A consulta externa é feita pela BrasilAPI, que republica dados públicos; não é uma integração direta com a Receita Federal. O cadastro interno vem primeiro e uma indisponibilidade não impede continuar manualmente.'
  },
  {
    titulo: 'Entregas atuais e próximas evoluções', selo: 'ESCOPO DA SOLUÇÃO',
    chamada: 'O fluxo já conecta a preparação do escopo à montagem da equalização.',
    cards: [
      ['Já disponível', 'Escopos com fotos e revisões.\nEAP e Excel para cotação.\nCarga do escopo na equalização.\nHistórico de preços, cadastro e IQF.\nExportação e registro da decisão.'],
      ['Evoluções futuras', 'Convite com envio pelo sistema.\nPortal de resposta do fornecedor.\nImportação automática das respostas.\nIntegrações com sistemas corporativos.\nModelos refinados com o uso das equipes.']
    ],
    rodape: 'Evoluções dependem de priorização e validação. Funcionalidade entregue não equivale a ganho já medido.',
    fala: 'Hoje já temos o escopo com fotos, a EAP, a planilha em branco para o fornecedor e a carga desses itens na equalização. Também temos o histórico de preços, o cadastro por CNPJ, a avaliação e os documentos de apoio à decisão. O envio de convites, o portal e a importação automática das respostas são próximos passos. Precisamos consolidar o uso e medir o resultado antes de ampliar o processo.'
  },
  {
    titulo: 'Medir o processo completo', selo: 'COMO VALIDAR O GANHO',
    chamada: 'Investir mais atenção no escopo faz sentido se reduzir o esforço total da contratação.',
    cards: [
      ['Tempo por etapa', 'Preparação do escopo, montagem da equalização e duração até a decisão.'],
      ['Retrabalho', 'Dúvidas dos fornecedores, itens omitidos e rodadas de correção ou revisão.'],
      ['Uso pelas equipes', 'Contratações realizadas, reaproveitamento de escopos e dificuldades de Facilities e Propriedades.']
    ],
    rodape: 'Comparar casos equivalentes antes e depois. O ganho de tempo ainda precisa ser demonstrado.',
    fala: 'O indicador não pode olhar apenas os minutos gastos para montar a tabela. Se dedicarmos mais tempo a elaborar um escopo e reduzirmos revisões, esclarecimentos e correções, o ganho pode estar no processo completo. Precisamos acompanhar o tempo por etapa, o número de devoluções e a duração até a decisão. A comparação deve considerar compras semelhantes e separar tempo ativo de trabalho de tempo de espera. Não vou afirmar um percentual de redução sem essa comparação.'
  },
  {
    titulo: 'Começar melhor para contratar melhor', selo: 'GESTÃO DE CONTRATAÇÕES',
    chamada: 'Um escopo claro dá uma base comum ao fornecedor, ao comprador e ao avaliador.',
    cards: [
      ['Quem prepara', 'Define a necessidade e revisa os requisitos antes de pedir preço.'],
      ['Quem compra', 'Recebe respostas na estrutura solicitada, confere diferenças e conduz a negociação.'],
      ['Quem decide', 'Analisa propostas com mais contexto e registra uma decisão fundamentada.']
    ],
    rodape: 'Próximo passo: aplicar o padrão em contratações reais dos três Megas e acompanhar o retrabalho.',
    fala: 'A proposta é melhorar as atividades das pessoas em cada momento da contratação. Quem prepara dá clareza ao pedido. Quem compra concentra energia na conferência e na negociação. Quem decide recebe um comparativo mais compreensível. A hipótese é simples: um escopo bem elaborado reduz o ruído que se espalharia pelas etapas seguintes. O próximo passo é usar esse padrão nas contratações reais e medir o resultado com as equipes.'
  }
];

/** O roteiro completo fica nas notas; o desenho usa ilustrações editáveis. */
function _cnRenderNarrativa_(deck, pagina, indice) {
  return _cnRenderVisual_(deck, pagina, indice);
}
