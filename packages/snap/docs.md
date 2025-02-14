# Xnap RPC API Documentation

Xnap provides several RPC methods that websites can use to interact with the Nano network through MetaMask. All methods are accessible through the `wallet_invokeSnap` MetaMask method and return a JSON object.

## Methods

### xno_getCurrentAddress

Returns the currently active Nano address.

**Parameters:** None

**Returns:**
- `address`: `string | undefined` - The current Nano address or undefined if no address is selected.
- `icon`: `string | undefined` - unique Jazzicon for the address as SVG, or undefined if no address is selected.

**Example:**
```javascript
const response = await window.ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: 'npm:@obsidia/xnap',
    request: {
      method: 'xno_getCurrentAddress'
    }
  }
});

// console.log(response.address); -> "nano_1xyz..."
```

### xno_makeTransaction

Initiates a send transaction. This will prompt the user for confirmation before sending.

**Parameters:**
- `to`: `string` - The recipient's Nano address or a [Nano internet identifier](https://github.com/mistakia/nano-community/blob/cae1dd3938fa1ca3e51c8d672187294bf3bcc8da/docs/getting-started-devs/integrations.md#nano-internet-identifiers).
- `value`: `string` - The amount to send (in nano), use decimal point for fractions.

**Returns:**
- `result`: `string | undefined` - The transaction hash if successful, undefined otherwise

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
        value: '1.5'
      }
    }
  }
});
```

### xno_signMessage

Signs a message using the currently active Nano account.

**Parameters:**
- `message`: `string` - The message to sign

**Returns:**
- `result`: `string | undefined` - The signature if successful, undefined otherwise

**Example:**
```javascript
const response = await window.ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: 'npm:@obsidia/xnap',
    request: {
      method: 'xno_signMessage',
      params: {
        message: 'Hello, Nano!' // or JSON.stringify({msg: "some message to sign"})
      }
    }
  }
});
```

## Error Handling

All methods may throw errors if:
- The method name is not supported
- The parameters are invalid
- The user rejects the request
- There are network issues
- The Snap is not properly initialized

Errors will be returned in the standard MetaMask error format with appropriate error codes and messages.
