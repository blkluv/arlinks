import {DispatchResult, AppInfo, GatewayConfig, PermissionType} from "arconnect";
import {CreateTransactionInterface} from "arweave/web";
import Arweave from "arweave";
import Transaction from "arweave/web/lib/transaction";

export type { DispatchResult, CreateTransactionInterface, Arweave, Transaction };

export type Tag = {
  name: string;
  value: string;
}

export type {ArweaveWallet} from "@/types/ArweaveWallet";

export type WalletState = {
  address: string;
  name: string;
  avatar: string;
  permissions: PermissionType[];
  balance: number;
  connected: boolean;
  ready: boolean;
}

export type LinksResponse = {
  title: string,
  source: string,
  timestamp: number,
  removed?: boolean,
}[];

export type ModalState = {
  cyo: {open: boolean},
  removeLink: {
    item: {title: string, idx: number},
    open: boolean
  },
  newLink: {open: boolean},
}
