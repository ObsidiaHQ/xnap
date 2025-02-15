import type { RpcEndpoint, BlockExplorer } from './types';

export const ALPHABET = '13456789abcdefghijkmnopqrstuwxyz';

export const ZERO_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

export enum RpcAction {
  ACCOUNT_INFO = 'account_info',
  ACCOUNT_HISTORY = 'account_history',
  ACCOUNT_BALANCE = 'account_balance',
  BLOCKS_INFO = 'blocks_info',
  RECEIVABLE = 'receivable',
  PROCESS = 'process',
  WORK_GENERATE = 'work_generate',
  RESOLVE_ALIAS = 'resolve_alias',
}

export const XnapButtonEvents = {
  ADD_ACCOUNT: 'add-account',
  BACK: 'back',
  REFRESH_TXS: 'refresh-txs',
  SHOW_KEYS_CONFIRM: 'show-keys-confirm',
  SHOW_KEYS: 'show-keys',
  SEND_PAGE: 'send-page',
  RECEIVE_PAGE: 'receive-page',
  SETTINGS_PAGE: 'settings-page',
  SWITCH_ACCOUNT: 'switch-account',
  SWITCH_RPC: 'switch-rpc',
  SWITCH_BLOCK_EXPLORER: 'switch-block-explorer',
  RECEIVE_FUNDS_CONFIRM: 'receive-funds-confirm',
  RECEIVE_FUNDS: 'receive-funds',
} as const;

export const XnapFormEvents = {
  SEND_XNO_FORM: 'send-xno-form',
  SWITCH_ACCOUNT_FORM: 'switch-account-form',
  SWITCH_RPC_FORM: 'switch-rpc-form',
  SWITCH_EXPLORER_FORM: 'switch-explorer-form',
  SETTINGS_FORM: 'settings-form',
} as const;

export const StoreKeys = {
  ACCOUNTS: 'accounts',
  DEFAULT_RPC: 'defaultRpc',
  DEFAULT_BLOCK_EXPLORER: 'blockExplorer',
  ALIAS_SUPPORT: 'aliasSupport',
} as const;

export type XnapButtonEventName = (typeof XnapButtonEvents)[keyof typeof XnapButtonEvents];
export type XnapFormEventName = (typeof XnapFormEvents)[keyof typeof XnapFormEvents];

export const RpcEndpoints: RpcEndpoint[] = [
  {
    name: 'Rainstorm City',
    value: 'rainstorm',
    api: 'https://rainstorm.city/api',
    auth: null,
  },
  {
    name: 'NanOslo',
    value: 'nanoslo',
    api: 'https://nanoslo.0x.no/proxy',
    auth: null,
  },
  {
    name: 'SomeNano',
    value: 'somenano',
    api: 'https://node.somenano.com/proxy',
    auth: null,
  },
  {
    name: 'SpyNano',
    value: 'spynano',
    api: 'https://node.spynano.org/proxy',
    auth: null,
  },
] as const;

export const RepAccounts = [
  'nano_1zuksmn4e8tjw1ch8m8fbrwy5459bx8645o9euj699rs13qy6ysjhrewioey', // Nanowallets.guide
  'nano_3chartsi6ja8ay1qq9xg3xegqnbg1qx76nouw6jedyb8wx3r4wu94rxap7hg', // Nano Charts
  'nano_1iuz18n4g4wfp9gf7p1s8qkygxw7wx9qfjq6a9aq68uyrdnningdcjontgar', // NanoTicker / Ricki
  'nano_3msc38fyn67pgio16dj586pdrceahtn75qgnx7fy19wscixrc8dbb3abhbw6', // gr0vity
  'nano_3patrick68y5btibaujyu7zokw7ctu4onikarddphra6qt688xzrszcg4yuo', // Patrick
  'nano_1tk8h3yzkibbsti8upkfa69wqafz6mzfzgu8bu5edaay9k7hidqdunpr4tb6', // rsnano
  'nano_3ekb6tp8ixtkibimyygepgkwckzhds9basxd5zfue4efjnxaan77gsnanick', // Nanick
  'nano_1xckpezrhg56nuokqh6t1stjca67h37jmrp9qnejjkfgimx1msm9ehuaieuq', // Flying Amigos
  'nano_3n7ky76t4g57o9skjawm8pprooz1bminkbeegsyt694xn6d31c6s744fjzzz', // Humble Nano
  'nano_1wenanoqm7xbypou7x3nue1isaeddamjdnc3z99tekjbfezdbq8fmb659o7t', // WeNano
  'nano_14j1gqkn8pekpsapqd8c3kciapphaysf6mgw1spsojzzr6qrtskd9dxtopo7', // Nano-GPT
  'nano_3ktybzzy14zxgb6osbhcc155pwk7osbmf5gbh5fo73bsfu9wuiz54t1uozi1', // Kappture
] as const;

export const BlockExplorers: BlockExplorer[] = [
  {
    name: 'Blocklattice.io',
    endpoint: 'https://blocklattice.io/account/',
  },
  {
    name: 'NanoBrowse',
    endpoint: 'https://nanobrowse.com/account/',
  },
  {
    name: 'Nanexplorer',
    endpoint: 'https://nanexplorer.com/nano/account/',
  },
  {
    name: 'nano.community',
    endpoint: 'https://nano.community/',
  },
] as const;
