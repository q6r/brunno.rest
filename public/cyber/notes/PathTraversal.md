# Path Traversal / パストラバーサル

> ファイルの境界を守る
> Preservar a fronteira de acesso aos arquivos.

## 概要 / A falha

Path Traversal acontece quando uma entrada influencia um caminho de arquivo
e permite sair do diretório previsto. Uma função de download pode acabar
lendo arquivos que não deveriam estar disponíveis para aquele usuário.

## 原因 / Causa

Concatenar o nome enviado pelo cliente ao caminho de uma pasta não garante
que o resultado permaneça dentro dela. Caminhos relativos, absolutos e
links simbólicos precisam ser considerados conforme o ambiente.

## 対策 / Correção

- Preferir identificadores que apontem para arquivos cadastrados no servidor.
- Resolver o caminho final e verificar se está dentro da pasta permitida.
- Evitar verificações de prefixo que confundem pastas com nomes parecidos.
- Aplicar autorização ao arquivo, além da validação do caminho.
- Limitar os privilégios de leitura e escrita do processo.

## 検証 / Verificação

Em um laboratório, manter uma pasta permitida e um arquivo de teste fora
dela. Confirmar que nomes inválidos e caminhos fora da pasta são recusados,
sem retornar o conteúdo do arquivo externo.

[OWASP — Path Traversal](https://owasp.org/www-community/attacks/Path_Traversal)

## ASCII / 出典

Arte original de tkoz0 / anime-ascii-art.
[Fonte da arte](https://raw.githubusercontent.com/tkoz0/anime-ascii-art/refs/heads/main/Assault_Lily_Bouquet/Riri1.txt)
