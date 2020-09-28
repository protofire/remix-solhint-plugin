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