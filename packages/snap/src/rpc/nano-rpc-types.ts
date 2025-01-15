import * as rpcMethods from './nano';

type RpcMethods = typeof rpcMethods;
type InferArgs<M extends keyof RpcMethods> = RpcMethods[M] extends (
  ...args: infer A
) => unknown
  ? A[0]
  : never;

export type RpcMethodTypes = {
  [Method in keyof RpcMethods]: {
    input: InferArgs<Method>;
    output: ReturnType<RpcMethods[Method]>;
  };
};
