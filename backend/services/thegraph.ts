export interface PoolTVLData {
  id: string;
  token0: { symbol: string; id: string };
  token1: { symbol: string; id: string };
  liquidity: string;
  totalValueLockedUSD: string;
  totalValueLockedToken0: string;
  totalValueLockedToken1: string;
}

export async function fetchPoolTVL(poolAddress: string): Promise<PoolTVLData> {
  const SUBGRAPH_ID = process.env.THE_GRAPH_SUBGRAPH_ID;
  const API_KEY = process.env.THE_GRAPH_API_KEY;

  if (!SUBGRAPH_ID || !API_KEY || API_KEY === 'your_the_graph_api_key') {
    throw new Error('THE_GRAPH_API_KEY or THE_GRAPH_SUBGRAPH_ID is missing in environment variables.');
  }

  const endpoint = `https://gateway.thegraph.com/api/${API_KEY}/subgraphs/id/${SUBGRAPH_ID}`;

  const query = `
    query GetPoolTVL($poolAddress: ID!) {
      pool(id: $poolAddress) {
        id
        token0 {
          symbol
          id
        }
        token1 {
          symbol
          id
        }
        liquidity
        totalValueLockedUSD
        totalValueLockedToken0
        totalValueLockedToken1
      }
    }
  `;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      variables: {
        poolAddress: poolAddress.toLowerCase(),
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`The Graph query failed: ${response.statusText}`);
  }

  const { data, errors } = await response.json();
  
  if (errors && errors.length > 0) {
    console.error('GraphQL Errors:', errors);
    throw new Error(`GraphQL query failed: ${errors[0].message}`);
  }

  if (!data || !data.pool) {
    throw new Error('Pool not found in subgraph. Make sure the address is correct and the pool has liquidity.');
  }

  return data.pool as PoolTVLData;
}
