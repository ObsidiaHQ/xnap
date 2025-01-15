export type State = Record<string, any>;

/**
 * @description Manages the state of the Snap with key-value pairs storage
 */
export class StateManager {
  static #state: State | undefined = undefined;

  /**
   * @description Get the value for the given key
   * @param key - Key to get the value for
   * @returns Value for the given key
   */
  public static async getState(key: string) {
    if (!this.#state) {
      this.#state = await this.#retrieveState();
    }
    if (!this.#state) {
      return undefined;
    }
    return this.#state[key];
  }

  /**
   * @description Set the value for the given key (creates an entry if it does not exist)
   * @param key - Key to set the value for as a string
   * @param value - Value to set for the given key as any
   */
  public static async setState(key: string, value: any) {
    if (!this.#state) {
      this.#state = await this.#retrieveState();
    }
    if (!this.#state) {
      this.#state = {};
    }
    this.#state[key] = value;
    await this.#persistState();
  }

  /**
   * @description Retrieve the state from the Snap
   * @returns State as a key-value pair
   */
  static async #retrieveState(): Promise<State> {
    return snap.request({
      method: 'snap_manageState',
      params: { operation: 'get' },
    }) as Promise<State>;
  }

  /**
   * @description Saves the current state in the Snap
   */
  static async #persistState() {
    if (this.#state !== undefined) {
      await snap.request({
        method: 'snap_manageState',
        params: { operation: 'update', newState: this.#state },
      });
    }
  }
}