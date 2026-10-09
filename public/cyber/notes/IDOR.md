# IDOR / アクセス制御

> 認証 ≠ 認可
> Autenticação não é autorização.

## 概要 / A falha

Insecure Direct Object Reference ocorre quando um identificador seleciona
um objeto sem que o servidor verifique se aquela pessoa pode acessá-lo.
Estar autenticado não dá acesso a todos os documentos de uma aplicação.

## Exemplo de laboratório / 検証

```http
GET /api/documents/17
```

A conta A possui o documento 17; a conta B possui o documento 18.
Se a conta A recebe o documento 18 ao mudar o identificador, existe uma
falha de autorização. O mesmo cuidado vale para editar, excluir e exportar.

## 対策 / Correção

```text
document = findDocument(id, authenticatedUser.id)
if document is missing: deny access
```

- Restringir a consulta aos objetos permitidos para o usuário atual.
- Obter a identidade pela sessão confiável, não pelo corpo da requisição.
- Verificar a permissão em cada operação.
- UUIDs dificultam adivinhação, mas não substituem autorização.

## Teste de regressão

Criar duas contas de teste e confirmar que leitura e escrita cruzadas
são negadas, inclusive com identificadores válidos.

[OWASP — IDOR](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html)
