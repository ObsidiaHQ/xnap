import { ServerOption } from "./interfaces";

export const ServerOptions: ServerOption[] = [
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
    }
];