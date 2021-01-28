# solhint-remix-plugin

## Development

1. Install dependencies, build & serve the content on port 5000
```
yarn
yarn build
```
2. Open [remix](http://remix.ethereum.org/). Make sure it's using http, not https.
3. Open the plugins section, click "Connect to a Local Plugin"
4. Enter `solhint` as plugin name, `Solhint` as display name, `http://localhost:8000` as URL (or whichever port you are using)
5. To load it in vscode we need to have it hosted on https

Optionally run:
```
yarn
yarn build
rm -rf node_modules/
ipfs add -r .
```

```json
{
  "name": "solhint-dev",
  "displayName": "Solhint development",
  "methods": [],
  "version": "0.0.1-dev",
  "url": "<path to remix-solhint-plugin>/remix-solhint-plugin",
  "description": "Solidity lint",
  "icon": "https://raw.githubusercontent.com/protofire/solhint/master/solhint-icon.png",
  "location": "sidePanel"
}
```