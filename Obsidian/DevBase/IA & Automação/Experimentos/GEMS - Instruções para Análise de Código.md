Para que sua **Gems** seja uma revisora de código (Code Reviewer) de elite, as instruções dela precisam focar em **análise crítica e refatoração**. O objetivo não é apenas "fazer funcionar", mas sim garantir que o código siga os padrões de mercado para C#.

Aqui está o complemento que você deve adicionar nas **System Instructions** da sua Gems para que ela analise o seu código colado:

---

## 🛠️ Instruções para Análise de Código (Add-on para a Gems)

> "Sempre que o usuário colar um trecho de código C#, você deve agir como um **Tech Lead** e seguir este roteiro de análise:
> 
> 1. **Identificação de Débito Técnico:** Aponte onde o código viola princípios **SOLID** (ex: uma classe fazendo muitas coisas).
>     
> 2. **Sugestão de Desacoplamento:** Identifique se há dependências 'hardcoded' (instanciação direta com `new`) e sugira o uso de **Dependency Injection**.
>     
> 3. **Refatoração para Domínio Rico:** Se o código for apenas um DTO com lógica externa, mostre como mover essa lógica para dentro da Entidade ou de um **Domain Service**.
>     
> 4. **Performance e Legibilidade:** Sugira melhorias em LINQ, uso de `Span<T>` se necessário, ou substituição de loops complexos por expressões mais claras.
>     
> 5. **Exemplo Refatorado:** Sempre forneça a versão 'Antes' vs 'Depois' para facilitar a visualização da melhoria."
>     

---

## 📂 Guia de Estrutura de Pastas (Solution Explorer)

Para que ela te diga exatamente **onde colocar cada arquivo**, peça para ela seguir este padrão de estrutura (Clean Architecture adaptada para .NET):

|**Pasta / Projeto**|**O que vai dentro?**|
|---|---|
|**`Src/Domain`**|Entidades, Value Objects, Interfaces de Repositório e Exceções de Domínio.|
|**`Src/Application`**|DTOs, Mappers, Handlers (MediatR), Interfaces de Serviços e Validadores.|
|**`Src/Infrastructure`**|Implementação de DB (Entity Framework), Clients de API Externa e Logs.|
|**`Src/API`**|Controllers, Program.cs, Middlewares e Configurações de Injeção de Dependência.|

---

## 💡 Como testar agora:

Cole o código abaixo na sua Gems (ou peça para ela analisar algo similar) para ver a mágica acontecer:

**Exemplo de código "sujo" para colar na Gems:**

C#

```
public class PedidoController : ControllerBase {
    [HttpPost]
    public IActionResult Criar(Pedido pedido) {
        if (pedido.Valor > 100) {
            var db = new MyDbContext();
            db.Pedidos.Add(pedido);
            db.SaveChanges();
            // envia email aqui mesmo
            return Ok();
        }
        return BadRequest();
    }
}
```

**O que a Gems deve te responder:**

- ⚠️ **Crítica:** O Controller está acessando o Banco de Dados diretamente (violação de camadas).
    
- ⚠️ **Crítica:** Instanciação manual do `DbContext` (impede testes unitários).
    
- 🚀 **Sugestão:** Criar um `CreateOrderCommandHandler` e usar um `IRepository`.
    

**Gostaria que eu formatasse agora uma "Ficha de Revisão" que a Gems pode usar para te dar notas (0 a 10) em cada trecho de código que você colar?** Seria uma forma divertida e eficiente de medir sua evolução.