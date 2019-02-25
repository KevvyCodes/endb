<div align="center">
  <h1>Endb – Enhanced Database</h1>
  <p>
    <a href="https://discord.gg/3yXx8CN"><img src="https://discordapp.com/api/guilds/519513445721178133/embed.png" alt="discord-server" /></a>
    <a href="https://www.npmjs.com/package/endb"><img src="https://img.shields.io/npm/v/endb.svg?maxAge=3600" alt="npm-version" /></a>
    <a href="https://www.npmjs.com/package/endb"><img src="https://img.shields.io/npm/dt/endb.svg?maxAge=3600" alt="npm-downloads" /></a>
    <a href="https://david-dm.org/chroventer/endb"><img src="https://img.shields.io/david/chroventer/endb.svg?maxAge=3600" alt="dependencies" /></a>
  </p>
  <p>
    <a href="https://nodei.co/npm/endb/"><img src="https://nodei.co/npm/endb.png?downloads=true&stars=true" alt="npm-info" /></a>
  </p>
</div>

## Installation
**Node.js 8.0.0 or newer is required.**

**Windows**
* Run `npm -g --add-python-to-path install windows-build-tools node-gyp` in CMD/Powershell as administrator
* Restart CMD/Powershell
* Run `npm i endb`

**Mac**
* Install XCode
* Run `npm i -g node-gyp` in Terminal
* Run `node-gyp --python /path/to/python2.7` (skip this step if you didn't install python 3.x)
* Run `npm i endb`

**Linux**
* Run `npm i endb` in Terminal

## Example
```js
const { Database } = require('endb');
const db = new Database();

db.set('account_1234567890', 'password12345'); // -> { key: 'account_1234567890', value: 'password12345' }

db.get('account_1234567890'); // -> password12345

db.has('account_1234567890'); // -> true
```

## Links
* [GitHub](https://github.com/chroventer/endb)
* [NPM](https://npmjs.com/package/endb)

