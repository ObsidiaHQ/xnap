import { BIP44Node, SLIP10Node } from "@metamask/key-tree";
import { StateManager, STORE_KEYS } from "./state-manager";
import { remove0x } from "@metamask/utils";
import { Account } from "./interfaces";
import { Account as NanoAccount } from "libnemo";
import { accountInfo } from "./rpc";
import { getRandomRPC } from "./utils";

export class AccountManager {

    /**
     * Initializes the account manager with an HD Node
     */
    public static async initialize(): Promise<void> {
        const [nanoNode, accounts, rpc] = await Promise.all([
            StateManager.getState(STORE_KEYS.HD_NODE),
            StateManager.getState(STORE_KEYS.ACCOUNTS),
            StateManager.getState(STORE_KEYS.DEFAULT_RPC)
        ]);

        let updatedNode = nanoNode;

        if (!rpc) {
            await StateManager.setState(STORE_KEYS.DEFAULT_RPC, getRandomRPC());
        }

        if (!updatedNode) {
            updatedNode = (await snap.request({
                method: 'snap_getBip32Entropy',
                params: {
                    path: ["m", "44'", "165'"],
                    curve: "ed25519",
                },
            })) as BIP44Node;
            await StateManager.setState(STORE_KEYS.HD_NODE, updatedNode);
        }

        if (!accounts?.length || accounts.some(a => !this.isValidAccount(a))) {
            await StateManager.setState(STORE_KEYS.ACCOUNTS, []);
            await this.addAccount();
        }
    }

    /**
     * Adds a new account derived from the HD Node
     * @returns The newly created account
     */
    public static async addAccount(): Promise<Account> {
        const hdNode = await this.getHDNode();
        const accounts = await this.getAccounts();

        const newIndex = accounts.length;
        const nanoSlip10Node = await SLIP10Node.fromJSON(hdNode);

        const newAccountNode = await nanoSlip10Node.derive([`slip10:${newIndex}'`]);
        const privKey = remove0x(newAccountNode.toJSON().privateKey!);
        const { address, privateKey, publicKey } = await NanoAccount.fromPrivateKey(privKey);
        const { confirmed_balance, confirmed_frontier, confirmed_receivable } = await accountInfo(address);

        const newAccount: Account = {
            address, privateKey, balance: confirmed_balance, frontier: confirmed_frontier, receivable: confirmed_receivable, publicKey
        };

        // If this is the first account, set it as active
        if (accounts.length === 0) {
            newAccount.active = true;
        }

        await StateManager.setState(STORE_KEYS.ACCOUNTS, [...accounts, newAccount]);

        return newAccount;
    }

    /**
     * Gets the currently active account
     * @returns The active account or null if none is set
     */
    public static async getActiveAccount(): Promise<Account | null> {
        const accounts = await this.getAccounts();
        let activeAccount = accounts.find(acc => acc.active)!;

        if (!activeAccount) {
            activeAccount = await this.setActiveAccount(accounts[0]!);
        };

        return activeAccount;
    }

    /**
     * Sets the active account by address
     * @param address The address of the account to set as active
     */
    public static async setActiveAccount(account: Account): Promise<Account> {
        let accounts = await this.getAccounts();
        accounts = accounts.map(acc => {
            if (acc.address !== account.address) {
                return ({ ...acc, active: false });
            }
            return ({ ...account, active: true })
        });

        await StateManager.setState(STORE_KEYS.ACCOUNTS, accounts);

        return accounts.find(acc => acc.active)!;
    }

    /**
     * Gets all available accounts
     * @returns Array of accounts
     */
    public static async getAccounts(): Promise<Account[]> {
        let accounts = await StateManager.getState(STORE_KEYS.ACCOUNTS);

        if (!accounts?.length) {
            accounts = [];
            await StateManager.setState(STORE_KEYS.ACCOUNTS, accounts);
        }

        return accounts;
    }

    private static async getHDNode(): Promise<BIP44Node> {
        const hdNode = await StateManager.getState(STORE_KEYS.HD_NODE);

        if (!hdNode) {
            await this.initialize();
            return (await StateManager.getState(STORE_KEYS.HD_NODE))!;
        }

        return hdNode;
    }

    private static isValidAccount(account: any): boolean {
        return account
            && typeof account.address === 'string'
            && account.address?.length > 0;
    }
}
