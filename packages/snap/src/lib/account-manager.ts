import { type BIP44Node, SLIP10Node } from "@metamask/key-tree";
import { Account as NanoAccount } from "libnemo";
import { remove0x } from "@metamask/utils";
import { StateManager } from "./state-manager";
import { Account } from "./types";
import { accountInfo } from "./nano-rpc";
import { getRandomBlockExplorer, getRandomRPC, isValidAddress } from "./utils";
import { StoreKeys } from "./constants";
export class AccountManager {

    /**
     * Initializes a nano account and the default settings for the snap
     */
    public static async initialize(): Promise<void> {
        const [accounts, rpc, blockExplorer] = await Promise.all([
            StateManager.getState(StoreKeys.ACCOUNTS),
            StateManager.getState(StoreKeys.DEFAULT_RPC),
            StateManager.getState(StoreKeys.DEFAULT_BLOCK_EXPLORER)
        ]);

        if (!rpc) {
            await StateManager.setState(StoreKeys.DEFAULT_RPC, getRandomRPC());
        }

        if (!blockExplorer) {
            await StateManager.setState(StoreKeys.DEFAULT_BLOCK_EXPLORER, getRandomBlockExplorer());
        }

        if (!accounts?.length || accounts.some(a => !this.isValidAccount(a))) {
            await StateManager.setState(StoreKeys.ACCOUNTS, []);
            await this.addAccount();
        }
    }

    /**
     * Adds a new nano account derived from the master HD node. Automatically sets the account as active if it is the first account.
     * @returns A promise that resolves to the newly created account.
     */
    public static async addAccount(): Promise<Account> {
        const hdNode = await this.getHDNode();
        const accounts = await this.getAccounts();

        const newIndex = accounts.length;
        const nanoSlip10Node = await SLIP10Node.fromJSON(hdNode);

        const newAccountNode = await nanoSlip10Node.derive([`slip10:${newIndex}'`]);
        const privKey = remove0x(newAccountNode.toJSON().privateKey || '');

        if (!privKey)
            throw new Error("Failed to derive private key");

        const { address, privateKey, publicKey } = await NanoAccount.fromPrivateKey(privKey);
        const accInfo = (await accountInfo(address));

        const newAccount: Account = {
            address, 
            privateKey, 
            publicKey,
            balance: accInfo?.confirmed_balance || '0', 
            frontier: accInfo?.confirmed_frontier || '', 
            receivable: accInfo?.confirmed_receivable || '0'
        };

        // If this is the first account, set it as active
        if (accounts.length === 0)
            newAccount.active = true;

        await StateManager.setState(StoreKeys.ACCOUNTS, [...accounts, newAccount]);

        return newAccount;
    }

    /**
     * Gets the currently active account
     * @returns A promise that resolves to the active account
     */
    public static async getActiveAccount(): Promise<Account> {
        const accounts = await this.getAccounts();
        if (!accounts.length || !accounts[0])
            throw new Error("No accounts found");

        let activeAccount = accounts.find(acc => acc.active);

        if (!activeAccount)
            activeAccount = await this.setActiveAccount(accounts[0]);

        return activeAccount;
    }

    /**
     * Sets the provided account as the active account.
     * @param account - The account to be set as active.
     * @returns A promise that resolves to the account that has been set as active.
     */
    public static async setActiveAccount(account: Account): Promise<Account> {
        let accounts = await this.getAccounts();
        if (!accounts.length || !accounts[0])
            throw new Error("No accounts found");

        accounts = accounts.map(acc => ({ ...acc, active: acc.address === account.address }));
        await StateManager.setState(StoreKeys.ACCOUNTS, accounts);

        return accounts.find(acc => acc.active) as Account;
    }

    /**
     * @returns Array of all available accounts
     */
    public static async getAccounts(): Promise<Account[]> {
        let accounts = await StateManager.getState(StoreKeys.ACCOUNTS);

        if (!Array.isArray(accounts)) {
            accounts = [];
            await StateManager.setState(StoreKeys.ACCOUNTS, accounts);
        }

        return accounts;
    }

    /**
     * Gets account by address
     * @param address The address of the account to get
     * @returns The account or null if not found
     */
    public static async getAccountByAddress(address: string): Promise<Account | null> {
        let accounts = await StateManager.getState(StoreKeys.ACCOUNTS) || [];
        const account = accounts.find(acc => acc.address === address);

        return account || null;
    }

    /**
     * Retrieves the master Hierarchical Deterministic (HD) node on-demand, based on the BIP44 nano derivation path.
     * @returns A promise that resolves to the master HD node.
     */
    private static async getHDNode(): Promise<BIP44Node> {
        const hdNode = (await snap.request({
            method: 'snap_getBip32Entropy',
            params: {
                path: ["m", "44'", "165'"],
                curve: "ed25519",
            },
        })) as BIP44Node;

        return hdNode;
    }

    /**
     * Basic validatation of an account object
     */
    private static isValidAccount(account: any): boolean {
        return account
            && typeof account.address === 'string'
            && isValidAddress(account.address);
    }
}
