import Arweave from "arweave";


const arweave = Arweave.init({
  host: "localhost",
  port: 1984,
  protocol: 'http'
});

export async function resolveAccount(name: string) {

}