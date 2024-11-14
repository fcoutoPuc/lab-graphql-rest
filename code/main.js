const axios = require('axios');

const GITHUB_TOKEN = '';
const BASE_URL = 'https://api.github.com';
const GRAPHQL_URL = 'https://api.github.com/graphql';
const REPOS_LENGTH = 2;
const CALL_REPS = 2;
const REPOS_INFO_LENGTH = 1;


axios.defaults.headers.common['Authorization'] = `Bearer ${GITHUB_TOKEN}`;


function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function average(arr) {
  return arr.reduce((sum, value) => sum + value, 0) / arr.length;
}

async function fetchTopReposREST() {
  const url = `${BASE_URL}/search/repositories?q=stars:%3E1&sort=stars&order=desc&per_page=${REPOS_LENGTH}`;
  const times = [];
  let responseSize;

  for (let i = 0; i < CALL_REPS; i++) {
    const start = Date.now();
    const response = await axios.get(url);
    const end = Date.now();
    times.push(end - start);
    responseSize = JSON.stringify(response.data).length;
  }

  return { medianTime: median(times), avgTime: average(times), responseSize };
}

async function fetchTopReposGraphQL() {
  const times = [];
  let responseSize;

  for (let i = 0; i < CALL_REPS; i++) {
    console.time(`GraphQL API Call ${i + 1}`);
    const start = Date.now();
    const response = await axios.post(GRAPHQL_URL, {
      query: `
            query {
              search(query: "stars:>1", type: REPOSITORY, first: ${REPOS_LENGTH}) {
                nodes {
                  ... on Repository {
                    name
                    owner {
                      login
                    }
                    stargazerCount
                  }
                }
              }
            }
          `,
    });
    const end = Date.now();
    console.timeEnd(`GraphQL API Call ${i + 1}`);
    times.push(end - start);
    responseSize = JSON.stringify(response.data).length;
  }

  return { medianTime: median(times), avgTime: average(times), responseSize };
}


async function fetchRepoDetailsREST(owner, repo) {
  const repoUrl = `${BASE_URL}/repos/${owner}/${repo}`;
  const times = [];
  let responseSize;

  for (let i = 0; i < CALL_REPS; i++) {
    console.time(`REST Repo Detail Call ${i + 1}`);
    const start = Date.now();
    const repoResponse = await axios.get(repoUrl);
    const end = Date.now();
    console.timeEnd(`REST Repo Detail Call ${i + 1}`);
    times.push(end - start);
    responseSize = JSON.stringify(repoResponse.data).length;
  }

  return { medianTime: median(times), avgTime: average(times), responseSize };
}

async function fetchRepoDetailsGraphQL(owner, repo) {
  const query = {
    query: `
      query {
        repository(owner: "${owner}", name: "${repo}") {
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
    `,
  };
  const times = [];
  let responseSize;

  for (let i = 0; i < CALL_REPS; i++) {
    console.time(`GraphQL Repo Detail Call ${i + 1}`);
    const start = Date.now();
    const response = await axios.post(GRAPHQL_URL, query);
    const end = Date.now();
    console.timeEnd(`GraphQL Repo Detail Call ${i + 1}`);
    times.push(end - start);
    responseSize = JSON.stringify(response.data).length;
  }

  return { medianTime: median(times), avgTime: average(times), responseSize };
}


async function main() {
  // Passo 1 Pegar os 100 repositórios mais famosos
  console.log(`Fetching top ${REPOS_LENGTH} repositories...`);
  const { medianTime, avgTime, responseSize } = await fetchTopReposREST();
  const { medianTime: medianTimeGraphQl, avgTime: avgTimeGraphQL, responseSize: responseSizeGraphQL } = await fetchTopReposGraphQL();
  console.log(`REST API Median Time: ${medianTime}ms, Average Time: ${avgTime}ms, Response Size: ${responseSize} bytes`);
  console.log(`GraphQL API Median Time: ${medianTimeGraphQl}ms, Average Time: ${avgTimeGraphQL}ms, Response Size: ${responseSizeGraphQL} bytes`);

  const topRepos = await axios.get(`${BASE_URL}/search/repositories?q=stars:%3E1&sort=stars&order=desc&per_page=${REPOS_LENGTH}`);
  const randomRepos = topRepos.data.items.slice(0, REPOS_INFO_LENGTH); // Select 10 random repos
  for (const repo of randomRepos) {
    const { owner, name } = repo;
    console.log(`\nFetching details for repository: ${name}`);
    const { medianTime: medianTimeRestRepo, avgTime: avgTimeRestRepo, responseSize: responseTimeRestRepo } = await fetchRepoDetailsREST(owner.login, name);
    const { medianTime: medianTimeGraphQlRepo, avgTime: avgTimeGraphQLRepo, responseSize: responseSizeGraphQLRepo } = await fetchRepoDetailsGraphQL(owner.login, name);
    console.log(`REST API Median Time: ${medianTimeRestRepo}ms, Average Time: ${avgTimeRestRepo}ms, Response Size: ${responseTimeRestRepo} bytes`);
    console.log(`GraphQL API Median Time: ${medianTimeGraphQlRepo}ms, Average Time: ${avgTimeGraphQLRepo}ms, Response Size: ${responseSizeGraphQLRepo} bytes`);
  }

}

main();