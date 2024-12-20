const axios = require('axios');
const fs = require('fs');

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
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
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
    const start = Date.now();
    const repoResponse = await axios.get(repoUrl);
    const end = Date.now();
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
    const start = Date.now();
    const response = await axios.post(GRAPHQL_URL, query);
    const end = Date.now();
    times.push(end - start);
    responseSize = JSON.stringify(response.data).length;
  }

  return { medianTime: median(times), avgTime: average(times), responseSize };
}

function createAndWriteCSV(filename, header) {
  fs.writeFileSync(filename, `${header}\n`);
}

function appendToCSV(data, filename) {
  const csvData = `${data.join(',')}\n`;
  fs.appendFileSync(filename, csvData);
}

async function main() {
  const passo1Filename = 'passo1_metrics.csv';
  const passo2Filename = 'passo2_metrics.csv';

  // Write headers for each CSV
  createAndWriteCSV(
    passo1Filename,
    'Step,API,MedianTime,AverageTime,ResponseSize'
  );
  createAndWriteCSV(
    passo2Filename,
    'Step,API,MedianTime,AverageTime,ResponseSize'
  );

  console.log(`Fetching top ${REPOS_LENGTH} repositories...`);
  const { medianTime, avgTime, responseSize } = await fetchTopReposREST();
  appendToCSV(
    ['Passo 1', 'REST', medianTime, avgTime, responseSize],
    passo1Filename
  );

  const {
    medianTime: medianTimeGraphQl,
    avgTime: avgTimeGraphQL,
    responseSize: responseSizeGraphQL,
  } = await fetchTopReposGraphQL();
  appendToCSV(
    [
      'Passo 1',
      'GraphQL',
      medianTimeGraphQl,
      avgTimeGraphQL,
      responseSizeGraphQL,
    ],
    passo1Filename
  );

  console.log(
    `REST API Median Time: ${medianTime}ms, Average Time: ${avgTime}ms, Response Size: ${responseSize} bytes`
  );
  console.log(
    `GraphQL API Median Time: ${medianTimeGraphQl}ms, Average Time: ${avgTimeGraphQL}ms, Response Size: ${responseSizeGraphQL} bytes`
  );

  const topRepos = await axios.get(
    `${BASE_URL}/search/repositories?q=stars:%3E1&sort=stars&order=desc&per_page=${REPOS_LENGTH}`
  );
  const randomRepos = topRepos.data.items.slice(0, REPOS_INFO_LENGTH);
  for (const repo of randomRepos) {
    const { owner, name } = repo;
    console.log(`\nFetching details for repository: ${name}`);
    const {
      medianTime: medianTimeRestRepo,
      avgTime: avgTimeRestRepo,
      responseSize: responseTimeRestRepo,
    } = await fetchRepoDetailsREST(owner.login, name);
    appendToCSV(
      [
        'Passo 2',
        'REST',
        medianTimeRestRepo,
        avgTimeRestRepo,
        responseTimeRestRepo,
      ],
      passo2Filename
    );

    const {
      medianTime: medianTimeGraphQlRepo,
      avgTime: avgTimeGraphQLRepo,
      responseSize: responseSizeGraphQLRepo,
    } = await fetchRepoDetailsGraphQL(owner.login, name);
    appendToCSV(
      [
        'Passo 2',
        'GraphQL',
        medianTimeGraphQlRepo,
        avgTimeGraphQLRepo,
        responseSizeGraphQLRepo,
      ],
      passo2Filename
    );

    console.log(
      `REST API Median Time: ${medianTimeRestRepo}ms, Average Time: ${avgTimeRestRepo}ms, Response Size: ${responseTimeRestRepo} bytes`
    );
    console.log(
      `GraphQL API Median Time: ${medianTimeGraphQlRepo}ms, Average Time: ${avgTimeGraphQLRepo}ms, Response Size: ${responseSizeGraphQLRepo} bytes`
    );
  }

  console.log(`Metrics saved to ${passo1Filename} and ${passo2Filename}`);
}

main();
