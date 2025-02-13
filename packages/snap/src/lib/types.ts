import { RpcAction } from "./constants";

export type RequestOptions = {
  maxRetries?: number;
  timeout?: number;
  skipError?: boolean;
}

export type RpcAccountHistory = {
  account: string;
  amount: string;
  local_timestamp: string;
  type: TxType;
  hash: string;
}

export type RpcAccountInfo = {
  confirmed_frontier: string,
  confirmed_receivable: string,
  confirmed_representative: string,
  confirmed_balance: string,
  modified_timestamp: string,
  error?: string,
}

export type RpcResponseTypeMap = {
  [RpcAction.ACCOUNT_INFO]: RpcAccountInfo;
  [RpcAction.ACCOUNT_HISTORY]: { history: RpcAccountHistory[] };
  [RpcAction.ACCOUNT_BALANCE]: { balance: string, receivable: string };
  [RpcAction.BLOCKS_INFO]: { blocks: any, error?: string };
  [RpcAction.RECEIVABLE]: { blocks: Record<string, { amount: string, source: string }> };
  [RpcAction.PROCESS]: { hash: string, error?: string };
  [RpcAction.WORK_GENERATE]: { work: string, hash: string };
}

export type Account = {
  address: string;
  publicKey: string;
  privateKey: string | null;
  balance: any;
  frontier?: string;
  receivable?: string;
  active?: boolean;
};

export type TxType = 'receive' | 'send' | 'open' | 'change';

export type InsightProps = {
  from: string;
  to: string;
  value: string;
  origin: string | null;
  balance?: string;
  alias?: string;
};

export type TxConfirmation = {
  from: string;
  to: string;
  value: string;
  confirmed: boolean;
}

export type GetCurrentAddress = {
  method: 'xno_getCurrentAddress';
  params: {};
}

export type MakeTransaction = {
  method: 'xno_makeTransaction';
  params: Record<keyof Pick<InsightProps, 'from' | 'to' | 'value'>, never>;
}

export type SignMessage = {
  method: 'xno_signMessage';
  params: { message: string };
}

export type MetamaskXNORpcRequest =
  | MakeTransaction
  | GetCurrentAddress
  | SignMessage;

export type RpcRequest = {
  origin: string;
  request: MetamaskXNORpcRequest;
};

export type XNOMethodCallback = (
  originString: string,
  requestObject: MetamaskXNORpcRequest,
) => Promise<unknown>;

export type Snap = {
  registerRpcMessageHandler: (fn: XNOMethodCallback) => unknown;
  request<T>(options: {
    method: string;
    params?: unknown[] | Record<string, any>;
  }): Promise<T>;
}

export type SLIP10Node = {
  /**
   * The 0-indexed path depth of this node.
   */
  readonly depth: number;

  /**
   * The fingerprint of the master node, i.e., the node at depth 0. May be
   * undefined if this node was created from an extended key.
   */
  readonly masterFingerprint?: number;

  /**
   * The fingerprint of the parent key, or 0 if this is a master node.
   */
  readonly parentFingerprint: number;

  /**
   * The index of the node, or 0 if this is a master node.
   */
  readonly index: number;

  /**
   * The private key of this node.
   */
  readonly privateKey: string;

  /**
   * The public key of this node.
   */
  readonly publicKey: string;

  /**
   * The chain code of this node.
   */
  readonly chainCode: string;

  /**
   * The name of the curve used by the node.
   */
  readonly curve: 'ed25519' | 'secp256k1';
}

export type RpcEndpoint = {
  name: string;
  value: string;
  api: string;
  auth: string | null;
}

export type BlockExplorer = {
  name: string;
  endpoint: string;
}
