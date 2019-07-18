# Auction Bay

## Requirements

- Node v12.6.0
- npm v6.10.1

## Build

```bash
$ npm install
```

## Generate certificates

```bash
$ openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
```

### Prepare .env

```bash
$ cp .env.example .env
```
Edit `.env` based on your environment.
`.env` is per developer and not commited.

### Run server

Make sure mongod service is active or start it

```bash
$ sudo service mongod start
```

Then run the server
```bash
$ npm run start
```

### Run tests

Endpoint tests with Mocha & Chai

```bash
$ npm test
```