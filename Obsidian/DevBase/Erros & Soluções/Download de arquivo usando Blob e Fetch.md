### O que estava acontecendo?

O problema muito comum com esse tipo de fluxo em React (onde exibimos uma imagem em uma tag `<img>` e depois tentamos baixá-la via `fetch` a partir da mesma URL) tem relação com o **cache do navegador e CORS**:

1. Cedo na tela, a sua tag `<img src={fileUrl} />` carrega a imagem. Como você não passa propriedades de CORS pro `<img>`, o navegador baixa e faz cache da imagem como "opaca" (sem dar permissões de leitura programática).
2. Quando você clica em "Baixar" e o React tenta rodar o `fetch(fileUrl)`, o navegador verifica o cache e reaproveita a imagem que baixou antes. Porém, como a versão salva em cache não tem headers explícitos de permissão, o navegador bloqueia a leitura do seu Blob com um Erro de CORS.

### Como foi resolvido?

Eu implementei algumas melhorias para garantir que o fetch force o download corretamente:

1. **Cache Buster (Bypassing)**: Adicionei um parâmetro de ID único no final da sua URL (`?_cb=[timestamp]`). Assim, o navegador acha que se trata de uma requisição diferente da requisição feita pela tag `<img>` e bate de novo no servidor exigindo uma resposta _fresca_ e sem conflito de cache.
2. **`cache: 'no-cache'`**: Para garantir, também foi passado nas opções do `fetch()`, instruindo o motor JavaScript a baixar de fato o arquivo ignorando os caches salvos de antemão.
3. **Propriedade `download`**: O atributo que era acionado via `setAttribute` foi substituído diretamente pela notação em Prop (`link.download = fileName`), que se comporta um pouco melhor em quase todos os cenários.
4. **`document.body.removeChild(link)`**: Refinada a limpeza da DOM após o clique para que não houvesse resíduos de variáveis da tag `<a>`.

O arquivo correspondente já foi salvo. Tente baixar o anexo agora; o hook deve conseguir fazer o `fetch` e gerar o arquivo baixável de forma local através do `Blob` perfeitamente! Me avise se o problema persistir (caso sim, pode se tratar de uma restrição no servidor de origem, e aí o fallback "nova aba" será garantido).