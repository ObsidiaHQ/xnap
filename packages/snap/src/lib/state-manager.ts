import type { BIP44Node } from "@metamask/key-tree";
import { RpcEndpoint, Account } from "./types";
import { StoreKeys } from "./constants";

interface State extends JSON {
  [StoreKeys.ACCOUNTS]: Account[];
  [StoreKeys.HD_NODE]: BIP44Node | null;
  [StoreKeys.DEFAULT_RPC]: RpcEndpoint | null;
  [StoreKeys.DEFAULT_BLOCK_EXPLORER]: { name: string, endpoint: string } | null;
  [StoreKeys.ALIAS_SUPPORT]: boolean;
}

type StateKey = keyof State;
type StateValue<K extends StateKey> = State[K];

export class StateManager {
  static #state: State | null = null;

  public static async getState<K extends StateKey>(key: K): Promise<StateValue<K> | null> {
    if (!this.#state) {
      this.#state = await this.#retrieveState();
    }
    if (!this.#state) {
      return null;
    }
    return this.#state[key];
  }

  public static async setState<K extends StateKey>(key: K, value: StateValue<K>) {
    if (!this.#state) {
      this.#state = await this.#retrieveState();
    }
    if (!this.#state) {
      this.#state = {} as State;
    }
    this.#state[key] = value;
    await this.#persistState();
  }

  /**
   * @description Retrieve the state from the Snap
   * @returns State as a key-value pair
   */
  static async #retrieveState(): Promise<any> {
    return snap.request({
      method: 'snap_manageState',
      params: { operation: 'get' },
    }) as Promise<any>;
  }

  /**
   * @description Saves the current state in the Snap
   */
  static async #persistState() {
    if (this.#state !== null) {
      await snap.request({
        method: 'snap_manageState',
        params: { operation: 'update', newState: this.#state as any },
      });
    }
  }
}