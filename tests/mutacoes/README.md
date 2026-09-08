# Os testes de mutação

Estes scripts não entram no `npm test`. Eles existem para responder a
única pergunta que uma suíte verde **não** responde:

> o teste falharia se o código estivesse quebrado?

Cada script quebra o código de produção de propósito, roda o teste que
deveria protegê-lo, restaura o arquivo e diz `PEGOU` ou `PASSOU`. Um
`PASSOU` é um teste que não protege nada.

## Por que isso virou disciplina aqui

Porque a suíte já ficou verde com recurso desligado, mais de uma vez:

- o **selo de IQF** morreu no cabeçalho da grade e ficou morto por cinco
  commits. O teste que o protegia procurava a string no código-fonte — e
  a string existia. Só o código estava inalcançável, depois de um `;`;
- o **caminho do dado do saving** estava rompido: o parser extraía a
  proposta inicial e o gravador a descartava. Cada elo passava isolado;
- o teste da via em Slides procurava `"não cotou"` no documento inteiro
  e casava com a **legenda**, passando com a grade em branco.

Nos três casos a mutação foi o que revelou. Nos três casos o defeito
estava no teste, não no código de produção.

## Como rodar

```
node tests/mutacoes/mutar-slides.cjs
```

Saída esperada: todas as linhas `PEGOU`, e no fim
`PASSA · com o codigo integro` — que confirma que o arquivo foi
restaurado.

**Se aparecer `PASSOU`**, houve uma de duas coisas:

1. o teste é teatro e precisa ser reescrito sobre comportamento; ou
2. a mutação não era um defeito de verdade.

O segundo caso já aconteceu: remover a guarda do valor inicial fazia a
aritmética virar `NaN`, e `NaN > 0` é falso, então o retorno continuava
`null`. A correção foi trocar a mutação — **nunca enfraquecer o código
para o teste passar**.

## Aviso

Estes scripts carregam o caminho absoluto do projeto na constante
`raiz`, e escrevem no `app/`. Em outra máquina, ajuste a constante antes
de rodar. Eles restauram o arquivo original mesmo quando o teste falha,
mas se um for interrompido no meio (Ctrl+C), confira com `git status`
antes de continuar.
