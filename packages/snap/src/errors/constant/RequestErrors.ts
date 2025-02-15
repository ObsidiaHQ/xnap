export const RequestErrors = {
  ChainDisconnected: {
    code: 4901,
    message: 'The provider is disconnected from the requested chain.'
  },
  Disconnected: {
    code: 4900,
    message: 'The provider is disconnected.'
  },
  Internal: {
    code: -32603,
    message: 'An internal error has occurred.'
  },
  InvalidInput: {
    code: -32000,
    message:'The input to the method is invalid.'
  },
  InvalidParams: {
    code: -32602,
    message: 'Method parameters are invalid.'
  },
  InvalidRequest: {
    code: -32600,
    message: 'Request is invalid.'
  },
  LimitExceeded: {
    code: -32005,
    message: 'Limit has been exceeded.'
  },
  MethodNotFound: {
    code: -32601,
    message: 'Method does not exist.'
  },
  MethodNotSupported: {
    code: -32004,
    message: 'Method is not supported.'
  },
  Parse: {
    code: -32700,
    message: 'Request is not valid JSON.'
  },
  ResourceNotFound: {
    code: -32001,
    message: 'Resource does not exist.'
  },
  ResourceUnavailable: {
    code: -32002,
    message: 'Resource is unavailable.'
  },
  TransactionRejected: {
    code: -32003,
    message: 'Transaction has been rejected.'
  },
  Unauthorized: {
    code: 4100,
    message: 'Unauthorized to perform action.'
  },
  UnsupportedMethod: {
    code: 4200,
    message: 'The requested method is not supported by the provider.'
  },
  UserRejectedRequest: {
    code: 4001,
    message: 'The user has rejected the request.'
  }
}
