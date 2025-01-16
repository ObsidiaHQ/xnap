import { BIP44Node, SLIP10Node } from "@metamask/key-tree";
import { StateManager, STORE_KEYS } from "../state-manager";
import { remove0x } from "@metamask/utils";
import { Account } from "libnemo";

export class AccountManager {

    /**
     * Initializes the account manager with an HD Node
     */
    public static async initialize(): Promise<void> {
        console.log("initialize")
        const [nanoNode, accounts] = await Promise.all([
            StateManager.getState(STORE_KEYS.HD_NODE),
            StateManager.getState(STORE_KEYS.ACCOUNTS)
        ]);

        let updatedNode = nanoNode;
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
    public static async addAccount(): Promise<Pick<Account, 'address' | 'balance' | 'privateKey' | 'publicKey'>> {
        console.log("addAccount")
        const hdNode = await this.getHDNode();
        const accounts = await this.getAccounts();

        const newIndex = accounts.length;
        const nanoSlip10Node = await SLIP10Node.fromJSON(hdNode);

        const newAccountNode = await nanoSlip10Node.derive([`slip10:${newIndex}'`]);
        const privKey = remove0x(newAccountNode.toJSON().privateKey!);
        const { address, privateKey, balance, publicKey } = await Account.fromPrivateKey(privKey);

        await StateManager.setState(STORE_KEYS.ACCOUNTS, [...accounts, { address, privateKey, balance, publicKey }]);

        // If this is the first account, set it as active
        if (accounts.length === 0) {
            await this.setActiveAccount(address);
        }

        return { address, privateKey, balance, publicKey };
    }

    /**
     * Gets the currently active account
     * @returns The active account or undefined if none is set
     */
    public static async getActiveAccount(): Promise<Partial<Account> | undefined> {
        console.log("getActiveAccount")

        const accounts = await this.getAccounts();
        const activeAddress = await StateManager.getState(STORE_KEYS.ACTIVE_ACCOUNT);

        if (!activeAddress) {
            await this.setActiveAccount(accounts[0]!.address!);
        };
        
        return accounts.find(account => account.address === activeAddress);
    }

    /**
     * Sets the active account by address
     * @param address The address of the account to set as active
     */
    public static async setActiveAccount(address: string): Promise<void> {
        console.log("setActiveAccount", address)
        const accounts = await this.getAccounts();
        const accountExists = accounts.some(account => account.address === address);

        if (accountExists) {
            await StateManager.setState(STORE_KEYS.ACTIVE_ACCOUNT, address);
        }
    }

    /**
     * Removes an account by address
     * @param address The address of the account to remove
     */
    public static async removeAccount(address: string): Promise<void> {
        console.log("removeAccount", address)
        const accounts = await this.getAccounts();

        if (accounts.length <= 1) {
            return;
        }

        const accountExists = accounts.some(account => account.address === address);
        if (!accountExists) {
            return;
        }

        const newAccounts = accounts.filter(account => account.address !== address);
        await StateManager.setState(STORE_KEYS.ACCOUNTS, newAccounts);

        const activeAccount = await this.getActiveAccount();
        if (activeAccount?.address === address) {
            await this.setActiveAccount(newAccounts[0]?.address!);
        }
    }

    /**
     * Gets all available accounts
     * @returns Array of accounts
     */
    public static async getAccounts(): Promise<Partial<Account>[]> {
        console.log("getAccounts")
        let accounts = await StateManager.getState(STORE_KEYS.ACCOUNTS);

        if (!accounts?.length) {
            accounts = [];
            await StateManager.setState(STORE_KEYS.ACCOUNTS, accounts);
        }
        
        return accounts;
    }

    private static async getHDNode(): Promise<BIP44Node> {
        console.log("getHDNode")
        const hdNode = await StateManager.getState(STORE_KEYS.HD_NODE);

        if (!hdNode) {
            await this.initialize();
            return (await StateManager.getState(STORE_KEYS.HD_NODE))!;
        }

        return hdNode;
    }

    private static isValidAccount(account: any): boolean {
        console.log(account?.address)
        return account 
            && typeof account.address === 'string' 
            && account.address?.length > 0;
    }
}
