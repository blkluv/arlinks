import {LinksResponse} from "@/types";

export async function getTxs(address: string): Promise<LinksResponse> {
  if(!address) {
    console.log("NO ADDRESS");
    return [];
  }
  const options = {
  'method': 'POST',
  'headers': {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: `query {
    transactions(
      tags:[{name: "App-Name", values: ["ARvrtise"]}]
      owners: ["${address}"]
      sort: HEIGHT_DESC
     ) {
        edges {
          node {
              id
              tags { name value }
              block { timestamp height }
            }
          }
        }
      }`,
      variables: {}
    })
  };
  const req = await fetch("https://arweave.net/graphql", options).then(r => r.json()).catch(err => console.log(err))
  if(!req) return [];
  try {
    // noinspection JSUnresolvedReference
    const links: LinksResponse = Object.values(req.data.transactions.edges.reduce((acc: any, edge: any) => {
      const tags = edge.node.tags;
      const title = tags.find((tag: {name: string, value: string}) => tag.name === "Title")?.value;
      if(title in acc) return acc;
      const timestamp: number|null = edge.node?.block?.timestamp;
      const source = tags.find((tag: {name: string, value: string}) => tag.name === "Source")?.value;
      const removed = tags.find((tag: {name: string, value: string}) => tag.name === "Removed")?.value;
      return {...acc, [title]: {title, source, timestamp, removed}}
    }, {}))
    return links.filter(link => !link?.removed);
  } catch (err) {
    console.log(err)
    return []
  }
}