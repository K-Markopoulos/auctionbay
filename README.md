# Auction Bay

## Requirements

- Node v12.6.0
- npm v6.10.1

## Build

```
$ npm install
```

## Generate certificates

```
$ openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
```

### Prepare .env

```
$ cp .env.example .env
```
Edit `.env`

### Run server

Make sure mongod service is active or start it

```
$ sudo service mongod start
```

Then run the server
```
$ npm run start
```
