# SSRF / 信頼の境界

> 接続先を信頼しない
> Não confiar automaticamente no destino de uma conexão.

## 概要 / A falha

Server-Side Request Forgery acontece quando uma entrada faz o servidor
enviar requisições a destinos que não deveriam estar disponíveis naquele fluxo.
Uma função de prévia de URLs ou importação de imagens pode criar esse caminho.

## Fronteira / 境界

```text
URL do usuário → servidor da aplicação → destino solicitado
```

O servidor pode alcançar serviços que o navegador não alcança.
Por isso, aceitar uma URL não é só uma decisão de apresentação.

## 対策 / Correção

- Quando possível, permitir apenas destinos previamente definidos.
- Restringir protocolos e validar o endereço resolvido.
- Bloquear destinos internos conforme a política de rede da aplicação.
- Desabilitar redirecionamentos ou validar cada novo destino.
- Aplicar restrições de saída também na camada de rede.
- Definir limites de tempo e tamanho para as respostas.

## 検証 / Verificação

Usar serviços controlados no laboratório para testar destinos permitidos,
bloqueados e redirecionamentos. A validação precisa corresponder ao destino
que realmente recebe a conexão.

[OWASP — SSRF](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
