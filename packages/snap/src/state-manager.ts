import { BIP44Node } from "@metamask/key-tree";
import { Account } from "libnemo";

export const STORE_KEYS = {
  ACCOUNTS: 'accounts',
  ACTIVE_ACCOUNT: 'activeAccount',
  HD_NODE: 'nanoNode',
} as const;

export interface State extends JSON {
  [STORE_KEYS.ACCOUNTS]: Partial<Account>[];
  [STORE_KEYS.ACTIVE_ACCOUNT]: string | undefined;
  [STORE_KEYS.HD_NODE]: BIP44Node | undefined;
}

type StateKey = keyof State;
type StateValue<K extends StateKey> = State[K];

export class StateManager {
  static #state: State | undefined = undefined;

  public static async getState<K extends StateKey>(key: K): Promise<StateValue<K> | undefined> {
    if (!this.#state) {
      this.#state = await this.#retrieveState();
    }
    if (!this.#state) {
      return undefined;
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
    if (this.#state !== undefined) {
      await snap.request({
        method: 'snap_manageState',
        params: { operation: 'update', newState: this.#state as any },
      });
    }
  }
}