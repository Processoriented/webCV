# Dev Notes

## Frontend

### 19-Sep-2017

#### dependencies

```bash
yarn add --dev babel-cli
yarn add --dev babel-preset-env
```

Original from site:

```bash
(
  export PKG=eslint-config-airbnb;
  npm info "$PKG@latest" peerDependencies --json | command sed 's/[\{\},]//g ; s/: /@/g' | xargs npm install --save-dev "$PKG@latest"
)
```

Modified:

```bash
(
  export PKG=eslint-config-airbnb;
  npm info "$PKG@latest" peerDependencies --json | command sed 's/[\{\},]//g ; s/: /@/g' | xargs yarn add --dev "$PKG@latest"
)
```

```bash
yarn add --dev eslint
yarn add --dev eslint-plugin-compat
yarn add --dev flow-bin babel-preset-flow babel-eslint eslint-plugin-flowtype
yarn add --dev jest babel-jest
yarn add --dev husky
yarn add --dev nodemon
yarn add --dev pm2
yarn add --dev rimraf
yarn add babel-polyfill
```

#### Bye-bye CRA

After struggling with CRA generated frontend decided to role my own.

Created branch called CRAfrontend and stored all CRA work there

Created new branch called xfront for my own frontend

## OAuth setup

### 18-Sep-2017

Curl to generate token for local app:

```bash
curl -X POST -d "grant_type=password&username=admin&password=ssn724SDF" -u"YligNZTAGXY6nJ3717tPqFuVf5yb68ymHHqNqJt9:CUzoq4K0Dlg9w9V057vKr3mf8x6fUBtGcssRSdg65NfuPaFHRoOwwOoJTjV9bf9p4yUbeVTvkZ7gWsIJ1WymwazS7Oi2hn3MRcS86jKzfqW9wmzd0DgUSvisNEIoj532" http://localhost:8000/o/token/
```

Example token generated: `rm1HhmuQ0VcJZR168TFLcPswV1tf30`

Example curl using generated 

```bash
curl -H "Authorization: Bearer rm1HhmuQ0VcJZR168TFLcPswV1tf30" http://localhost:8000/users/
```

