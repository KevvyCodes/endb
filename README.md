# Endb

<p>
  <a href="https://discord.gg/3yXx8CN"><img src="https://discordapp.com/api/guilds/519513445721178133/embed.png" alt="discord-server" /></a>
  <a href="https://www.npmjs.com/package/endb"><img src="https://img.shields.io/npm/v/endb.svg" alt="npm-version" /></a>
  <a href="https://www.npmjs.com/package/endb"><img src="https://img.shields.io/npm/dt/endb.svg" alt="npm-downloads" /></a>
  <a href="https://david-dm.org/endb/endb"><img src="https://img.shields.io/david/endb/endb.svg"
      alt="dependencies" /></a>
  <a href="https://github.com/endb/endb/stargazers"><img src="https://img.shields.io/github/stars/endb/endb.svg?style=social&label=Star"></a>
</p>
<p>
  <a href="https://nodei.co/npm/endb/"><img src="https://nodei.co/npm/endb.png?downloads=true&stars=true" alt="npm-info" /></a>
</p>

## About

Endb – Enhanced Database, is a simplified and powerful database for storing, accessing, and managing database.

- Object-oriented
- Persistent storage
- Configurable
- Performant
- Beginner-friendly

## Installation

**Node.js 10.0.0 or newer is required.**

### Windows

- Run `npm -g --add-python-to-path install windows-build-tools node-gyp` in CMD/Powershell as administrator
- Restart CMD/Powershell
- Run `npm i endb`

### Mac

- Install XCode
- Run `npm i -g node-gyp` in Terminal
- Run `node-gyp --python /path/to/python2.7` (skip this step if you didn't install python 3.x)
- Run `npm i endb`

### Linux

- Run `npm i endb` in Terminal

## Example

```js
const Endb = require('endb');
const db = new Endb.Database({
  name: 'endb', // optional
});

db.set('account_1234567890', 'password12345'); // -> { key: 'account_1234567890', value: 'password12345' }
db.set('account_123456789', {
  id: 123456789,
  password: 'password1234567890',
  checked: true
}); // -> { key: 'account_123456789', value: '{"id":123456789,"password":"password1234567890","checked":true}' }

db.get('account_1234567890'); // -> password12345

db.has('account_1234567890'); // -> true

db.delete('account_1234567890'); // -> true

db.getAll() // -> // -> [ { key: 'account_123456789', value: '{"id":123456789,"password":"password1234567890","checked":true}' } ]

db.deleteAll(); // -> true
```

## Links

- [Browse Documentation](https://endb.js.org)
- [Install using NPM](https://npmjs.com/package/endb)
- [Star on GitHub](https://github.com/endb/endb)
- [Join Discord](https://discord.gg/3yXx8CN)