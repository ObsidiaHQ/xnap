import { BIP44Node } from "@metamask/key-tree";
import { Account } from "libnemo";
import { ServerOption } from "./interfaces";

export const STORE_KEYS = {
  ACCOUNTS: 'accounts',
  ACTIVE_ACCOUNT: 'activeAccount',
  HD_NODE: 'nanoNode',
  DEFAULT_RPC: 'defaultRpc'
} as const;

interface State extends JSON {
  [STORE_KEYS.ACCOUNTS]: Partial<Account>[];
  [STORE_KEYS.ACTIVE_ACCOUNT]: string | null;
  [STORE_KEYS.HD_NODE]: BIP44Node | null;
  [STORE_KEYS.DEFAULT_RPC]: ServerOption | null;
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