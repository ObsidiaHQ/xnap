# XNAP: MetaMask Snap for Nano

![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

MetaMask Snaps is a system that allows anyone to safely expand the capabilities
of MetaMask. A _snap_ is a program that runs in an isolated environment that
can customize the wallet experience.
Learn more about Snaps [here](https://docs.metamask.io/snaps/).

## Integrating Xnap in your website

Refer to Xnap's [documentation](packages/snap/README.md).

## Project structure

    packages/
    ├── snap/     # Xnap source code
    ├── site/     # Example dapp using the Xnap RPC methods
    ├── snap.xyz/ # snap.xyz website

## Where's the seed?

Xnap automatically uses your MetaMask seed to securely generate private/public keys for you, which can be exported anytime.

## Getting started locally

To interact with (your) Snaps, you will need to install [MetaMask Flask](https://metamask.io/flask/),
a canary distribution for developers that provides access to upcoming features.

Clone the repository and set up the development environment:

    yarn install && yarn start

This serves the snap at `http://localhost:8088`.

**Connecting to Xnap:**

```javascript
const snapId = 'local:http://localhost:8088';
const result: any = await window.ethereum.request({
  method: 'wallet_requestSnaps',
  params: {
    [snapId]: {
      version: '1.0.0', // Version is optional, use it to specify the version range of the snap or leave as empty object
    },
  },
});
```

Refer to the [documentation](packages/snap/README.md) or MetaMask's [guide](https://docs.metamask.io/snaps/how-to/connect-to-a-snap/) for more information.

#### Testing and Linting

Run `yarn test` to run the tests once.

Run `yarn lint` to run the linter, or run `yarn lint:fix` to run the linter and
fix any automatically fixable issues.

## License

This project is dual-licensed under the MIT and Apache 2.0 licenses.
