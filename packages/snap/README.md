# Xnap RPC API Documentation

Xnap provides several RPC methods that websites can use to interact with the Nano network through MetaMask. All methods are accessible through the `wallet_invokeSnap` MetaMask method and return a JSON object.

## Connecting to Xnap

```javascript
const result: any = await window.ethereum.request({
  method: 'wallet_requestSnaps',
  params: {
    // the snapId
    'npm:@obsidia/xnap': {
      // Version is optional, use it to specify the version range of the snap or leave as empty object
      version: '1.0.0',
    },
  },
});
```

More information about connecting to a snap can be found in MetaMask's [docs](https://docs.metamask.io/snaps/how-to/allow-automatic-connections/).

## JSON-RPC Methods

### xno_getCurrentAddress

Returns the currently active Nano address and a unique Jazzicon representation.

**Parameters:** None

**Returns:**

- `address`: `string | undefined` - The current Nano address or undefined if no address is selected.
- `icon`: `string | undefined` - unique Jazzicon for the address as an SVG element, or undefined if no address is selected.

**Example:**

```javascript
const response = await window.ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: 'npm:@obsidia/xnap',
    request: {
      method: 'xno_getCurrentAddress',
    },
  },
});

// console.log(response.address); -> "nano_1xyz..."
```

### xno_makeTransaction

Initiates a send transaction. This will prompt the user for confirmation before sending.

**Parameters:**

- `to`: `string` - The recipient's Nano address or a [Nano internet identifier](https://github.com/mistakia/nano-community/blob/cae1dd3938fa1ca3e51c8d672187294bf3bcc8da/docs/getting-started-devs/integrations.md#nano-internet-identifiers).
- `value`: `string` - The amount to send (in nano), use decimal point for fractions.

**Returns:**

- `hash`: `string | undefined` - The transaction hash if successful, undefined otherwise

**Example:**

```javascript
const response = await window.ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: 'npm:@obsidia/xnap',
    request: {
      method: 'xno_makeTransaction',
      params: {
        to: 'nano_1xyz...', // or @username@domain.com
        value: '1.5',
      },
    },
  },
});
```

### xno_signMessage

Requests signing a message using the currently active Nano account.

**Parameters:**

- `message`: `string` - The message to sign

**Returns:**

- `signature`: `string | undefined` - The signature if successful, undefined otherwise

**Example:**

```javascript
const response = await window.ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: 'npm:@obsidia/xnap',
    request: {
      method: 'xno_signMessage',
      params: {
        message: 'Hello, Nano!', // or JSON.stringify({msg: "some message to sign"})
      },
    },
  },
});
```

## Error Handling

All methods may throw errors if:

- The method name is not supported
- The parameters are invalid
- The user rejects the request
- There are network issues
- The Snap is not properly initialized

Errors will be returned in the standard MetaMask error format with appropriate error codes and messages. Full list of error codes can be found [here](src/errors/RequestErrors.ts).

**Example error handling:**

```javascript
window.ethereum
  .request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: 'npm:@obsidia/xnap',
      request: {
        method: 'xno_makeTransaction',
        params: {
          to: 'invalid_nano_address',
          value: '1.5',
        },
      },
    },
  })
  .then((res: any) => {})
  .catch((error: { code: number, message: string }) => {
    console.error(error.message); // "Method parameters are invalid"
  });
```
