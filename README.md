# Dial Website
The web portal for [Uncentered Systems](https://uncentered.systems)' Dial app.

Although Dial is a decentralized app built on top of [Kinode](https://github.com/kinode-dao/kinode), our goal is to create a seamless experience for users to interact with the app, requiring no knowledge of the underlying technology.

## Tasks

- Sign in
  - [ ] Email/Password
  - [ ] Twitter
  - [ ] SIWE

## Setup

### Development

```sh
yarn
yarn dev
node server/server.js
```

### Staging

```sh
yarn
PORT=8082 NODE_ENV=staging node server/server.js
yarn build:staging # (OR yarn dev:staging)
serve -s dist -l 3002
```

### Production

```sh
yarn
yarn build
PORT=8083 NODE_ENV=production node server/server.js
serve -s dist -l 3003
```
