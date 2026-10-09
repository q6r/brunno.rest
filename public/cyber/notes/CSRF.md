# CSRF / リクエスト偽造

> 操作の意図を確認する
> Confirmar a intenção de uma ação.

## 概要 / A falha

Cross-Site Request Forgery induz o navegador de uma pessoa autenticada
a enviar uma ação indesejada para uma aplicação em que ela possui sessão.
Cookies enviados automaticamente podem acompanhar a requisição.
Ter uma sessão válida não prova que a pessoa quis realizar aquela ação.

## Exemplo de laboratório / 検証

Um formulário de alteração de e-mail aceita uma requisição com o cookie
da sessão, mas sem verificar a origem ou um token de proteção.
Em contas de teste, confirmar que uma requisição sem o token esperado
é recusada antes de modificar qualquer dado.

## 対策 / Correção

- Usar a proteção CSRF oferecida pelo framework.
- Validar tokens de proteção nas operações que alteram estado.
- Configurar SameSite conforme os fluxos da aplicação.
- Verificar Origin e, quando adequado, Referer.
- Não usar GET para operações que modificam dados.

## 境界 / Fronteira

SameSite é uma camada de proteção, não uma solução universal.
Uma falha XSS pode comprometer mecanismos de proteção contra CSRF.

[OWASP — CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)

## ASCII / 出典

[Fonte da arte](https://emojicombos.com/serial-experiments-lain-ascii-art)
