## Tarefas

- [ ] Criar tarefa em Levantamento de Requisitos sobre implementar o Multi Verso
- [ ] Ver com a Ju sobre o chamado de liberação do Figma
- [ ] Trocar imagens do Discovery
- [ ] Terminar Levantamento de Requisitos
- [ ] Enviar link das documentações pro Luiz
- [ ] Usar IA para entender estrutura/arquitetura do MultiPay
- [ ] 

---
## Observações

1. -----------------------------

---
## Reunião Multi Verso

- opencode
- multi-verso-react
- keycloak -> Apenas no client
- http-client -> É uma lib para autenticação automática
- O Header implementado já faz todas as funções
- component-manifest -> gera json com lista de componentes - instala ele e usa a IA para ler e saber o que implementar. É gerado automaticamente ao fazer build
- Skill: multiverso-consumption -> Tem tudo para a IA instalar o MultiVerso - todo projeto deveria ter ela
- Skill de dark mode - dark-mode.md
- Atenção a Skill de arquitetura pq é diferente do MultiPay
- Tudo em .agent
- .geminiignore
- SmartTable - componente de tabela
- ATK Token, Gemini Cli, opencode
- IA de planejamento
- big-pickle
- playwrite - pega tela 
- mattermost -> https://github.com/mattermost/mattermost

---

SELECT TOP (1000) [Id]
      ,[Description]
      ,[CreatedAt]
  FROM [DB_MULTIPAY].[Multipay].[Status]