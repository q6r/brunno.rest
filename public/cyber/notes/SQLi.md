# SQL Injection / データと命令

> 入力は命令ではない
> Entrada não deve virar comando.

## 概要 / A falha

SQL Injection pode surgir quando entradas externas são concatenadas em
uma consulta e acabam alterando sua estrutura. O risco inclui leitura
indevida e alteração de dados, conforme os privilégios da conexão.

## 原因 / Causa

Construir SQL juntando trechos de texto com valores enviados pelo cliente
mistura instruções e dados. Validar um campo não substitui a parametrização.

## 対策 / Correção

```js
await database.query(
  "SELECT id, name FROM users WHERE id = $1",
  [requestedId]
);
```

Esse exemplo usa a sintaxe de parâmetros do PostgreSQL.
A estrutura da consulta fica separada dos valores.

- Usar consultas parametrizadas para valores.
- Para nomes de coluna ou ordenação, usar uma seleção fixa permitida.
- Limitar os privilégios da conta usada pela aplicação.
- Não retornar detalhes internos do banco em respostas públicas.

## 検証 / Verificação

No ambiente de teste, verificar que caracteres especiais continuam sendo
tratados como dados e que erros não expõem consultas nem credenciais.

[OWASP — SQLi](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
