# Experimento de Comparação entre APIs REST e GraphQL do GitHub

Este experimento tem como objetivo avaliar quantitativamente os benefícios da adoção de uma API GraphQL em comparação com uma API REST. Em particular, serão respondidas as seguintes perguntas de pesquisa:

- **RQ1:** Respostas às consultas GraphQL são mais rápidas que respostas às consultas REST?
- **RQ2:** Respostas às consultas GraphQL têm tamanho menor que respostas às consultas REST?

## Metodologia

Para responder a essas perguntas, realizaremos um experimento controlado utilizando consultas REST e GraphQL na API do GitHub. Abaixo estão os detalhes do desenho experimental.

### Desenho do Experimento

1. **Hipóteses:**
   - **Hipótese Nula (H0):** Não há diferença significativa na velocidade de resposta ou no tamanho das respostas entre as APIs REST e GraphQL do GitHub.
   - **Hipótese Alternativa (H1):** A API GraphQL do GitHub é mais rápida e/ou fornece respostas com menor tamanho do que a API REST do GitHub.

2. **Variáveis Dependentes:**
   - **Tempo de resposta** (ms): Tempo entre o envio da consulta e o recebimento completo da resposta.
   - **Tamanho da resposta** (bytes): Tamanho total dos dados retornados em cada consulta.

3. **Variáveis Independentes:**
   - **Tipo de API**: REST vs. GraphQL.
   - **Tipo de consulta**: Diferentes endpoints para dados equivalentes nas duas APIs.

4. **Tratamentos:**
   - **Consulta REST**: Usando endpoints REST específicos da API do GitHub.
   - **Consulta GraphQL**: Usando consultas equivalentes na API GraphQL.

5. **Objetos Experimentais:**
   - **Instância t2.micro da AWS EC2**: Para realizar as consultas em um ambiente controlado.

6. **Tipo de Projeto Experimental:**
   - **Experimento Controlado** com repetições de consultas para cada endpoint.

7. **Quantidade de Medições:**
   - Serão realizadas entre **50 e 100 medições** para cada endpoint em ambas as APIs para obter uma média estatisticamente significativa.

8. **Ameaças à Validade:**
   - **Validade Interna:** Variabilidade de rede pode afetar o tempo de resposta. Realizaremos consultas alternadas e repetidas para reduzir essa variabilidade.
   - **Validade Externa:** Resultados podem não se generalizar para outras APIs REST e GraphQL além do GitHub.

## Endpoints Selecionados

Para garantir comparabilidade, os endpoints selecionados nas APIs REST e GraphQL do GitHub devem fornecer dados equivalentes.

### API REST

1. **Buscar informações de um usuário**
   - Endpoint: `GET /users/{username}`

2. **Listar repositórios de um usuário**
   - Endpoint: `GET /users/{username}/repos`

3. **Buscar detalhes de um repositório específico**
   - Endpoint: `GET /repos/{owner}/{repo}`

### API GraphQL

1. **Buscar informações de um usuário**
   ```graphql
   query {
     user(login: "{username}") {
       id
       name
       bio
       location
       company
     }
   }

query {
  user(login: "{username}") {
    repositories(first: 10) {
      nodes {
        name
        description
        stargazerCount
        forkCount
        createdAt
      }
    }
  }
}

query {
  repository(owner: "{owner}", name: "{repo}") {
    name
    description
    stargazerCount
    forkCount
    issues {
      totalCount
    }
    createdAt
  }
}
