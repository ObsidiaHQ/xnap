export type InsightProps = {
  from: string;
  to: string;
  value: string;
  origin: string | null;
};

export interface GetCurrentAddress {
  method: 'xno_getCurrentAddress';
  params: {};
}

export interface MakeTransaction {
  method: 'xno_makeTransaction';
  params: Record<keyof Pick<InsightProps, 'from' | 'to' | 'value'>, never>;
}

export type MetamaskXNORpcRequest =
  | MakeTransaction
  | GetCurrentAddress;

export type XNOMethodCallback = (
  originString: string,
  requestObject: MetamaskXNORpcRequest,
) => Promise<unknown>;

export interface Snap {
  registerRpcMessageHandler: (fn: XNOMethodCallback) => unknown;
  request<T>(options: {
    method: string;
    params?: unknown[] | Record<string, any>;
  }): Promise<T>;
}

export interface SLIP10Node {
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
