import { RpcAction, RpcEndpoints } from "./constants";
import { RpcEndpoint, TxType } from "./interfaces";
import { StateManager, STORE_KEYS } from "./state-manager";

interface RequestOptions {
    maxRetries?: number;
    timeout?: number;
    skipError?: boolean;
}

type RpcAccountHistory = {
    account: string;
    amount: string;
    local_timestamp: string;
    type: TxType;
    hash: string;
}

type RpcAccountInfo = {
    confirmed_frontier: string,
    confirmed_receivable: string,
    confirmed_representative: string,
    confirmed_balance: string,
    modified_timestamp: string,
}

class RequestError extends Error {
    constructor(
        message: string,
        public status?: number,
        public isValidationFailure?: boolean,
        public reason?: string
    ) {
        super(message);
        this.name = 'RequestError';
    }
}

type RpcResponseTypeMap = {
    [RpcAction.ACCOUNT_INFO]: RpcAccountInfo;
    [RpcAction.ACCOUNT_HISTORY]: { history: RpcAccountHistory[] };
    [RpcAction.BLOCKS_INFO]: { blocks: any, error?: string };
    [RpcAction.RECEIVABLE]: { blocks: Record<string, { amount: string, source: string }> };
    [RpcAction.PROCESS]: { hash: string, error?: string };
    [RpcAction.WORK_GENERATE]: { work: string, hash: string };
}

export async function request<T extends RpcAction>(
    action: T,
    data: any,
    options: RequestOptions = {}
): Promise<RpcResponseTypeMap[T] | null> {
    const {
        maxRetries = 3,
        timeout = 10000,
        skipError = false
    } = options;

    const defaultRpc = await StateManager.getState(STORE_KEYS.DEFAULT_RPC);
    const endpoints = defaultRpc?.api
        ? [
            defaultRpc,
            ...RpcEndpoints.filter(rpc => rpc.api !== defaultRpc.api)
        ]
        : RpcEndpoints;

    let lastError: Error | null = null;

    // Try each endpoint with retries
    for (const endpoint of endpoints) {
        if (!endpoint.api) continue;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const result = await executeRequest(endpoint, action, data, timeout);
                return result;
            } catch (error: any) {
                lastError = error;

                // If it's a validation failure, don't retry
                if (error.isValidationFailure) {
                    break;
                }

                // Wait before retry with exponential backoff
                if (attempt < maxRetries - 1) {
                    await delay(Math.min(1000 * Math.pow(2, attempt), 10000));
                }
            }
        }
    }

    // If we reach here, all endpoints failed
    if (!skipError) {
        if (lastError instanceof RequestError) {
            if (lastError.isValidationFailure) {
                console.error(
                    'Node response failed validation.',
                    lastError.reason,
                    lastError.status
                );
            } else {
                console.error('Node responded with error', lastError.status);
            }
        } else {
            console.error('Request failed:', lastError?.message);
        }

        throw lastError;
    }

    return null;
}

async function executeRequest(
    endpoint: RpcEndpoint,
    action: string,
    data: any,
    timeout: number
): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const options: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(endpoint.auth && { Authorization: endpoint.auth })
            },
            body: JSON.stringify({ ...data, action }),
            signal: controller.signal
        };

        const response = await fetch(endpoint.api, options);

        if (!response.ok) {
            throw new RequestError(
                `HTTP error! status: ${response.status}`,
                response.status
            );
        }

        const result = await response.json();

        // Validate response
        if (!result || typeof result !== 'object') {
            throw new RequestError('Invalid response format', undefined, true, 'Invalid response format');
        }

        return result;
    } finally {
        clearTimeout(timeoutId);
    }
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}