# XSS / スクリプト注入

> データはコードではない
> Dados não são código.

## 概要 / A falha

Cross-Site Scripting acontece quando conteúdo não confiável é interpretado
como conteúdo ativo no navegador. Pode comprometer a interação do usuário
com a página e permitir ações dentro do contexto da aplicação.

## Formas comuns

- Stored: conteúdo persistido reaparece para outras pessoas.
- Reflected: uma entrada da requisição volta na resposta.
- DOM-based: o processamento no cliente introduz o conteúdo em um ponto inseguro.

## Exemplo / 境界

Um comentário deve aparecer como texto. Se ele for inserido diretamente
como HTML, a fronteira entre dados do usuário e marcação da página desaparece.

```js
// Para exibir texto simples:
commentElement.textContent = comment;
```

## 対策 / Correção

- Usar escape de saída apropriado ao contexto.
- Para HTML permitido, usar sanitização dedicada.
- Evitar APIs que interpretam strings como HTML sem necessidade.
- Validar URLs conforme os protocolos permitidos pela aplicação.
- Usar CSP como camada complementar, não como correção única.

## 検証 / Verificação

Confirmar que entradas de teste são exibidas como dados, inclusive depois
de salvar, recarregar e abrir a página com outra conta de laboratório.

[OWASP — XSS](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
